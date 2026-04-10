# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy the requirements file
COPY backend/requirements.txt ./

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and frontend files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Command to run the application using uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
