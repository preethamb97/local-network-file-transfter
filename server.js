const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const config = require('./config');

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if the origin is in the allowed list
        if (config.server.allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Check if the origin is a local network IP
            const isLocalNetwork = /^(http|https):\/\/(192\.168\.|10\.0\.0\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin);
            if (isLocalNetwork) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const io = socketIo(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
});

// Ensure upload and temp directories exist
fs.ensureDirSync(config.fileTransfer.uploadFolder);
fs.ensureDirSync(config.fileTransfer.tempFolder);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.fileTransfer.uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: config.fileTransfer.maxFileSize
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected from:', socket.handshake.address);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('request-files', () => {
    fs.readdir(config.fileTransfer.uploadFolder, (err, files) => {
      if (err) {
        socket.emit('error', 'Error reading directory');
        return;
      }
      socket.emit('files-list', files);
    });
  });
});

// Set upload directory endpoint
app.post('/set-upload-dir', (req, res) => {
  const { directory } = req.body;
  if (!directory) {
    return res.status(400).json({ error: 'Directory path is required' });
  }

  try {
    const absolutePath = path.resolve(directory);
    fs.ensureDirSync(absolutePath);
    config.fileTransfer.uploadFolder = absolutePath;
    res.json({ message: 'Upload directory set successfully', path: absolutePath });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set upload directory' });
  }
});

// Get current upload directory
app.get('/current-upload-dir', (req, res) => {
  res.json({ path: config.fileTransfer.uploadFolder });
});

// File upload endpoint
app.post('/upload', upload.array('files'), (req, res) => {
  res.json({ message: 'Files uploaded successfully' });
});

// File download endpoint
app.get('/download/:filename', (req, res) => {
  const file = path.join(config.fileTransfer.uploadFolder, req.params.filename);
  res.download(file);
});

// Get list of available files
app.get('/files', (req, res) => {
  fs.readdir(config.fileTransfer.uploadFolder, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading directory' });
    }
    res.json(files);
  });
});

// Get network information
app.get('/network-info', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const addresses = [];
  
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push({
          address: interface.address,
          interface: interfaceName
        });
      }
    });
  });
  
  res.json({ 
    addresses,
    customIp: config.network.customIp,
    customPort: config.network.customPort
  });
});

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

server.listen(PORT, HOST, () => {
  console.log(`Server running on:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Default upload directory: ${config.fileTransfer.uploadFolder}`);
  
  if (config.network.customIp) {
    console.log(`- Custom IP: ${config.network.customIp}:${config.network.customPort || PORT}`);
  }
  
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`- Network (${interfaceName}): http://${interface.address}:${PORT}`);
      }
    });
  });
}); 