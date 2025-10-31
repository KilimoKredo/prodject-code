import requests

lat, lon = -0.4532, 39.6460
url = (
    f"https://archive-api.open-meteo.com/v1/archive?"
    f"latitude={lat}&longitude={lon}"
    f"&start_date=2024-05-01&end_date=2024-10-29"
    f"&daily=precipitation_sum,temperature_2m_mean"
    f"&timezone=Africa/Nairobi"
)

res = requests.get(url)
data = res.json()

# Extract daily rainfall and temperature arrays
rain_values = data["daily"]["precipitation_sum"]
temp_values = data["daily"]["temperature_2m_mean"]

# Compute averages
avg_rainfall = sum(rain_values) / len(rain_values)
avg_temp = sum(temp_values) / len(temp_values)

print(f"Average rainfall (mm): {avg_rainfall:.2f}")
print(f"Average temperature (°C): {avg_temp:.2f}")
