import React, { useEffect, useState } from "react";
import { Reveal } from "../animate/Reveal";

interface StreamingSession {
  start_time: string;
  end_time?: string;
  duration?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const DashboardMonitoring: React.FC = () => {
  const [latestSession, setLatestSession] = useState<StreamingSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<StreamingSession[]>([]);

  useEffect(() => {
    const fetchStreamingData = async () => {
      try {
        const response = await fetch('http://localhost:8080/get_streaming_history');
        if (!response.ok) throw new Error('Failed to fetch streaming data');
        
        const data = await response.json();
        if (data && data.length > 0) {
          setSessionHistory(data);
          setLatestSession(data[data.length - 1]);
        }
      } catch (error) {
        console.error('Error fetching streaming data:', error);
      }
    };

    fetchStreamingData();
    const interval = setInterval(fetchStreamingData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timeString?: string) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration?: { hours: number; minutes: number; seconds: number }) => {
    if (!duration) return "00:00:00";
    const { hours, minutes, seconds } = duration;
    return `${String(hours).padStart(2, '0')}:${
      String(minutes).padStart(2, '0')}:${
      String(seconds).padStart(2, '0')}`;
  };

  return (
    <section className="bg-body-clr text-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-12">
            Monitoring Postur Tubuh
          </h1>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Panel */}
          <Reveal>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Status Monitoring
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium mb-2">Status Saat Ini</h3>
                  <p className="text-lg">
                    Postur: <span className="font-semibold text-green-500">Baik</span>
                  </p>
                  <p className="text-sm text-gray-300">
                    Durasi: {formatDuration(latestSession?.duration)}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium mb-2">Waktu Sesi</h3>
                  <p className="text-sm text-gray-300">
                    Mulai: {formatTime(latestSession?.start_time)}
                  </p>
                  {latestSession?.end_time && (
                    <p className="text-sm text-gray-300">
                      Selesai: {formatTime(latestSession.end_time)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* History Panel */}
          <Reveal>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center">
                Riwayat Sesi
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2 text-left">Waktu</th>
                      <th className="px-4 py-2 text-left">Durasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionHistory.map((session, idx) => (
                      <tr key={idx} className="border-b border-gray-700">
                        <td className="px-4 py-2">{formatTime(session.start_time)}</td>
                        <td className="px-4 py-2">{formatDuration(session.duration)}</td>
                      </tr>
                    ))}
                    {sessionHistory.length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-4 text-center text-gray-400">
                          Belum ada riwayat sesi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Chart Panel */}
        <Reveal>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Grafik Postur
            </h2>
            <div className="bg-gray-700 w-full h-64 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Data Grafik Postur</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default DashboardMonitoring;