import logo from './logo.svg';
import './App.css';
import React, {useState} from 'react';
import MicRecorder from 'mic-recorder-to-mp3';

const Mp3Recorder = new MicRecorder({bitRate: 128});

function App() {
    const [isRecording, setRecording] = useState(false);
    const [blobURL, setBlobURL] = useState('');
    const [transcript, setTranscript] = useState('...');

    const start = () => {
        Mp3Recorder
            .start()
            .then(() => {
                setRecording(true)
            }).catch((e) => console.error(e));
    };
    const stop = () => {
        Mp3Recorder
            .stop()
            .getMp3()
            .then(([buffer, blob]) => {
                const blobURL = URL.createObjectURL(blob)
                console.log(blobURL)
                setBlobURL(blobURL)
                setRecording(false)
                const formData = new FormData();
                formData.append('language', 'English');
                formData.append('file', new Blob(buffer));
                fetch('http://127.0.0.1:5000/upload', {
                    method: 'POST', body: formData
                })
                    .then(response => response.text())
                    .then(data => {
                        console.log(data)
                        setTranscript(data)
                    });
            }).catch((e) => console.log(e));
    };

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <button onClick={start} disabled={isRecording}>
                    Record
                </button>
                <button onClick={stop} disabled={!isRecording}>
                    Stop
                </button>
                <audio src={blobURL} controls="controls"/>
                <p>{transcript}</p>
            </header>

        </div>
    );
}

export default App;
