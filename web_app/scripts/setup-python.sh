#!/bin/bash
# Setup Python dependencies for the habitability prediction model

echo "Installing Python dependencies for habitability prediction..."

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "Error: pip3 is not installed. Please install Python 3 and pip3."
    exit 1
fi

# Install required packages from requirements.txt if it exists
if [ -f "requirements.txt" ]; then
    pip3 install --upgrade -r requirements.txt
else
    # Fallback to manual installation
    pip3 install --upgrade joblib scikit-learn numpy requests
fi

if [ $? -eq 0 ]; then
    echo "✓ Python dependencies installed successfully!"
    echo ""
    echo "You can now run predictions using the model."
else
    echo "✗ Failed to install Python dependencies."
    exit 1
fi
