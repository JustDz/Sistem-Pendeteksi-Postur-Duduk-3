import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const ENDPOINT = "http://localhost:8080";

interface DiagnosisData {
  diagnosis_sit: string;
  diagnosis_spine: string;
  probability_sit: number[];
  probability_spine: number[];
  timestamp: string;
  saran: string;
}

const StreamPage = () => {
  const navigate = useNavigate();
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const [diagnosisSit, setDiagnosisSit] = useState<string>("Tidak tersedia");
  const [diagnosisSpine, setDiagnosisSpine] = useState<string>("Tidak tersedia");
  const [saran, setSaran] = useState<string>(
    "Pastikan posisi tubuh tegak dan mata sejajar dengan layar."
  );
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [videoSource] = useState<string>("http://localhost:8080/video_feed");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(ENDPOINT, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    // Socket event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setStreamingError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setStreamingError('Koneksi terputus dari server');
    });

    newSocket.on('connection_response', (data) => {
      console.log('Connection response:', data);
    });

    newSocket.on('analysis_update', (data: DiagnosisData) => {
      console.log('Received analysis update:', data);
      setDiagnosisSit(data.diagnosis_sit);
      setDiagnosisSpine(data.diagnosis_spine);
      setSaran(data.saran);
    });

    newSocket.on('error', (error) => {
      console.error('Server error:', error);
      setStreamingError(`Error: ${error.message}`);
    });

    setSocket(newSocket);

    // Cleanup on component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const stopStreaming = async () => {
    setIsLoading(true);
    setStreamingError(null);
    try {
      const response = await fetch("http://localhost:8080/stop_feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menghentikan streaming.");
      }

      const result = await response.json();
      console.log(result.message);
      setIsStreaming(false);
    } catch (error) {
      console.error("Error stopping streaming:", error);
      setStreamingError("Gagal menghentikan streaming.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="fixed top-0 w-full z-50 h-[100vh] bg-first-bg">
      {/* Navbar */}
      <nav className="bg-transparent shadow-lg w-full">
        <div className="border-b mx-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold font-text text-heading-clr">
                  Posture Check
                </h1>
              </div>
              <button
                onClick={handleBack}
                className="my-8 group flex items-center justify-center disabled:opacity-50 disabled:hover:opacity-50 hover:opacity-95 ring-none rounded-full shadow-lg font-semibold py-2 px-4 font-dm text-sm xs:text-base bg-btn-clr text-body-clr font-heading tracking-widest transform transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-3 hover:bg-second-bg">
                Kembali ke Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">
        <div className="flex flex-col items-center">
          <div className="flex flex-row gap-10 w-full max-w-7xl mx-auto justify-center items-start px-4">
            {/* Stream Box - Left */}
            <div className="flex flex-col items-center p-6 rounded-lg shadow-lg text-center bg-gray-800 w-2/3 h-[80vh]">
              <h2 className="font-text text-heading-clr text-2xl font-bold mb-5">
                Live Streaming {isConnected ? '(Connected)' : '(Disconnected)'}
              </h2>
              <div className="stream-box mb-2 rounded-lg overflow-hidden bg-transparant w-full h-[450px] border-2 border-heading-clr">
                {isStreaming ? (
                  <img
                    src={videoSource}
                    alt="Live Streaming"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="font-text text-body-clr w-full h-full bg-gray-300 flex justify-center items-center rounded-lg">
                    <p>Menunggu streaming...</p>
                  </div>
                )}
              </div>

              {/* Streaming control buttons */}
              <div className="controls flex justify-center gap-5 mt-4 w-full">
                {!isStreaming ? (
                  <button
                    onClick={() => setIsStreaming(true)}
                    disabled={isLoading || !isConnected}
                    className="mt-1 group flex items-center justify-center disabled:opacity-50 disabled:hover:opacity-50 hover:opacity-95 ring-none rounded-full shadow-lg font-semibold py-3 px-6 font-dm text-sm sm:text-base bg-btn-clr text-body-clr font-heading tracking-widest transform transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-3 hover:bg-second-bg">
                    Mulai Streaming
                  </button>
                ) : (
                  <button
                    onClick={stopStreaming}
                    disabled={isLoading || !isConnected}
                    className="mt-1 group flex items-center justify-center disabled:opacity-50 disabled:hover:opacity-50 hover:opacity-95 ring-none rounded-full shadow-lg font-semibold py-3 px-6 font-dm text-sm sm:text-base bg-btn-clr text-body-clr font-heading tracking-widest transform transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-3 hover:bg-second-bg">
                    {isLoading ? "Menghentikan..." : "Hentikan Streaming"}
                  </button>
                )}
              </div>
            </div>

            {/* Output and Suggestions Box - Right */}
            <div className="flex flex-col justify-start bg-gray-800 p-5 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3 h-[80vh]">
              {/* Section: Sitting Diagnosis */}
              <div className="font-text mt-10">
                <h3 className="text-xl font-semibold text-heading-clr mb-3">
                  Diagnosis Posisi Duduk
                </h3>
                <div
                  className={`p-3 rounded-lg ${
                    diagnosisSit === "Baik" ? "bg-green-200" : "bg-red-200"
                  }`}>
                  <p className="text-lg">{diagnosisSit}</p>
                </div>
              </div>

              {/* Section: Spine Diagnosis */}
              <div className="font-text mt-6">
                <h3 className="text-xl font-semibold text-heading-clr mb-3">
                  Diagnosis Tulang Punggung
                </h3>
                <div
                  className={`p-3 rounded-lg ${
                    diagnosisSpine === "Normal" ? "bg-green-200" : "bg-red-200"
                  }`}>
                  <p className="text-lg">{diagnosisSpine}</p>
                </div>
              </div>

              {/* Section: Suggestions */}
              <div className="font-text mt-6">
                <h3 className="text-xl font-semibold text-heading-clr">
                  Saran Posisi Duduk
                </h3>
                <div className="mt-2 p-3 rounded-lg bg-yellow-100">
                  <p className="text-lg">{saran}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {streamingError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {streamingError}
          </div>
        )}
      </main>
    </div>
  );
};

export default StreamPage;