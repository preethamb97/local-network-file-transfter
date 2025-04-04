# Local Network File Transfer

A simple application that allows you to transfer files between devices on the same local network using Node.js and React.

## Features

- Upload multiple files and folders
- Download files from other devices on the same network
- Real-time file list updates
- Progress bar for uploads
- Modern and responsive UI

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd local-network-file-transfer
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. In a new terminal, start the client:
```bash
npm run client
```

The application will be available at:
- Server: http://localhost:5000
- Client: http://localhost:3000

## Usage

1. Open the application in your web browser
2. The server IP address will be displayed at the top of the page
3. To share files:
   - Click the file input to select files or folders
   - Click "Upload" to send the files to the server
4. To download files:
   - The available files will be listed in the "Available Files" section
   - Click "Download" next to any file to save it to your device
   - Click "Refresh Files" to update the list of available files

## Security Notes

- This application is designed for use on trusted local networks only
- No authentication is implemented, so anyone on the network can access the files
- Use with caution and only on secure, private networks

## License

MIT 