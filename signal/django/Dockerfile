# Stage 1: Base build stage
FROM python:3.12-slim AS builder

# Set working directory
WORKDIR /opt/signaling/

# Set environment variables for clean builds
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install Python dependencies
COPY requirements.prod.txt .
RUN python3 -m pip install --upgrade pip \
    && python3 -m pip install --no-cache-dir -r requirements.prod.txt


# Stage 2: Production stage
FROM python:3.12-slim

# Create app user and working directory
RUN useradd -m -r appuser \
    && mkdir /opt/signaling \
    && chown -R appuser /opt/signaling

WORKDIR /opt/signaling/

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy application files
COPY --chown=appuser:appuser rtc_signaling signaling
COPY --chown=appuser:appuser local/settings.prod.py local/settings.prod.py
COPY --chown=appuser:appuser entrypoint.prod.sh entrypoint.prod.sh

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 

# Make the entrypoint executable
RUN chmod +x entrypoint.prod.sh

# Switch to non-root user
USER appuser

# Make the entrypoint executable
EXPOSE 8000

ENTRYPOINT ["/opt/signaling/entrypoint.prod.sh"]

CMD ["gunicorn", "--chdir=/opt/signaling/signaling", "--bind=0.0.0.0:8000", "--workers=3", "rtc_signaling.wsgi:application"]
