import config from '../config';

class ApiService {
    constructor() {
        this.baseUrl = config.api.baseUrl;
        this.wsUrl = config.api.wsUrl;
    }

    async getNetworkInfo() {
        const response = await fetch(`${this.baseUrl}/network-info`);
        return await response.json();
    }

    async getFiles() {
        const response = await fetch(`${this.baseUrl}/files`);
        return await response.json();
    }

    async uploadFiles(files) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    }

    async downloadFile(filename) {
        const response = await fetch(`${this.baseUrl}/download/${filename}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    async setUploadDirectory(directory) {
        const response = await fetch(`${this.baseUrl}/set-upload-dir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ directory })
        });
        return await response.json();
    }

    async getCurrentUploadDirectory() {
        const response = await fetch(`${this.baseUrl}/current-upload-dir`);
        return await response.json();
    }

    connectWebSocket(onMessage) {
        const socket = new WebSocket(this.wsUrl);
        
        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return socket;
    }
}

export default new ApiService(); 