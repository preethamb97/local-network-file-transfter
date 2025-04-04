import { useState, useEffect } from 'react';
import api from '../services/api';
import config from '../config';

const useFileTransfer = () => {
    const [files, setFiles] = useState([]);
    const [networkInfo, setNetworkInfo] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [currentDirectory, setCurrentDirectory] = useState('');

    useEffect(() => {
        // Initialize network info
        const initNetworkInfo = async () => {
            try {
                const info = await api.getNetworkInfo();
                setNetworkInfo(info);
            } catch (err) {
                setError('Failed to get network information');
            }
        };

        // Initialize current directory
        const initCurrentDirectory = async () => {
            try {
                const { path } = await api.getCurrentUploadDirectory();
                setCurrentDirectory(path);
            } catch (err) {
                setError('Failed to get current upload directory');
            }
        };

        initNetworkInfo();
        initCurrentDirectory();

        // Set up WebSocket connection
        const socket = api.connectWebSocket((data) => {
            if (data.type === 'files-list') {
                setFiles(data.files);
            }
        });

        return () => {
            socket.close();
        };
    }, []);

    const uploadFiles = async (selectedFiles) => {
        try {
            setError(null);
            setUploadProgress(0);

            // Validate file size
            const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
            if (totalSize > config.fileTransfer.maxFileSize) {
                throw new Error(`Total file size exceeds ${config.fileTransfer.maxFileSize / (1024 * 1024 * 1024)}GB limit`);
            }

            // Validate file types
            const invalidFiles = selectedFiles.filter(file => {
                return !config.fileTransfer.allowedFileTypes.some(type => {
                    if (type.includes('*')) {
                        return file.type.startsWith(type.replace('*', ''));
                    }
                    return file.name.endsWith(type);
                });
            });

            if (invalidFiles.length > 0) {
                throw new Error('Some files have unsupported types');
            }

            await api.uploadFiles(selectedFiles);
            setUploadProgress(100);
        } catch (err) {
            setError(err.message);
        }
    };

    const downloadFile = async (filename) => {
        try {
            setError(null);
            await api.downloadFile(filename);
        } catch (err) {
            setError('Failed to download file');
        }
    };

    const setUploadDirectory = async (directory) => {
        try {
            setError(null);
            const { path } = await api.setUploadDirectory(directory);
            setCurrentDirectory(path);
        } catch (err) {
            setError('Failed to set upload directory');
        }
    };

    return {
        files,
        networkInfo,
        uploadProgress,
        error,
        currentDirectory,
        uploadFiles,
        downloadFile,
        setUploadDirectory
    };
};

export default useFileTransfer; 