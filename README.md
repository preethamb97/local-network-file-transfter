# Local Network File Transfer

A lightweight web application for seamless file sharing within local networks. Built with Node.js and React, featuring real-time status updates and support for large files.

## 🚀 Features

- 🔄 Real-time connection status and file transfer progress
- 📁 Drag-and-drop file uploads
- 🔍 Automatic network device discovery
- 💻 Cross-platform support (Windows, macOS, Linux)
- ⚙️ Custom IP configuration
- 🔒 Local network security
- 📊 Progress tracking for large files

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, Socket.IO Client, Axios
- **File Handling**: Multer, fs-extra
- **Configuration**: Environment variables

## 📋 Prerequisites

- Node.js 14 or higher
- npm or yarn package manager

## 🔧 Quick Start

1. Clone and install:
```bash
git clone https://github.com/yourusername/local-network-file-transfter.git
cd local-network-file-transfter
npm install
cd client && npm install
```

2. Configure environment:
```bash
# Backend
cp .env.example .env
# Frontend
cd client && cp .env.example .env
```

3. Start the application:
```bash
# From root directory
npm run dev
```

Access at `http://localhost:3000` or `http://[your-ip]:3000` on your local network.

## ⚙️ Configuration

### Backend (.env)
```env
PORT=5000
HOST=0.0.0.0
UPLOAD_FOLDER=./uploads
TEMP_FOLDER=./temp
MAX_FILE_SIZE=10737418240  # 10GB
```

### Frontend (client/.env)
```env
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_MAX_FILE_SIZE=10737418240
```

## 💡 Usage Guide

1. **File Upload**
   - Click "Upload" or drag files into the upload area
   - Monitor progress in real-time
   - Files are automatically saved to the upload directory

2. **File Download**
   - View available files in the list
   - Click "Download" to save files locally
   - Use the refresh button to update the file list

3. **Network Connection**
   - Automatic network interface detection
   - Visual connection status indicator
   - Custom IP configuration support

## 🔒 Security Notes

- Designed for local network use only
- No built-in authentication (trusted network assumption)
- Configure firewall rules appropriately
- Use in trusted networks only

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 