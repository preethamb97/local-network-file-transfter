import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import config from './config';
import SharedClipboard from './components/SharedClipboard';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [socket, setSocket] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(config.api.baseUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
      setError(null);
      // Request initial files list
      newSocket.emit('request-files');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setConnectionStatus('error');
      setError('Failed to connect to server. Please check if the server is running.');
    });

    newSocket.on('files-list', (files) => {
      setFiles(files);
      setIsRefreshing(false);
    });

    newSocket.on('error', (error) => {
      setError(error);
      setIsRefreshing(false);
    });

    setSocket(newSocket);

    // Get initial network info
    const fetchNetworkInfo = async () => {
      try {
        const response = await axios.get(`${config.api.baseUrl}/network-info`);
        setNetworkInfo(response.data);
      } catch (err) {
        setError('Failed to fetch network information');
      }
    };

    fetchNetworkInfo();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleRefresh = () => {
    if (connectionStatus === 'connected' && socket) {
      setIsRefreshing(true);
      socket.emit('request-files');
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFiles(event.target.files);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFiles) {
      setError('Please select files to upload');
      return;
    }

    if (connectionStatus !== 'connected') {
      setError('Not connected to server');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    try {
      setUploadProgress(0);
      const response = await axios.post(`${config.api.baseUrl}/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setSelectedFiles(null);
      setError(null);
      handleRefresh();
    } catch (err) {
      setError('Failed to upload files');
    }
  };

  const handleDownload = async (filename) => {
    if (connectionStatus !== 'connected') {
      setError('Not connected to server');
      return;
    }

    try {
      const response = await axios.get(`${config.api.baseUrl}/download/${filename}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download file');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Local Network File Transfer</h1>
        <div className="connection-status">
          <span className={`status-indicator ${connectionStatus}`}></span>
          <span className="status-text">
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </span>
        </div>
        {networkInfo && (
          <div className="network-info">
            <h2>Network Information</h2>
            <ul>
              {networkInfo.addresses.map((addr, index) => (
                <li key={index}>
                  {addr.interface}: {addr.address}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <main>
        <SharedClipboard />
        
        <div className="upload-section">
          <h2>Upload Files</h2>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            disabled={connectionStatus !== 'connected'}
          />
          <button 
            onClick={handleUpload} 
            disabled={!selectedFiles || connectionStatus !== 'connected'}
          >
            Upload
          </button>
          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <div className="files-section">
          <div className="files-header">
            <h2>Available Files</h2>
            <button 
              onClick={handleRefresh}
              disabled={connectionStatus !== 'connected' || isRefreshing}
              className="refresh-button"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Files'}
            </button>
          </div>
          {error && <div className="error">{error}</div>}
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file}
                <button 
                  onClick={() => handleDownload(file)}
                  disabled={connectionStatus !== 'connected'}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
