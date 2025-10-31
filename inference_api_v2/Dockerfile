# Use the official Python 3.12 image as a base
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /

# Copy the requirements file first for efficient caching
COPY requirements.txt /requirements.txt

# Install all Python dependencies
# --no-cache-dir saves space
RUN pip install -r requirements.txt

# Copy all your project files into the container
# This includes .py files and the kilimomodelV3 folder
COPY . /

# Expose the port Runpod will use
EXPOSE 8080

# The command Runpod will use to start your handler
# This starts the lightweight Python server provided by Runpod
# Start the container
CMD ["python3", "-u", "rp_handler.py"]