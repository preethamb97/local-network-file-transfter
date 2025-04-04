// Function to get the server URL based on the current environment
function getServerUrl() {
    // If we're in development, use the current hostname
    if (process.env.NODE_ENV === 'development') {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = '5000';
        return `${protocol}//${hostname}:${port}`;
    }
    // In production, use the environment variable or fallback to localhost
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
}

const serverUrl = getServerUrl();

const config = {
    api: {
        baseUrl: serverUrl,
        wsUrl: serverUrl.replace('http', 'ws')
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