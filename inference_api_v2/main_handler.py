import json
# Import the functions from your other files
from api_fetchers import get_average_ndvi, get_average_rainfall_temp
from inference import predict_loan_details


def get_farmer_loan_profile(user_data_dict):
    """
    Main handler function.
    Takes raw user data, fetches API data, and returns
    both the predictions and the full feature set.
    """

    # 1. Parse core inputs from user data
    try:
        location_str = user_data_dict["location"].replace('"', '')
        lat, lon = map(float, location_str.split(','))

        # Use 'farm_size_sqm' if present, fall back to 'farm_size_in_squire_meter'
        farm_size_sqm = user_data_dict.get('farm_size_sqm',
                                           user_data_dict.get('farm_size_in_squire_meter'))

        if farm_size_sqm is None:
            return {"error": "Missing 'farm_size_sqm' or 'farm_size_in_squire_meter'"}

        farm_size_sqm = int(farm_size_sqm)

    except Exception as e:
        return {"error": f"Failed to parse location/farm_size: {e}"}

    # 2. Fetch data from external APIs
    avg_rainfall, avg_temp = get_average_rainfall_temp(lat, lon)
    avg_ndvi = get_average_ndvi(lat, lon, farm_size_sqm)

    if avg_rainfall is None or avg_temp is None:
        return {"error": "Failed to fetch weather data from API."}
    if avg_ndvi is None:
        return {"error": "Failed to fetch NDVI data from API."}

    # 3. Combine all data into one dictionary
    # Start with a copy of the user's data
    complete_data = user_data_dict.copy()

    # Add the API-fetched data
    complete_data['avg_rainfall'] = avg_rainfall
    complete_data['avg_temp'] = avg_temp
    complete_data['NDVI'] = avg_ndvi

    # Add the parsed lat/lon
    complete_data['latitude'] = lat
    complete_data['longitude'] = lon

    # 4. Run inference
    predictions, final_features = predict_loan_details(complete_data)

    if "error" in predictions:
        return predictions  # Return the error dictionary

    # 5. Return the final combined result
    return {
        "predictions": predictions,
        "features_used_by_model": final_features
    }


# --- EXAMPLE USAGE ---
if __name__ == "__main__":
    # This is the raw data your API will receive from a user
    example_user_data = {
        "location": "\"-1.1900,36.9400\"",
        "crop_type": "Maize",
        "price_of_crop": 55,
        "farm_size_sqm": 12000,  # Using the clean name
        "previous_loans_count": 4,
        "defaulted_loans_count": 1,
        "crop_yield_per_sqm": 0.63,  # Using the clean name
        "total_yield_ksh": 307215,  # Using the clean name
        "seasonal_expense": 55500  # Using the clean name
    }

    print("--- Running Full Inference Pipeline ---")
    final_profile = get_farmer_loan_profile(example_user_data)

    print("\n--- FINAL OUTPUT ---")
    print(json.dumps(final_profile, indent=2))