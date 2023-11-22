import whisper
from flask import Flask, render_template, request
import os
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


app.config["UPLOAD_DIR"] = "uploads"
@app.route("/upload", methods = ["GET", "POST"])
@cross_origin()
def upload():
    if request.method == 'POST':
        print('receiving')
        print(request)       
        print(request.files)       
        file = request.files['file']
        uploadedFile = os.path.join(app.config['UPLOAD_DIR'], file.filename)
        file.save(uploadedFile)

        model = whisper.load_model("tiny")

        # load audio and pad/trim it to fit 30 seconds
        audio = whisper.load_audio(uploadedFile)
        audio = whisper.pad_or_trim(audio)

        # make log-Mel spectrogram and move to the same device as the model
        mel = whisper.log_mel_spectrogram(audio).to(model.device)

        # detect the spoken language
        _, probs = model.detect_language(mel)
        print(f"Detected language: {max(probs, key=probs.get)}")

        # decode the audio
        options = whisper.DecodingOptions(fp16 =  False)
        result = whisper.decode(model, mel, options)

        # print the recognized text
        print(result.text)
        return result.text

    return render_template("upload.html", msg = "")

if __name__ == "__main__":
    app.run()
