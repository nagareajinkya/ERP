#!/bin/bash

# SSL Certificate Setup Script for ERP
# Optimized with Absolute Paths and Sudo checks to prevent Rate Limiting.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO] $1${NC}"; }
log_warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
log_error() { echo -e "${RED}[ERROR] $1${NC}"; }

# Use Absolute Path to ensure script works from GitHub Actions SSH
PROJECT_ROOT="/home/ubuntu/ERP"
cd "$PROJECT_ROOT"

# Check .env
if [ ! -f .env ]; then
    log_error ".env file not found at $PROJECT_ROOT/.env"
    exit 1
fi

source .env

if [ -z "$DOMAIN_NAME" ] || [ -z "$SSL_EMAIL" ]; then
    log_error "DOMAIN_NAME or SSL_EMAIL not set in .env"
    exit 1
fi

FULL_DOMAIN="${DOMAIN_NAME}.duckdns.org"
# Important: Absolute path for the certificate check
CERT_PATH="$PROJECT_ROOT/certbot/conf/live/$FULL_DOMAIN/fullchain.pem"

log_info "Setting up SSL for: $FULL_DOMAIN ($SSL_EMAIL)"

# Create directories
mkdir -p certbot/conf certbot/www nginx/conf.d

# Configure Nginx
log_info "Configuring Nginx..."
if [ -f nginx/conf.d/default.conf ]; then
    if grep -q "DOMAIN_PLACEHOLDER" nginx/conf.d/default.conf; then
        sed -i "s/DOMAIN_PLACEHOLDER/$FULL_DOMAIN/g" nginx/conf.d/default.conf
    fi
    sed -i "s/listen 443 ssl http2;/listen 443 ssl; http2 on;/g" nginx/conf.d/default.conf
fi

# --- INTELLIGENT CERTIFICATE LOGIC ---

NEEDS_REAL_CERT=true

# Use 'sudo test -f' because Let's Encrypt folders are root-only (0700)
if sudo test -f "$CERT_PATH"; then
    # Use sudo to read the file for the issuer check
    if sudo openssl x509 -in "$CERT_PATH" -noout -issuer | grep -q "Let's Encrypt"; then
        log_info "Valid Let's Encrypt certificate detected. Skipping fresh request."
        NEEDS_REAL_CERT=false
    else
        log_warn "Existing certificate is a dummy. Replacement required."
    fi
else
    log_info "No certificate found. Creating temporary dummy for Nginx startup..."
    sudo mkdir -p "$PROJECT_ROOT/certbot/conf/live/$FULL_DOMAIN"
    sudo openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
        -keyout "$PROJECT_ROOT/certbot/conf/live/$FULL_DOMAIN/privkey.pem" \
        -out "$CERT_PATH" \
        -subj "/CN=localhost"
    sudo chmod -R 755 "$PROJECT_ROOT/certbot/conf/live/"
fi

# Start Proxy
log_info "Starting nginx-proxy..."
docker compose up -d nginx-proxy
sleep 5

if [ "$NEEDS_REAL_CERT" = true ]; then
    log_info "Requesting REAL SSL certificate..."
    
    # Only delete if we confirmed we are replacing a dummy
    sudo rm -rf "$PROJECT_ROOT/certbot/conf/live/$FULL_DOMAIN"
    sudo rm -rf "$PROJECT_ROOT/certbot/conf/archive/$FULL_DOMAIN"
    sudo rm -f "$PROJECT_ROOT/certbot/conf/renewal/$FULL_DOMAIN.conf"

    docker compose run --rm --entrypoint "certbot" certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$SSL_EMAIL" \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        -d "$FULL_DOMAIN"

    if [ $? -eq 0 ]; then
        log_info "SSL certificate obtained successfully."
        docker compose restart nginx-proxy
    else
        log_error "Failed to obtain SSL. You are likely rate-limited until tonight."
        exit 1
    fi
else
    log_info "Certificate is already real and valid. Running safe renewal check..."
    docker compose run --rm --entrypoint "certbot" certbot renew --quiet
fi

# Final Service Start
log_info "Starting all ERP services..."
docker compose up -d
log_info "SSL Setup Complete! https://$FULL_DOMAIN"