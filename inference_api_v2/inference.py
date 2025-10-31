# import tensorflow as tf
# import pandas as pd
# import numpy as np
# import pickle
# import warnings
# import sklearn
#
# # --- 1. SETTINGS & LOAD MODELS ---
#
# # Suppress TensorFlow warnings
# warnings.filterwarnings('ignore', category=UserWarning, module='tensorflow')
# # Suppress scikit-learn warnings
# warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')
#
# MODEL_FILE_PATH = './kilimomodelV3/multi_head_nn.keras'
# PREPROCESSOR_FILE_PATH = './kilimomodelV3/data_preprocessor.pkl'
#
# # These are the *exact* columns (in order) the preprocessor was trained on.
# # This is critical for the preprocessor.transform() to work.
# EXPECTED_FEATURES = [
#     # Numerical features
#     'NDVI', 'avg_rainfall', 'avg_temp', 'farm_size_sqm',
#     'previous_loans_count', 'defaulted_loans_count', 'total_yield_ksh',
#     'seasonal_expense', 'price_of_crop', 'crop_yield_per_sqm',
#     'net_income', 'profit_margin', 'expense_ratio', 'yield_value_per_sqm',
#     'expense_per_sqm', 'default_rate', 'latitude', 'longitude',
#     'ndvi_x_rainfall', 'temp_x_rainfall', 'price_x_yield',
#     # Categorical features
#     'crop_type'
# ]
#
# # Load models into memory
# try:
#     print(f"Loading model from {MODEL_FILE_PATH}...")
#     model = tf.keras.models.load_model(MODEL_FILE_PATH)
#     print("...Model loaded successfully.")
#
#     print(f"Loading preprocessor from {PREPROCESSOR_FILE_PATH}...")
#     with open(PREPROCESSOR_FILE_PATH, 'rb') as f:
#         preprocessor = pickle.load(f)
#     print("...Preprocessor loaded successfully.")
#
# except FileNotFoundError as e:
#     print(f"ERROR: File not found. Make sure '{e.filename}' is in the same directory.")
#     model = None
#     preprocessor = None
# except Exception as e:
#     print(f"An error occurred during loading: {e}")
#     model = None
#     preprocessor = None
#
#
# # --- 2. PREDICTION FUNCTION ---
#
# def predict_loan_details(raw_data_dict):
#     """
#     Takes a single dictionary of raw farmer data, engineers new features,
#     preprocesses it, and returns a dictionary of predictions.
#
#     :param raw_data_dict: A Python dict with raw feature values.
#     :return: A dict with the 4 predictions.
#     """
#     if model is None or preprocessor is None:
#         return {"error": "Model or preprocessor not loaded."}
#
#     try:
#         # --- A. Feature Engineering ---
#         # Convert to DataFrame to make engineering easier
#         df = pd.DataFrame([raw_data_dict])
#
#         # Rename columns to match training (handle typos, etc.)
#         df.rename(columns={
#             'sesional_expense': 'seasonal_expense',
#             'total_yield(ksh)=H2K2G2': 'total_yield_ksh',
#             'farm_size_in_squire_meter': 'farm_size_sqm',
#             'crop_yeild_per_squiremeter': 'crop_yield_per_sqm'
#         }, inplace=True)
#
#         # 1. Profitability Features
#         df['net_income'] = df['total_yield_ksh'] - df['seasonal_expense']
#         df['profit_margin'] = df['net_income'] / (df['total_yield_ksh'] + 1e-6)
#         df['expense_ratio'] = df['seasonal_expense'] / (df['total_yield_ksh'] + 1e-6)
#         df['yield_value_per_sqm'] = df['total_yield_ksh'] / (df['farm_size_sqm'] + 1e-6)
#         df['expense_per_sqm'] = df['seasonal_expense'] / (df['farm_size_sqm'] + 1e-6)
#
#         # 2. Risk Features
#         df['default_rate'] = df['defaulted_loans_count'] / (df['previous_loans_count'] + 1e-6)
#         if df['previous_loans_count'].iloc[0] == 0 and df['defaulted_loans_count'].iloc[0] > 0:
#             df['default_rate'] = 1.0
#
#         # 3. Geographic Features
#         lat, lon = df['location'].iloc[0].replace('"', '').split(',')
#         df['latitude'] = float(lat)
#         df['longitude'] = float(lon)
#
#         # 4. Agronomic Features
#         df['ndvi_x_rainfall'] = df['NDVI'] * df['avg_rainfall']
#         df['temp_x_rainfall'] = df['avg_temp'] * df['avg_rainfall']
#         df['price_x_yield'] = df['price_of_crop'] * df['crop_yield_per_sqm']
#
#         # --- B. Preprocessing ---
#         # Re-order columns to *exactly* match the preprocessor's training
#         df_ordered = df[EXPECTED_FEATURES]
#
#         # Transform the data (returns a NumPy array)
#         data_processed = preprocessor.transform(df_ordered)
#
#         # --- C. Prediction ---
#         prediction_list = model.predict(data_processed)
#
#         # --- D. Format Output ---
#         output = {
#             'predicted_credict_score': float(prediction_list[0][0][0]),
#             'predicted_interest_rate': float(prediction_list[1][0][0]),
#             'predicted_loan_limit': float(prediction_list[2][0][0]),
#             'predicted_loan_duration': float(prediction_list[3][0][0])
#         }
#
#         return output
#
#     except KeyError as e:
#         return {"error": f"Missing required feature: {e}. Check your input data."}
#     except Exception as e:
#         return {"error": f"An error occurred during prediction: {e}"}
#
#
# # --- 3. EXAMPLE USAGE ---
#
# if __name__ == "__main__":
#     # This is an example of a single farmer's data
#     # This is what your API would receive as a JSON payload
#
#     # NOTE: You MUST replace this with a real data sample
#     # I am using the sample from the front of your CSV file.
#     example_raw_data = {
#         "location": "\"-1.1900,36.9400\"",
#         "NDVI": 0.77,
#         "avg_rainfall": 830,
#         "avg_temp": 21.8,
#         "crop_type": "Maize",
#         "price_of_crop": 55,
#         "farm_size_sqm": 8900,
#         "previous_loans_count": 4,
#         "defaulted_loans_count": 1,
#         "crop_yield_per_sqm": 0.63,
#         "total_yield_ksh": 307215,
#         "seasonal_expense": 55500
#         # The 4 target variables are not needed
#     }
#
#     if model is not None:
#         print("\n--- Running Inference on Example Data ---")
#         prediction = predict_loan_details(example_raw_data)
#
#         if "error" in prediction:
#             print(f"Prediction Failed: {prediction['error']}")
#         else:
#             print("Prediction Successful:")
#             import json
#
#             print(json.dumps(prediction, indent=2))


