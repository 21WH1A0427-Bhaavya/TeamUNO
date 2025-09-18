"""
train_autoencoder_with_risk.py – Train autoencoder, save artifacts, and compute risk scores on training data.
Usage:
    python train_autoencoder_with_risk.py input_data.csv output_scores.csv
"""

import sys
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler, OneHotEncoder, MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.neural_network import MLPRegressor

if len(sys.argv) < 3:
    print("Usage: python train_autoencoder_with_risk.py input.csv output_scores.csv")
    sys.exit(1)

INPUT_CSV = sys.argv[1]
OUTPUT_CSV = sys.argv[2]

# -------- Load Data --------
print("Reading training data:", INPUT_CSV)
df = pd.read_csv(INPUT_CSV, low_memory=False)

# -------- Ensure columns --------
required_cols = ['login_time','session_minutes','device_type','files_accessed',
                 'bytes_downloaded','sensitive_command','failed_logins','command_count']
for c in required_cols:
    if c not in df.columns:
        if c == 'sensitive_command':
            df[c] = 0
        else:
            df[c] = 0.0

# -------- Feature engineering --------
df['login_time'] = pd.to_datetime(df['login_time'], errors='coerce')
df['hour'] = df['login_time'].dt.hour
df['weekday'] = df['login_time'].dt.weekday
df['login_risk'] = ((df['hour'] < 8) | (df['hour'] > 18) | (df['weekday'] >= 5)).astype(int)
df['day'] = df['login_time'].dt.date

# Device categories
top_devices = df['device_type'].value_counts().nlargest(10).index
df['_device_reduced'] = df['device_type'].where(df['device_type'].isin(top_devices), "__OTHER__")

# Build input matrix
base_numeric = df[['session_minutes','files_accessed','bytes_downloaded',
                   'failed_logins','command_count']].apply(pd.to_numeric, errors='coerce').fillna(0.0).values
extra_numeric = df[['sensitive_command','login_risk']].apply(pd.to_numeric, errors='coerce').fillna(0).values

ohe = OneHotEncoder(handle_unknown='ignore', sparse=False)
device_ohe = ohe.fit_transform(df[['_device_reduced']])
X_raw = np.hstack([base_numeric, extra_numeric, device_ohe])

# -------- Imputer + Scaler --------
imp = SimpleImputer(strategy='median')
X_imp = imp.fit_transform(X_raw)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imp)

# -------- Autoencoder training --------
print("Training autoencoder...")
input_dim = X_scaled.shape[1]
mlp = MLPRegressor(hidden_layer_sizes=(input_dim*2, input_dim),
                   activation='relu', max_iter=50, random_state=42)
mlp.fit(X_scaled, X_scaled)

# -------- Compute anomaly scores on training data --------
recon = mlp.predict(X_scaled)
mse = np.mean((X_scaled - recon)**2, axis=1)
threshold = np.percentile(mse, 95)  # 95th percentile as threshold
print("Computed anomaly threshold:", threshold)

df['anomaly_score'] = mse
df['anomaly_flag'] = (df['anomaly_score'] > threshold).astype(int)

# -------- Save artifacts --------
joblib.dump(mlp, "mlp_autoencoder.joblib")
joblib.dump(imp, "autoencoder_imputer.joblib")
joblib.dump(scaler, "feature_scaler.save")
joblib.dump(ohe, "device_ohe.joblib")

# scaler for behavioral features in risk score (to normalize session_minutes etc.)
behaviour_cols = ['session_minutes','files_accessed','bytes_downloaded','failed_logins','command_count']
behaviour_scaler = MinMaxScaler()
df[behaviour_cols] = behaviour_scaler.fit_transform(df[behaviour_cols])
joblib.dump(behaviour_scaler, "behaviour_minmax_scaler.joblib")

# Save threshold
with open("anomaly_threshold.txt","w") as f:
    f.write(str(threshold))

print("All artifacts saved.")

# -------- Compute Risk Score on training data --------
# normalize anomaly score
cap_val = np.percentile(df['anomaly_score'], 95)
A_max = max(cap_val, 1e-9) * 2.0
df['anomaly_norm'] = np.minimum(df['anomaly_score'], A_max)/A_max

# device_risk
device_counts = df['device_type'].value_counts(normalize=True)
df['device_popularity'] = df['device_type'].map(device_counts).fillna(0.0)
df['device_risk'] = 1.0 - df['device_popularity']
if df['device_risk'].max() > 0:
    df['device_risk'] = df['device_risk'] / df['device_risk'].max()

# day_risk: weekends
df['day_risk'] = df['weekday'].apply(lambda x: 0.5 if x >=5 else 0.0)
df['sensitive_command'] = pd.to_numeric(df['sensitive_command'], errors='coerce').fillna(0).clip(0,1)

weights = {
    'anomaly_norm'    : 0.30,
    'anomaly_flag'    : 0.15,
    'login_risk'      : 0.08,
    'day_risk'        : 0.04,
    'session_minutes' : 0.08,
    'files_accessed'  : 0.07,
    'bytes_downloaded': 0.05,
    'failed_logins'   : 0.10,
    'command_count'   : 0.03,
    'sensitive_command':0.06,
    'device_risk'     : 0.04
}
tw = sum(weights.values())
weights = {k:v/tw for k,v in weights.items()}

df['risk_base'] = (
      df['anomaly_norm'] * weights['anomaly_norm']
    + df['anomaly_flag'] * weights['anomaly_flag']
    + df['login_risk'] * weights['login_risk']
    + df['day_risk'] * weights['day_risk']
    + df['session_minutes'] * weights['session_minutes']
    + df['files_accessed'] * weights['files_accessed']
    + df['bytes_downloaded'] * weights['bytes_downloaded']
    + df['failed_logins'] * weights['failed_logins']
    + df['command_count'] * weights['command_count']
    + df['sensitive_command'] * weights['sensitive_command']
    + df['device_risk'] * weights['device_risk']
)
df['risk_score'] = (df['risk_base']*100).clip(0,100)

# rule-based boost
mask_boost = (df['anomaly_flag']==1) & (df['sensitive_command']==1) & (df['login_risk']==1)
df.loc[mask_boost, 'risk_score'] = (df.loc[mask_boost, 'risk_score'] * 1.25).clip(0,100)

# per-day min-max normalization
def per_day_minmax(group):
    minv = group['risk_score'].min()
    maxv = group['risk_score'].max()
    if maxv > minv:
        group['risk_score_norm_day'] = ((group['risk_score'] - minv) / (maxv - minv)) * 100.0
    else:
        group['risk_score_norm_day'] = 0.0
    return group

df = df.groupby('day', group_keys=False).apply(per_day_minmax)
df['risk_score_norm_day'] = df['risk_score_norm_day'].round(2)

# -------- Save results --------
out_cols = ['login_time','device_type','anomaly_score','anomaly_flag','risk_score','risk_score_norm_day']
df.to_csv(OUTPUT_CSV, index=False, columns=[c for c in out_cols if c in df.columns])
print("Saved training data with risk scores to", OUTPUT_CSV)
