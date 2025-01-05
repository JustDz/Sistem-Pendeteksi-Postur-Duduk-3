import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const ENDPOINT = "http://localhost:8080";

interface PosturePercentages {
  [key: string]: number;
}

interface PostureStats {
  sit: PosturePercentages;
  spine: PosturePercentages;
  dominant_sit: string;
  dominant_spine: string;
}

interface DiagnosisData {
  diagnosis_sit: string;
  diagnosis_spine: string;
  probability_sit: number[];
  probability_spine: number[];
  timestamp: string;
  saran: string;
  dominant_sit?: string;
  dominant_spine?: string;
  sit_percentages?: PosturePercentages;
  spine_percentages?: PosturePercentages;
}

const StreamPage = () => {
  const navigate = useNavigate();

  // Basic state
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Video state
  const [videoSource, setVideoSource] = useState<string>("");

  // Diagnosis state
  const [diagnosisSit, setDiagnosisSit] = useState<string>("Tidak tersedia");
  const [diagnosisSpine, setDiagnosisSpine] =
    useState<string>("Tidak tersedia");
  const [saran, setSaran] = useState<string>(
    "Pastikan posisi tubuh tegak"
  );

  // Duration state
  const [streamDuration, setStreamDuration] = useState<string>("00:00:00");
  const [streamStartTime, setStreamStartTime] = useState<Date | null>(null);

  // Posture statistics state
  const [postureStats, setPostureStats] = useState<PostureStats | null>(null);
  const [dominantSit, setDominantSit] = useState<string>("Tidak tersedia");
  const [dominantSpine, setDominantSpine] = useState<string>("Tidak tersedia");
  const [sitPercentages, setSitPercentages] = useState<PosturePercentages>({
    good: 0,
    bad: 0,
  });
  const [spinePercentages, setSpinePercentages] = useState<PosturePercentages>({
    normal: 0,
    lordosis: 0,
    kifosis: 0,
  });

  // Socket connection effect
  useEffect(() => {
    const newSocket = io(ENDPOINT, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      setStreamingError(null);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
      setStreamingError("Koneksi terputus dari server");

      // Auto stop streaming if it was running
      if (isStreaming) {
        setIsStreaming(false);
        setStreamStartTime(null);
        setVideoSource("");
      }
    });

    newSocket.on("connection_response", (data) => {
      console.log("Connection response:", data);
    });

    newSocket.on("analysis_update", (data: DiagnosisData) => {
      console.log("Received analysis update:", data);
      try {
        setDiagnosisSit(data.diagnosis_sit);
        setDiagnosisSpine(data.diagnosis_spine);
        setSaran(data.saran);

        if (data.dominant_sit) setDominantSit(data.dominant_sit);
        if (data.dominant_spine) setDominantSpine(data.dominant_spine);
        if (data.sit_percentages) {
          setSitPercentages({
            good: data.sit_percentages.good || 0,
            bad: data.sit_percentages.bad || 0,
          });
        }
        if (data.spine_percentages) {
          setSpinePercentages({
            normal: data.spine_percentages.normal || 0,
            lordosis: data.spine_percentages.lordosis || 0,
            kifosis: data.spine_percentages.kifosis || 0,
          });
        }
      } catch (error) {
        console.error("Error processing analysis update:", error);
      }
    });

    newSocket.on("error", (error) => {
      console.error("Server error:", error);
      setStreamingError(`Error: ${error.message}`);
    });

    setSocket(newSocket);

    return () => {
      if (isStreaming) {
        stopStreaming();
      }
      newSocket.close();
    };
  }, []);

  // Reconnection handling
  useEffect(() => {
    if (!isConnected && socket) {
      const reconnectTimer = setTimeout(() => {
        console.log("Attempting to reconnect...");
        socket.connect();
      }, 3000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, socket]);

  // Duration tracking effect
  useEffect(() => {
    let intervalId: number;

    if (isStreaming && streamStartTime) {
      intervalId = window.setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - streamStartTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setStreamDuration(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isStreaming, streamStartTime]);

  const startStreaming = async () => {
    setIsLoading(true);
    setStreamingError(null);
    try {
      const response = await fetch("http://localhost:8080/start_feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal memulai streaming.");
      }

      const result = await response.json();
      console.log("Streaming started:", result);
      setVideoSource(
        "http://localhost:8080/video_feed?" + new Date().getTime()
      );
      setStreamStartTime(new Date());
      setIsStreaming(true);
    } catch (error) {
      console.error("Error starting streaming:", error);
      setStreamingError("Gagal memulai streaming.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopStreaming = async () => {
    setIsLoading(true);
    setStreamingError(null);
    try {
      const response = await fetch("http://localhost:8080/stop_feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // Tambahkan mode CORS
        credentials: "omit", // Jangan kirim credentials
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal menghentikan streaming.");
      }

      const result = await response.json();
      console.log("Streaming stopped:", result);

      // Update state
      setStreamDuration(result.duration || "00:00:00");
      setStreamStartTime(null);
      setIsStreaming(false);
      setVideoSource("");

      // Update statistics jika ada
      if (result.posture_statistics) {
        setPostureStats(result.posture_statistics);

        // Update persentase
        if (result.posture_statistics.sit) {
          setSitPercentages(result.posture_statistics.sit);
        }
        if (result.posture_statistics.spine) {
          setSpinePercentages(result.posture_statistics.spine);
        }

        // Update posisi dominan
        if (result.posture_statistics.dominant_sit) {
          setDominantSit(result.posture_statistics.dominant_sit);
        }
        if (result.posture_statistics.dominant_spine) {
          setDominantSpine(result.posture_statistics.dominant_spine);
        }
      }
    } catch (error) {
      console.error("Error stopping streaming:", error);
      setStreamingError(error.message || "Gagal menghentikan streaming.");

      // Cleanup state jika terjadi error
      setIsStreaming(false);
      setVideoSource("");
      setStreamStartTime(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  // Component for displaying posture statistics
  const PostureStatistics = () => {
    if (!isStreaming && !postureStats) return null;

    // Fungsi helper untuk menampilkan persentase dengan aman
    const safePercentage = (value?: number) => (value || 0).toFixed(1);

    return (
      <div className="font-text mt-6 bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold text-heading-clr mb-3">
          Statistik Postur
        </h3>
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <h4 className="font-semibold mb-2">Posisi Duduk:</h4>
            <p>Posisi Dominan: {dominantSit || "Tidak tersedia"}</p>
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span>Good</span>
                <span>{safePercentage(sitPercentages?.good)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${sitPercentages?.good || 0}%` }}></div>
              </div>
              <div className="flex justify-between mb-1 mt-2">
                <span>Bad</span>
                <span>{safePercentage(sitPercentages?.bad)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-600 h-2.5 rounded-full"
                  style={{ width: `${sitPercentages?.bad || 0}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-purple-100">
            <h4 className="font-semibold mb-2">Tulang Belakang:</h4>
            <p>Posisi Dominan: {dominantSpine || "Tidak tersedia"}</p>
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span>Normal</span>
                <span>{safePercentage(spinePercentages?.normal)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${spinePercentages?.normal || 0}%` }}></div>
              </div>
              <div className="flex justify-between mb-1 mt-2">
                <span>Lordosis</span>
                <span>{safePercentage(spinePercentages?.lordosis)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-600 h-2.5 rounded-full"
                  style={{
                    width: `${spinePercentages?.lordosis || 0}%`,
                  }}></div>
              </div>
              <div className="flex justify-between mb-1 mt-2">
                <span>Kifosis</span>
                <span>{safePercentage(spinePercentages?.kifosis)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-600 h-2.5 rounded-full"
                  style={{ width: `${spinePercentages?.kifosis || 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
              <div className="flex items-center justify-center space-x-4 mb-5">
                <h2 className="font-text text-heading-clr text-2xl font-bold">
                  Live Streaming{" "}
                  {isConnected ? "(Connected)" : "(Disconnected)"}
                </h2>
                <button
                  onClick={openModal}
                  className="group flex items-center justify-center disabled:opacity-50 ring-none rounded-full shadow-lg py-2 px-4 transform transition-all duration-300 ease-in-out hover:scale-110 bg-transparent mt-[-4px]">
                  <i className="bx bx-info-circle text-3xl text-yellow-300 group-hover:text-yellow-600"></i>
                </button>
              </div>

              <div className="stream-box mb-2 rounded-lg overflow-hidden bg-transparant w-full h-[450px] border-2 border-heading-clr">
                {isStreaming && videoSource ? (
                  <img
                    src={videoSource}
                    alt="Live Streaming"
                    className="w-full h-full object-contain rounded-lg bg-black"
                    style={{
                      imageRendering: "pixelated",
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                    onError={(e) => {
                      console.error("Error loading video feed:", e);
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.src = videoSource + "?" + new Date().getTime();
                    }}
                  />
                ) : (
                  <div className="font-text text-body-clr w-full h-full bg-gray-300 flex justify-center items-center rounded-lg">
                    <p>Menunggu streaming...</p>
                  </div>
                )}
              </div>
              {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mb-4 ">
                    <h2 className="text-2xl font-bold mb-8 text-white">
                      Cara Kerja Sistem
                    </h2>
                    <ol className="text-left list-decimal list-inside text-white mb-4 space-y-4">
                      <li>
                        Tekan tombol <strong>"Mulai Streaming"</strong> untuk
                        menyalakan kamera.
                      </li>
                      <li>
                        Hadapkan tubuh Anda menyamping ke kamera agar sistem
                        dapat mendeteksi postur.
                      </li>
                      <li>
                        Sistem akan menganalisis posisi duduk dan tulang
                        belakang Anda secara real-time.
                      </li>
                      <li>
                        Hasil diagnosa dan saran akan ditampilkan di layar
                        bersama statistik postur.
                      </li>
                      <li>
                        Tekan tombol <strong>"Hentikan Streaming"</strong> untuk
                        menghentikan streaming.
                      </li>
                      <li>
                        Anda dapat melihat hasil monitoring dari postur duduk anda dengan menekan tombol <strong>"Kembali ke Home"</strong> dan pergi ke menu <strong>Monitoring Postur Duduk</strong>
                      </li>
                    </ol>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={closeModal}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200">
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Duration Display */}
              <div className="mt-4 font-text text-heading-clr text-xl">
                Durasi: {streamDuration}
              </div>

              {/* Streaming control buttons */}
              <div className="controls flex justify-center gap-5 mt-4 w-full">
                {!isStreaming ? (
                  <button
                    onClick={startStreaming}
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
            <div className="flex flex-col justify-start bg-gray-800 p-5 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3 h-[80vh] overflow-y-auto">
              {/* Section: Sitting Diagnosis */}
              <div className="font-text mt-4">
                <h3 className="text-xl font-semibold text-heading-clr mb-3">
                  Diagnosis Posisi Duduk
                </h3>
                <div
                  className={`p-3 rounded-lg ${
                    diagnosisSit === "good" ? "bg-green-200" : "bg-red-200"
                  }`}>
                  <p className="text-lg capitalize">{diagnosisSit}</p>
                </div>
              </div>

              {/* Section: Spine Diagnosis */}
              <div className="font-text mt-6">
                <h3 className="text-xl font-semibold text-heading-clr mb-3">
                  Diagnosis Tulang Belakang
                </h3>
                <div
                  className={`p-3 rounded-lg ${
                    diagnosisSpine === "normal"
                      ? "bg-green-200"
                      : diagnosisSpine === "lordosis"
                      ? "bg-yellow-200"
                      : "bg-red-200"
                  }`}>
                  <p className="text-lg capitalize">{diagnosisSpine}</p>
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

              {/* Section: Posture Statistics */}
              <PostureStatistics />
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
