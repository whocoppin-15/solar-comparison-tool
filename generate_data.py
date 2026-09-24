import os
import json
import pandas as pd
from entsoe import EntsoePandasClient
from datetime import date, timedelta

# Récupération de la clé API depuis les secrets GitHub
api_key = os.getenv("ENTSOE_API_KEY")
client = EntsoePandasClient(api_key=api_key)

def process_zone(country, start_dt, end_dt, granularity='1h'):
    tz = "Europe/Paris"
    start_ts = pd.Timestamp(start_dt, tz=tz)
    end_ts = pd.Timestamp(end_dt, tz=tz) + pd.Timedelta(days=1)
    
    prices = client.query_day_ahead_prices(country, start=start_ts, end=end_ts)
    df = prices.to_frame(name="price_eur_mwh").reset_index()
    df.columns = ["timestamp", "price_eur_mwh"]
    df["hour"] = df["timestamp"].dt.hour

    if granularity == '15min':
        df_resample = df.set_index("timestamp").resample("15min").ffill().reset_index()
        df_resample["hour"] = df_resample["timestamp"].dt.hour
        df_resample["slot"] = df_resample["timestamp"].dt.strftime("%H:%M")
        solar_mask = (df_resample["hour"] >= 10) & (df_resample["hour"] <= 17)
    else:
        df_resample = df.set_index("timestamp").resample("1h").mean().reset_index()
        df_resample["hour"] = df_resample["timestamp"].dt.hour
        df_resample["slot"] = df_resample["hour"].apply(lambda h: f"{h:02d}:00")
        solar_mask = (df_resample["hour"] >= 10) & (df_resample["hour"] <= 17)

    profile = df_resample.groupby("slot")["price_eur_mwh"].mean()
    
    baseload = float(df_resample["price_eur_mwh"].mean())
    solar_price = float(df_resample[solar_mask]["price_eur_mwh"].mean())
    fc = solar_price / baseload if baseload != 0 else 0
    decote = (1 - fc) * 100

    return {
        "labels": profile.index.tolist(),
        "prices": [round(p, 2) for p in profile.values],
        "baseload": round(baseload, 2),
        "solar_price": round(solar_price, 2),
        "facteur_cannibalisation": round(fc, 2),
        "decote_pct": round(decote, 1)
    }

# Calcul sur les 7 derniers jours
start = date.today() - timedelta(days=7)
end = date.today() - timedelta(days=1)

output_data = {
    "period": {"start": str(start), "end": str(end)},
    "zones": {
        "FR": process_zone("FR", start, end, granularity='1h'),
        "DE_LU": process_zone("DE_LU", start, end, granularity='1h'),
        "ES": process_zone("ES", start, end, granularity='1h'),
        "BE": process_zone("BE", start, end, granularity='1h'),
        "PT": process_zone("PT", start, end, granularity='1h'),
        "IT_NORTH": process_zone("IT_NORTH", start, end, granularity='1h'),
        "NL": process_zone("NL", start, end, granularity='1h'),
        "CH": process_zone("CH", start, end, granularity='1h'),
        "AT": process_zone("AT", start, end, granularity='1h'),
        "PL": process_zone("PL", start, end, granularity='1h'),
        "CZ": process_zone("CZ", start, end, granularity='1h'),
        "SK": process_zone("SK", start, end, granularity='1h'),
        "HU": process_zone("HU", start, end, granularity='1h'),
        "RO": process_zone("RO", start, end, granularity='1h'),
        "BG": process_zone("BG", start, end, granularity='1h'),
        "GR": process_zone("GR", start, end, granularity='1h'),
        "DK_1": process_zone("DK_1", start, end, granularity='1h'),
        "DK_2": process_zone("DK_2", start, end, granularity='1h'),
        "SE_3": process_zone("SE_3", start, end, granularity='1h'),
        "FI": process_zone("FI", start, end, granularity='1h')
    }
}

# Sauvegarde dans data.json
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print("✅ Fichier 'data.json' généré avec succès !")
