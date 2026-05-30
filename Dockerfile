# Use official lightweight Python image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install system dependencies (needed to build mysqlclient)
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy the entire workspace (both backend and frontend)
COPY . /app/

# Set working directory to backend for executing commands
WORKDIR /app/backend

# Collect static files
RUN python manage.py collectstatic --no-input

# Expose port (Railway overrides this with $PORT env var)
EXPOSE 8000

# Start Daphne ASGI server
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
