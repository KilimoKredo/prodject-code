import requests
import time
import math
import json
from datetime import datetime, timedelta

# --- AgroMonitoring (NDVI) ---
# !! IMPORTANT: Store your API key securely (e.g., environment variable) !!
AGRO_MONITORING_API_KEY = "a08019776047c58f673012bdb52768d7"


def _create_agromonitoring_polygon(lat, lon, farm_size_sqm):
    """Helper function to create a polygon for NDVI lookup."""

    # --- API FIX ---
    # The API has a minimum polygon size of 10,000 sqm (1 hectare).
    # If the farm is smaller, we clamp to the minimum size
    # to get a valid NDVI reading for that location.
    MIN_AREA_SQM = 10000
    if farm_size_sqm < MIN_AREA_SQM:
        print(
            f"Warning: Farm size {farm_size_sqm}sqm is below API minimum. Clamping to {MIN_AREA_SQM}sqm for NDVI lookup.")
        area_to_create = MIN_AREA_SQM
    else:
        area_to_create = farm_size_sqm
    # --- END FIX ---

    # Convert square meters to a square side in degrees
    side_meters = math.sqrt(area_to_create)  # Use the clamped area
    side_degrees = side_meters / 111320  # Approx. meters to decimal degrees
    half_side = side_degrees / 2

    # Create polygon coordinates [lon, lat]
    coords = [
        [lon - half_side, lat - half_side],
        [lon + half_side, lat - half_side],
        [lon + half_side, lat + half_side],
        [lon - half_side, lat + half_side],
        [lon - half_side, lat - half_side]  # Close the polygon
    ]

    payload = {
        "name": f"FarmPolygon_{lat}_{lon}",
        "geo_json": {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]  # API expects coords wrapped in a list
            }
        }
    }
    url = f"http://api.agromonitoring.com/agro/1.0/polygons?appid={AGRO_MONITORING_API_KEY}&duplicated=true"

    try:
        res = requests.post(url, json=payload)
        res.raise_for_status()  # Raise an error for bad responses
        return res.json()["id"]
    except requests.exceptions.RequestException as e:
        # This will print the 422 error if it still happens
        print(f"Error creating polygon: {e} - Response: {res.text}")
        return None


def get_average_ndvi(lat, lon, farm_size_sqm):
    """
    Fetches the average NDVI for the last 6 months for a given location.
    """
    print(f"Fetching NDVI for lat={lat}, lon={lon}, size={farm_size_sqm}sqm...")
    # poly_id = _create_agromonitoring_polygon(lat, lon, farm_size_sqm < 10000 ? 10000 : farm_size_sqm)
    poly_id = _create_agromonitoring_polygon(
        lat,
        lon,
        11000 if farm_size_sqm < 11000 else farm_size_sqm
    )

    if not poly_id:
        return None

    # Get dates for the last 6 months
    now = int(time.time())
    six_months_ago = now - (6 * 30 * 24 * 3600)  # Approx 6 months

    url = "http://api.agromonitoring.com/agro/1.0/ndvi/history"
    params = {
        "start": six_months_ago,
        "end": now,
        "polyid": poly_id,
        "appid": AGRO_MONITORING_API_KEY
    }

    try:
        res = requests.get(url, params=params)
        res.raise_for_status()
        data = res.json()

        if not data:
            print("No NDVI data found for this polygon.")
            return None

        # Calculate the average of the 'mean' NDVI value from the history
        ndvi_values = [d["data"]["mean"] for d in data if "data" in d and "mean" in d["data"]]
        if not ndvi_values:
            print("No 'mean' NDVI values found in data.")
            return None

        avg_ndvi = sum(ndvi_values) / len(ndvi_values)
        print(f"Successfully fetched NDVI: {avg_ndvi:.4f}")
        return avg_ndvi

    except requests.exceptions.RequestException as e:
        print(f"Error fetching NDVI data: {e}")
        return None


# --- Open-Meteo (Rainfall & Temp) ---

def get_average_rainfall_temp(lat, lon):
    """
    Fetches the average daily rainfall and temperature for the last 6 months.
    """
    print(f"Fetching weather for lat={lat}, lon={lon}...")

    # Get dates for the last 6 months
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=180)  # Approx 6 months

    url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={lat}&longitude={lon}"
        f"&start_date={start_date}&end_date={end_date}"
        f"&daily=precipitation_sum,temperature_2m_mean"
        f"&timezone=Africa/Nairobi"
    )

    try:
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()

        rain_values = data["daily"]["precipitation_sum"]
        temp_values = data["daily"]["temperature_2m_mean"]

        # Filter out potential null values
        valid_rain = [v for v in rain_values if v is not None]
        valid_temp = [v for v in temp_values if v is not None]

        if not valid_rain or not valid_temp:
            print("Error: No valid weather data returned.")
            return None, None

        avg_rainfall = sum(valid_rain) / len(valid_rain)
        avg_temp = sum(valid_temp) / len(valid_temp)

        print(f"Successfully fetched weather: Rain={avg_rainfall:.2f}, Temp={avg_temp:.2f}")
        return avg_rainfall, avg_temp

    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None, None
    except KeyError:
        print(f"Error: Unexpected response from weather API: {data}")
        return None, None