# @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
# @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
import tensorflow as tf
import pandas as pd
import numpy as np
import pickle
import warnings
import sklearn  # This is needed if your .pkl file uses sklearn

# --- 1. SETTINGS & LOAD MODELS ---
warnings.filterwarnings('ignore', category=UserWarning, module='tensorflow')
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')

MODEL_FILE_PATH = 'kilimomodelV3/multi_head_nn.keras'
PREPROCESSOR_FILE_PATH = 'kilimomodelV3/data_preprocessor.pkl'

# These are the *exact* columns (in order) the preprocessor was trained on.
EXPECTED_FEATURES = [
    'NDVI', 'avg_rainfall', 'avg_temp', 'farm_size_sqm',
    'previous_loans_count', 'defaulted_loans_count', 'total_yield_ksh',
    'seasonal_expense', 'price_of_crop', 'crop_yield_per_sqm',
    'net_income', 'profit_margin', 'expense_ratio', 'yield_value_per_sqm',
    'expense_per_sqm', 'default_rate', 'latitude', 'longitude',
    'ndvi_x_rainfall', 'temp_x_rainfall', 'price_x_yield',
    'crop_type'
]

# Load models into memory
try:
    print(f"Loading model from {MODEL_FILE_PATH}...")
    model = tf.keras.models.load_model(MODEL_FILE_PATH)
    print("...Model loaded successfully.")

    print(f"Loading preprocessor from {PREPROCESSOR_FILE_PATH}...")
    with open(PREPROCESSOR_FILE_PATH, 'rb') as f:
        preprocessor = pickle.load(f)
    print("...Preprocessor loaded successfully.")

