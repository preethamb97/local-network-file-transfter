const config = {
    api: {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
        wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:5000'
    },
    network: {
        discoveryPort: parseInt(process.env.REACT_APP_DISCOVERY_PORT) || 5001,
        discoveryInterval: parseInt(process.env.REACT_APP_DISCOVERY_INTERVAL) || 5000,
        customIp: process.env.REACT_APP_CUSTOM_IP,
        customPort: process.env.REACT_APP_CUSTOM_PORT ? parseInt(process.env.REACT_APP_CUSTOM_PORT) : null
    },
    fileTransfer: {
        maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 10737418240, // 10GB default
        allowedFileTypes: process.env.REACT_APP_ALLOWED_FILE_TYPES ? 
            process.env.REACT_APP_ALLOWED_FILE_TYPES.split(',') : 
            ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
    }
};

export default config; 