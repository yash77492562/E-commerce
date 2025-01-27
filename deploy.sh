#!/bin/bash


# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Start/Restart PM2 processes
echo "Starting PM2 processes..."
pm2 start config/ecosystem.config.js

# Set up PM2 to start on system reboot
echo "Setting up PM2 startup..."
pm2 startup ubuntu
pm2 save

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Set up Nginx configuration
echo "Setting up Nginx..."
sudo cp config/nginx.conf /etc/nginx/sites-available/ckmehandicraft
sudo ln -sf /etc/nginx/sites-available/ckmehandicraft /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

echo "Deployment complete!"