import { useEffect, useRef, useState } from "react";
import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";

export default function France() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const stopButtonRef = useRef<HTMLButtonElement>(null);
  const downloadButtonRef = useRef<HTMLButtonElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(
    "Initializing Camera...",
  );

  let mediaRecorder: MediaRecorder;
  let downloadUrl: string;

  useEffect(() => {
    async function init() {
      if (!canvasRef.current) return;

      setLoadingMessage("Connecting to Camera Kit...");

      const cameraKit = await bootstrapCameraKit({
        apiToken:
          "eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzY5NTgyMDAyLCJzdWIiOiJlMDM2NWQ4Yi02ZTcxLTRlMDUtYjgzOS1jNmM3NmNjMGU5N2F-U1RBR0lOR34zNjk5YWM0Ni1jOTY4LTQ3N2YtYTFiMy1mZTllZTQ4ZGY4YTMifQ.UdRL83ZsDDFR8QY_qsYKzL6MkCoWbhkksXXrxreyS0s",
      });

      setLoadingMessage("Starting camera session...");

      const session = await cameraKit.createSession({
        liveRenderTarget: canvasRef.current,
      });

      setLoadingMessage("Requesting camera access...");

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30, max: 30 },
        },
      });

      const source = createMediaStreamSource(mediaStream);

      await session.setSource(source);
      await session.play();

      setLoadingMessage("Loading AR lenses...");

      const { lenses } = await cameraKit.lensRepository.loadLensGroups([
        "017e1e0c-bddb-4281-9e00-5f3e542f45a7",
      ]);

      if (!lenses || lenses.length === 0) {
        console.error("No lenses found in the group");
        setLoadingMessage("Error: No lenses found");
        return;
      }

      console.log("Available lenses:", lenses);
      console.log("Applying lens:", lenses[0]);

      setLoadingMessage("Applying filter...");

      await session.applyLens(lenses[0]);

      setIsLoading(false);

      bindRecorder();
    }

    function bindRecorder() {
      if (
        !startButtonRef.current ||
        !stopButtonRef.current ||
        !downloadButtonRef.current ||
        !canvasRef.current ||
        !videoRef.current ||
        !videoContainerRef.current
      )
        return;

      const startButton = startButtonRef.current;
      const stopButton = stopButtonRef.current;
      const downloadButton = downloadButtonRef.current;
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const videoContainer = videoContainerRef.current;

      startButton.addEventListener("click", () => {
        startButton.disabled = true;
        stopButton.disabled = false;
        downloadButton.disabled = true;
        videoContainer.style.display = "none";

        const mediaStream = canvas.captureStream(30);

        mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (!event.data.size) {
            console.warn("No recorded data available");
            return;
          }

          const blob = new Blob([event.data]);

          downloadUrl = window.URL.createObjectURL(blob);
          downloadButton.disabled = false;

          video.src = downloadUrl;
          videoContainer.style.display = "block";
        });

        mediaRecorder.start();
      });

      stopButton.addEventListener("click", () => {
        startButton.disabled = false;
        stopButton.disabled = true;

        mediaRecorder?.stop();
      });

      downloadButton.addEventListener("click", () => {
        const link = document.createElement("a");

        link.setAttribute("style", "display: none");
        link.href = downloadUrl;
        link.download = "france-camera-kit-recording.webm";
        link.click();
        link.remove();
      });
    }

    init();
  }, []);

  return (
    <div className="camera-page">
      <h1 className="page-title">France</h1>

      {isLoading && (
        <div
          style={{
            position: "absolute",
            color: "white",
            fontSize: "16px",
            textAlign: "center",
            zIndex: 100,
            background: "rgba(0,0,0,0.8)",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          {loadingMessage}
        </div>
      )}

      <canvas ref={canvasRef} className="camera-canvas"></canvas>

      <div
        ref={videoContainerRef}
        className="video-container"
        style={{ display: "none" }}
      >
        <video ref={videoRef} className="video-preview" controls></video>
      </div>

      <div className="controls">
        <button ref={startButtonRef} className="btn btn-start">
          Start Recording
        </button>
        <button ref={stopButtonRef} className="btn btn-stop" disabled>
          Stop Recording
        </button>
        <button ref={downloadButtonRef} className="btn btn-download" disabled>
          Download
        </button>
      </div>
    </div>
  );
}
