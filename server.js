const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
const corsOptions = {
  origin: '*',
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

// Default upload directory
const defaultUploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(defaultUploadDir);

// Current upload directory
let currentUploadDir = defaultUploadDir;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, currentUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected from:', socket.handshake.address);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('request-files', () => {
    fs.readdir(currentUploadDir, (err, files) => {
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
    currentUploadDir = absolutePath;
    res.json({ message: 'Upload directory set successfully', path: absolutePath });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set upload directory' });
  }
});

// Get current upload directory
app.get('/current-upload-dir', (req, res) => {
  res.json({ path: currentUploadDir });
});

// File upload endpoint
app.post('/upload', upload.array('files'), (req, res) => {
  res.json({ message: 'Files uploaded successfully' });
});

// File download endpoint
app.get('/download/:filename', (req, res) => {
  const file = path.join(currentUploadDir, req.params.filename);
  res.download(file);
});

// Get list of available files
app.get('/files', (req, res) => {
  fs.readdir(currentUploadDir, (err, files) => {
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
  
  res.json({ addresses });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Default upload directory: ${defaultUploadDir}`);
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`- Network (${interfaceName}): http://${interface.address}:${PORT}`);
      }
    });
  });
}); 