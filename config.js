require('dotenv').config();
const os = require('os');

// Function to get local network IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName of Object.keys(interfaces)) {
        const interface = interfaces[interfaceName];
        for (const iface of interface) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();

// Function to generate allowed origins for local network
function getAllowedOrigins() {
    const origins = ['http://localhost:3000'];
    // Add all possible local network IPs
    for (let i = 1; i <= 255; i++) {
        origins.push(`http://192.168.1.${i}:3000`);
        origins.push(`http://192.168.0.${i}:3000`);
        origins.push(`http://10.0.0.${i}:3000`);
    }
    return origins;
}

const config = {
    server: {
        port: process.env.PORT || 5000,
        host: process.env.HOST || '0.0.0.0',
        allowedOrigins: process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            getAllowedOrigins()
    },
    fileTransfer: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10737418240, // 10GB default
        uploadFolder: process.env.UPLOAD_FOLDER || './uploads',
        tempFolder: process.env.TEMP_FOLDER || './temp'
    },
    network: {
        discoveryPort: parseInt(process.env.DISCOVERY_PORT) || 5001,
        discoveryInterval: parseInt(process.env.DISCOVERY_INTERVAL) || 5000,
        customIp: process.env.CUSTOM_IP,
        customPort: process.env.CUSTOM_PORT ? parseInt(process.env.CUSTOM_PORT) : null
    }
};

module.exports = config; 