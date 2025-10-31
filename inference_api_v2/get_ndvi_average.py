import requests, time, math, json

API_KEY = "a08019776047c58f673012bdb52768d7"

def create_polygon(lat, lon, size_m):
    side_deg = math.sqrt(size_m) / 111320  # rough conversion meters→degrees
    half = side_deg / 2

    # Properly closed polygon (lon, lat)
    coords = [
        [lon - half, lat - half],
        [lon + half, lat - half],
        [lon + half, lat + half],
        [lon - half, lat + half],
        [lon - half, lat - half]  # must close polygon
    ]

    payload = {
        "name": "FarmPolygon",
        "geo_json": {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]  # must be wrapped in another list
            }
        }
    }

    url = f"http://api.agromonitoring.com/agro/1.0/polygons?appid={API_KEY}&duplicated=true"
    res = requests.post(url, json=payload)

    # Debugging aid
    print("Polygon creation response:", res.status_code, res.text)

    res.raise_for_status()
    return res.json()["id"]

def get_ndvi_average(lat, lon, size_m):
    poly_id = create_polygon(lat, lon, size_m)
    now = int(time.time())
    six_months_ago = now - (6 * 30 * 24 * 3600)

    url = "http://api.agromonitoring.com/agro/1.0/ndvi/history"
    params = {
        "start": six_months_ago,
        "end": now,
        "polyid": poly_id,
        "appid": API_KEY
    }
    res = requests.get(url, params=params)
    res.raise_for_status()

    data = res.json()
    if not data:
        print("No NDVI data found for this polygon.")
        return None

    ndvi_values = [d["data"]["mean"] for d in data if "data" in d]
    return sum(ndvi_values) / len(ndvi_values) if ndvi_values else None


if __name__ == "__main__":
    ndvi = get_ndvi_average(lat=-1.2167, lon=37.9891, size_m=100000)
    print("Average NDVI (last 6 months):", ndvi)
