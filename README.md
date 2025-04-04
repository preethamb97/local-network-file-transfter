# Local Network File Transfer

A simple and efficient file transfer application that allows you to share files between devices on the same local network.

## Features

- Transfer files between devices on the same local network
- Simple and intuitive user interface
- Real-time transfer status updates
- Support for multiple file types
- Cross-platform compatibility
- Custom IP configuration support
- Environment-based configuration

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/local-network-file-transfter.git
cd local-network-file-transfter
```

2. Set up the backend (Python):
```bash
# Create and activate virtual environment
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env file with your configuration
```

3. Set up the frontend (Node.js):
```bash
cd client
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env file with your configuration
```

## Configuration

### Backend Configuration (.env)
```env
# Server Configuration
PORT=5000
HOST=0.0.0.0
ALLOWED_ORIGINS=http://localhost:3000

# File Transfer Configuration
MAX_FILE_SIZE=104857600  # 100MB in bytes
UPLOAD_FOLDER=uploads
TEMP_FOLDER=temp

# Network Configuration
DISCOVERY_PORT=5001
DISCOVERY_INTERVAL=5000  # milliseconds
```

### Frontend Configuration (client/.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000

# Network Configuration
REACT_APP_DISCOVERY_PORT=5001
REACT_APP_DISCOVERY_INTERVAL=5000

# UI Configuration
REACT_APP_MAX_FILE_SIZE=104857600
REACT_APP_ALLOWED_FILE_TYPES=image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt
```

## Usage

1. Start the backend server:
```bash
# Make sure you're in the project root directory
python server.py
```

2. Start the frontend development server:
```bash
# In a new terminal, navigate to the client directory
cd client
npm start
```

3. Access the application:
- Open your web browser and navigate to `http://localhost:3000`
- The application will automatically detect other devices on your local network
- To connect to a specific device, enter its IP address in the connection settings

## How to Transfer Files

1. **Sending Files:**
   - Click the "Send Files" button
   - Select the files you want to transfer
   - Choose the recipient device from the list or enter its IP address
   - Click "Send" to start the transfer

2. **Receiving Files:**
   - The application will automatically detect incoming file transfers
   - Accept or decline the transfer request
   - Received files will be saved to your default download location

## Custom IP Connection

To connect to a specific device:
1. Click on "Connection Settings" in the application
2. Enter the target device's IP address
3. Click "Connect"
4. The application will attempt to establish a direct connection to the specified device

## Troubleshooting

- If devices can't see each other:
  - Make sure all devices are connected to the same local network
  - Check if your firewall is blocking the application
  - Verify that the backend server is running
  - Try using the custom IP connection feature

- If file transfers fail:
  - Check your network connection
  - Ensure there's enough disk space on both devices
  - Try restarting the application
  - Verify that the environment variables are correctly set

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 