except FileNotFoundError as e:
    print(f"CRITICAL ERROR: File not found. '{e.filename}'")
    model = None
    preprocessor = None
except Exception as e:
    print(f"CRITICAL ERROR during loading: {e}")
    model = None
    preprocessor = None


# --- 2. PREDICTION FUNCTION ---

def predict_loan_details(complete_data_dict):
    """
    Takes a single, *complete* dictionary of data (user + API),
    engineers features, preprocesses it, and returns predictions.

    :param complete_data_dict: A Python dict with all raw feature values.
    :return: A tuple: (prediction_dict, features_dict_for_model)
    """
    if model is None or preprocessor is None:
        return {"error": "Model or preprocessor not loaded."}, None

    try:
        # --- A. Feature Engineering ---
        # Convert to DataFrame to make engineering easier
        df = pd.DataFrame([complete_data_dict])

        # Rename columns to match training
        df.rename(columns={
            'sesional_expense': 'seasonal_expense',
            'total_yield(ksh)=H2K2G2': 'total_yield_ksh',
            'farm_size_in_squire_meter': 'farm_size_sqm',
            'crop_yeild_per_squiremeter': 'crop_yield_per_sqm'
        }, inplace=True)

        # 1. Profitability Features
        df['net_income'] = df['total_yield_ksh'] - df['seasonal_expense']
        df['profit_margin'] = df['net_income'] / (df['total_yield_ksh'] + 1e-6)
        df['expense_ratio'] = df['seasonal_expense'] / (df['total_yield_ksh'] + 1e-6)
        df['yield_value_per_sqm'] = df['total_yield_ksh'] / (df['farm_size_sqm'] + 1e-6)
        df['expense_per_sqm'] = df['seasonal_expense'] / (df['farm_size_sqm'] + 1e-6)

        # 2. Risk Features
        df['default_rate'] = df['defaulted_loans_count'] / (df['previous_loans_count'] + 1e-6)
        if df['previous_loans_count'].iloc[0] == 0 and df['defaulted_loans_count'].iloc[0] > 0:
            df['default_rate'] = 1.0

        # 3. Geographic Features (already present from handler)
        # 4. Agronomic Features
        df['ndvi_x_rainfall'] = df['NDVI'] * df['avg_rainfall']
        df['temp_x_rainfall'] = df['avg_temp'] * df['avg_rainfall']
        df['price_x_yield'] = df['price_of_crop'] * df['crop_yield_per_sqm']

        # --- B. Preprocessing ---
        # Re-order columns to *exactly* match the preprocessor's training
        df_ordered = df[EXPECTED_FEATURES]

        # Transform the data (returns a NumPy array)
        data_processed = preprocessor.transform(df_ordered)

        # --- C. Prediction ---
        prediction_list = model.predict(data_processed)

        # --- D. Format Output ---
        predictions = {
            'predicted_credict_score': float(prediction_list[0][0][0]),
            'predicted_interest_rate': float(prediction_list[1][0][0]),
            'predicted_loan_limit': float(prediction_list[2][0][0]),
            'predicted_loan_duration': float(prediction_list[3][0][0])
        }

        # Convert the final feature DataFrame to a dict for returning
        final_features_dict = df_ordered.iloc[0].to_dict()

        return predictions, final_features_dict

    except KeyError as e:
        return {"error": f"Missing required feature: {e}. Check your input data."}, None
    except Exception as e:
        return {"error": f"An error occurred during prediction: {e}"}, None