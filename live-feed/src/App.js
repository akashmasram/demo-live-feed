import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const App = () => {
    const videoRef = useRef();

    useEffect(() => {
        const video = videoRef.current;
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource('http://<YOUR_BACKEND_URL>/stream');
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = 'http://localhost:8000/stream';
            video.addEventListener('loadedmetadata', () => {
                video.play();
            });
        }
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1>Live Camera Feed</h1>
            <video ref={videoRef} controls style={{ width: '80%', maxWidth: '600px' }} />
        </div>
    );
};

export default App;
