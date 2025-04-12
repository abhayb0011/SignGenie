FROM python:3.10-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Use Gunicorn to serve the Flask app (replace `app:app` with `module:app`)
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
