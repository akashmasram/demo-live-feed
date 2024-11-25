const express = require('express');
const http = require('http');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
app.use(cors());

const hlsDirectory = path.join(__dirname, 'hls');
if (!fs.existsSync(hlsDirectory)) {
    fs.mkdirSync(hlsDirectory, { recursive: true });
}

app.use(express.static(path.join(__dirname, 'hls')));

// RTSP URL for CP Plus E24A camera
const rtspUrl = "rtsp://192.168.1.23:5543/live/channel0";
const hlsOutputPath = path.join(__dirname, 'hls', 'stream.m3u8');

// Ensure the HLS directory exists
if (!fs.existsSync(path.join(__dirname, 'hls'))) {
    fs.mkdirSync(path.join(__dirname, 'hls'));
}

// Start streaming RTSP to HLS
const startStream = () => {
    ffmpeg(rtspUrl)
        .outputOptions([
            '-c:v libx264',            // Use H.264 codec
            '-preset ultrafast',       // Fast encoding
            '-crf 28',                 // Quality level
            '-hls_time 2',             // Segment duration
            '-hls_list_size 3',        // Playlist size
            '-hls_flags delete_segments', // Clean old segments
            '-start_number 0'          // Segment numbering starts at 0
        ])
        .output(hlsOutputPath)
        .on('start', () => console.log('FFmpeg streaming started'))
        .on('error', (err) => console.error(`FFmpeg error: ${err.message}`))
        .on('end', () => console.log('FFmpeg streaming ended'))
        .run();
};

// Endpoint to serve HLS stream
app.get('/stream', (req, res) => {
    res.sendFile(hlsOutputPath);
});



app.get('/check-rtsp', (req, res) => {
    exec(`ffmpeg -i ${rtspUrl} -t 5 -f null -`, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send(`RTSP test failed: ${stderr}`);
        } else {
            res.send(`RTSP test succeeded: ${stdout}`);
        }
    });
});

// Start the stream when the server starts
startStream();

// Start the server
const PORT = process.env.PORT || 8000;
http.createServer(app).listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
