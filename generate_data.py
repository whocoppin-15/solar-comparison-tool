import os
import json
import pandas as pd
from entsoe import EntsoePandasClient
from datetime import date, timedelta

api_key = os.getenv("ENTSOE_API_KEY")

if not api_key:
    print("❌ ERREUR : La clé API ENTSOE_API_KEY est manquante !")
else:
    print("🔑 Clé API détectée avec succès.")

client = EntsoePandasClient(api_key=api_key)

def process_zone(country, start_dt, end_dt, granularity='1h'):
    tz = "Europe/Paris"
    start_ts = pd.Timestamp(start_dt, tz=tz)
    end_ts = pd.Timestamp(end_dt, tz=tz) + pd.Timedelta(days=1)
    
    try:
        prices = client.query_day_ahead_prices(country_code=country, start=start_ts, end=end_ts)
        df = prices.to_frame(name="price_eur_mwh").reset_index()
        df.columns = ["timestamp", "price_eur_mwh"]
        df["hour"] = df["timestamp"].dt.hour

        if granularity == '15min':
            df_resample = df.set_index("timestamp").resample("15min").ffill().reset_index()
            df_resample["hour"] = df_resample["timestamp"].dt.hour
            df_resample["slot"] = df_resample["timestamp"].dt.strftime("%H:%M")
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

        print(f"✅ Zone {country} traitée avec succès.")

        return {
            "labels": profile.index.tolist(),
            "prices": [round(p, 2) for p in profile.values],
            "baseload": round(baseload, 2),
            "solar_price": round(solar_price, 2),
            "facteur_cannibalisation": round(fc, 2),
            "decote_pct": round(decote, 1)
        }
    except Exception as e:
        print(f"⚠️ Erreur lors de la récupération pour {country} : {e}")
        return None

start = date.today() - timedelta(days=7)
end = date.today() - timedelta(days=1)

zones_list = [
    "FR", "DE_LU", "ES", "BE", "PT", "IT_NORTH", "NL", "CH", "AT", "PL",
    "CZ", "SK", "HU", "RO", "BG", "GR", "DK_1", "DK_2", "SE_3", "FI"
]

output_zones = {}
for z in zones_list:
    res = process_zone(z, start, end, granularity='1h')
    if res is not None:
        output_zones[z] = res

output_data = {
    "period": {"start": str(start), "end": str(end)},
    "zones": output_zones
}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print("✅ Fichier 'data.json' mis à jour avec succès !")
