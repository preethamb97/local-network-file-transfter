import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import config from '../config';

const SharedClipboard = () => {
    const [clipboardData, setClipboardData] = useState(null);
    const [clipboardType, setClipboardType] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [textInput, setTextInput] = useState('');

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(config.api.baseUrl);
        setSocket(newSocket);

        // Socket event handlers
        newSocket.on('clipboard-update', (data) => {
            setClipboardData(data.data);
            setClipboardType(data.type);
            setLastUpdated(new Date(data.timestamp));
            setError(null);
        });

        newSocket.on('error', (error) => {
            setError(error);
        });

        // Request current clipboard data
        newSocket.emit('request-clipboard');

        // Check clipboard permissions
        const checkPermissions = async () => {
            try {
                const permission = await navigator.permissions.query({ name: 'clipboard-read' });
                setHasPermission(permission.state === 'granted');
                
                permission.onchange = () => {
                    setHasPermission(permission.state === 'granted');
                };
            } catch (err) {
                console.log('Clipboard permissions not supported');
            }
        };

        checkPermissions();

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleCopy = async () => {
        try {
            if (!clipboardData) return;

            if (clipboardType === 'text') {
                await navigator.clipboard.writeText(clipboardData);
            } else if (clipboardType === 'image') {
                const response = await fetch(clipboardData);
                const blob = await response.blob();
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
            } else if (clipboardType === 'json') {
                await navigator.clipboard.writeText(JSON.stringify(clipboardData));
            }
            setError(null);
        } catch (err) {
            console.error('Copy error:', err);
            setError('Failed to copy to clipboard. Please check browser permissions.');
        }
    };

    const handlePaste = async () => {
        try {
            if (!hasPermission) {
                // Request permission
                try {
                    await navigator.clipboard.read();
                    setHasPermission(true);
                } catch (err) {
                    setError('Clipboard access denied. Please grant permission to access clipboard.');
                    return;
                }
            }

            const items = await navigator.clipboard.read();
            for (const item of items) {
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        const reader = new FileReader();
                        reader.onload = () => {
                            socket.emit('clipboard-update', {
                                data: reader.result,
                                type: 'image'
                            });
                        };
                        reader.readAsDataURL(blob);
                    } else if (type === 'text/plain') {
                        const text = await item.getType(type);
                        const textData = await text.text();
                        try {
                            // Check if it's JSON
                            const jsonData = JSON.parse(textData);
                            socket.emit('clipboard-update', {
                                data: jsonData,
                                type: 'json'
                            });
                        } catch {
                            // Regular text
                            socket.emit('clipboard-update', {
                                data: textData,
                                type: 'text'
                            });
                        }
                    }
                }
            }
            setError(null);
        } catch (err) {
            console.error('Paste error:', err);
            setError('Failed to paste from clipboard. Please check browser permissions.');
        }
    };

    const handleTextInputChange = (e) => {
        setTextInput(e.target.value);
    };

    const handleTextShare = () => {
        if (!textInput.trim()) {
            setError('Please enter some text to share');
            return;
        }

        socket.emit('clipboard-update', {
            data: textInput,
            type: 'text'
        });
        setTextInput('');
        setError(null);
    };

    const handleCopyAll = async () => {
        try {
            if (!clipboardData) return;

            let textToCopy = '';
            switch (clipboardType) {
                case 'text':
                    textToCopy = clipboardData;
                    break;
                case 'json':
                    textToCopy = JSON.stringify(clipboardData, null, 2);
                    break;
                case 'image':
                    // For images, we'll copy the image URL
                    textToCopy = clipboardData;
                    break;
                default:
                    textToCopy = String(clipboardData);
            }

            await navigator.clipboard.writeText(textToCopy);
            setError(null);
        } catch (err) {
            console.error('Copy all error:', err);
            setError('Failed to copy content. Please check browser permissions.');
        }
    };

    const renderClipboardContent = () => {
        if (!clipboardData) return <p>No clipboard data available</p>;

        switch (clipboardType) {
            case 'text':
                return <pre className="clipboard-text">{clipboardData}</pre>;
            case 'image':
                return <img src={clipboardData} alt="Shared clipboard image" className="clipboard-image" />;
            case 'json':
                return <pre className="clipboard-json">{JSON.stringify(clipboardData, null, 2)}</pre>;
            default:
                return <p>Unknown clipboard type</p>;
        }
    };

    return (
        <div className="shared-clipboard">
            <h2>Shared Clipboard</h2>
            {error && <div className="error">{error}</div>}
            
            <div className="text-input-section">
                <textarea
                    value={textInput}
                    onChange={handleTextInputChange}
                    placeholder="Type or paste text here to share..."
                    className="clipboard-textarea"
                />
                <button 
                    onClick={handleTextShare}
                    disabled={!textInput.trim()}
                    className="share-text-button"
                >
                    Share Text
                </button>
            </div>

            <div className="clipboard-actions">
                <button 
                    onClick={handlePaste}
                    title={!hasPermission ? "Click to grant clipboard permission" : "Paste to share"}
                >
                    {!hasPermission ? "Grant Permission" : "Paste to Share"}
                </button>
                <button 
                    onClick={handleCopy} 
                    disabled={!clipboardData}
                    title="Copy to clipboard"
                >
                    Copy to Clipboard
                </button>
                <button 
                    onClick={handleCopyAll} 
                    disabled={!clipboardData}
                    title="Copy all content"
                    className="copy-all-button"
                >
                    Copy All
                </button>
            </div>

            <div className="clipboard-content">
                {renderClipboardContent()}
            </div>

            {lastUpdated && (
                <div className="clipboard-timestamp">
                    Last updated: {lastUpdated.toLocaleString()}
                </div>
            )}
        </div>
    );
};

export default SharedClipboard; 