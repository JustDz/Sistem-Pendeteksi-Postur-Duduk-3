from flask import Flask, Response, request, jsonify
import cv2
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

# Initialize global variable for video 
video_capture = None
is_streaming = False

def generate_frames():
    """Generator function to read frames from the video capture and encode them as JPEG."""
    global video_capture, is_streaming
    while is_streaming and video_capture and video_capture.isOpened():
        success, frame = video_capture.read()
        if not success:
            print("Warning: Failed to grab frame.")
            break  # Hentikan generator jika frame tidak bisa diambil
        else:
            # Convert frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            # Yield frame to client
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')


@app.route('/video_feed')
def video_feed():
    """Endpoint to start video feed."""
    global video_capture, is_streaming

    if not is_streaming:
        is_streaming = True
        if video_capture is None or not video_capture.isOpened():
            print("Initializing video capture...")
            video_capture = cv2.VideoCapture(1)

            # Cek apakah kamera dapat diakses
            if not video_capture.isOpened():
                print("Camera is unavailable.")
                is_streaming = False
                return jsonify({"message": "Camera is unavailable"}), 500

    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/stop_stream', methods=['POST'])
def stop_stream():
    """Endpoint to stop video feed."""
    global video_capture, is_streaming

    if is_streaming:
        is_streaming = False  # Stop the generator
        if video_capture and video_capture.isOpened():
            print("Releasing video capture...")
            video_capture.release()
            video_capture = None
            print("Video capture released.")
            time.sleep(5)  # Memberikan waktu 2 detik sebelum membuka kamera lagi
        else:
            print("Video capture was not active.")
    else:
        print("Streaming is already stopped.")

    return jsonify({"message": "Streaming stopped"}), 200


@app.route('/start_stream', methods=['POST'])
def start_stream():
    """Endpoint to initialize the video feed."""
    global video_capture, is_streaming

    if not is_streaming:
        print("Starting streaming...")
        is_streaming = True
        attempt = 1
        while attempt < 3:  # Coba membuka kamera beberapa kali
            if video_capture is None or not video_capture.isOpened():
                print("Initializing video capture...")
                video_capture = cv2.VideoCapture(1)

                # Cek apakah kamera dapat diakses
                if not video_capture.isOpened():
                    print("Camera is unavailable, attempt", attempt + 1)
                    attempt += 1
                    time.sleep(2)  # Tunggu 2 detik sebelum mencoba lagi
                else:
                    break

        if not video_capture.isOpened():
            print("Unable to access camera after multiple attempts.")
            is_streaming = False
            return jsonify({"message": "Camera is unavailable"}), 500

    print("Video capture started successfully.")
    return jsonify({"message": "Streaming started"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=8080)
