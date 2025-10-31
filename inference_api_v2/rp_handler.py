import runpod
from main_handler import get_farmer_loan_profile
# from model_inference import model, preprocessor  # Import the loaded models

# --- Warm Start: Load Models ---
# The models are already loaded when model_inference.py is imported.
# We just check here to make sure.
# if model is None or preprocessor is None:
#     print("CRITICAL: Models failed to load on start. Handler will fail.")


def handler(event):
    """
    This is the main function that Runpod Serverless will call.
    The 'event' object contains the request payload.
    """
    print("Handler received new event...")

    # 1. Get the raw user data from the request
    # Runpod puts the JSON payload inside 'input'
    user_data = event.get('input')

    if user_data is None:
        return {"error": "No 'input' key found in request."}

    # 2. Call your main function from main_handler.py
    try:
        final_profile = get_farmer_loan_profile(user_data)

        # 3. Return the result
        # Runpod expects a JSON-serializable object (like a dict)
        return final_profile

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": f"An unexpected server error occurred: {str(e)}"}


# --- Start the Runpod Server ---
if __name__ == "__main__":
    print("Starting Runpod serverless handler...")
    runpod.serverless.start({
        "handler": handler
    })