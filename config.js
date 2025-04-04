require('dotenv').config();

const config = {
    server: {
        port: process.env.PORT || 5000,
        host: process.env.HOST || '0.0.0.0',
        allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']
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