import React, { useEffect, useState } from "react";
import { Reveal } from "../animate/Reveal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PostureStats {
  sit: {
    [key: string]: number;
    good: number;
    bad: number;
  };
  spine: {
    [key: string]: number;
    normal: number;
    lordosis: number;
    kifosis: number;
  };
  dominant_sit: string;
  dominant_spine: string;
  raw_counts: {
    sit: { [key: string]: number };
    spine: { [key: string]: number };
  };
}

interface StreamingSession {
  start_time: string;
  end_time: string;
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
    total_seconds: number;
  };
  posture_statistics: PostureStats;
}

interface TimeSeriesData {
  timestamp: string;
  diagnosis_sit: string;
  diagnosis_spine: string;
}

const DashboardMonitoring: React.FC = () => {
  const [latestSession, setLatestSession] = useState<StreamingSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<StreamingSession[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  // Fetch session history
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

  // Fetch time series data
  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      try {
        const response = await fetch('http://localhost:8080/get_latest_session_data');
        if (!response.ok) throw new Error('Failed to fetch time series data');
        
        const data = await response.json();
        if (data) {
          setTimeSeriesData(data);
        }
      } catch (error) {
        console.error('Error fetching time series data:', error);
      }
    };

    if (latestSession) {
      fetchTimeSeriesData();
      const interval = setInterval(fetchTimeSeriesData, 5000);
      return () => clearInterval(interval);
    }
  }, [latestSession]);

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

  const formatChartTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (duration?: { hours: number; minutes: number; seconds: number }) => {
    if (!duration) return "00:00:00";
    const { hours, minutes, seconds } = duration;
    return `${String(hours).padStart(2, '0')}:${
      String(minutes).padStart(2, '0')}:${
      String(seconds).padStart(2, '0')}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSitValue = (diagnosis: string) => {
    return diagnosis === 'good' ? 100 : 0;
  };

  const getSpineValue = (diagnosis: string) => {
    switch (diagnosis.toLowerCase()) {
      case 'normal': return 100;
      case 'lordosis': return 50;
      case 'kifosis': return 0;
      default: return 0;
    }
  };

  const formatChartData = (data: TimeSeriesData[]) => {
    return data.map(item => ({
      timestamp: formatChartTime(item.timestamp),
      postureDuduk: getSitValue(item.diagnosis_sit),
      posturPunggung: getSpineValue(item.diagnosis_spine),
      diagnosisSit: item.diagnosis_sit,
      diagnosisSpine: item.diagnosis_spine
    }));
  };

  const renderPostureStats = (stats: PostureStats) => {
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-medium mb-2">Posisi Duduk</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm">Baik</p>
              <p className="text-lg font-semibold">{formatPercentage(stats.sit.good)}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm">Buruk</p>
              <p className="text-lg font-semibold">{formatPercentage(stats.sit.bad)}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-2">Posisi Tulang Punggung</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm">Normal</p>
              <p className="text-lg font-semibold">{formatPercentage(stats.spine.normal)}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm">Lordosis</p>
              <p className="text-lg font-semibold">{formatPercentage(stats.spine.lordosis)}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-sm">Kifosis</p>
              <p className="text-lg font-semibold">{formatPercentage(stats.spine.kifosis)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-md font-medium mb-1">Posisi Dominan Duduk</h4>
            <p className="text-lg capitalize bg-blue-500 bg-opacity-20 p-2 rounded">
              {stats.dominant_sit}
            </p>
          </div>
          <div>
            <h4 className="text-md font-medium mb-1">Posisi Dominan Punggung</h4>
            <p className="text-lg capitalize bg-blue-500 bg-opacity-20 p-2 rounded">
              {stats.dominant_spine}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded shadow-lg border border-gray-700">
          <p className="text-sm text-gray-300">{`Waktu: ${label}`}</p>
          <p className="text-sm">
            <span className="text-blue-400">Postur Duduk: </span>
            <span className="capitalize">{payload[0].payload.diagnosisSit}</span>
          </p>
          <p className="text-sm">
            <span className="text-green-400">Postur Punggung: </span>
            <span className="capitalize">{payload[0].payload.diagnosisSpine}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartData = formatChartData(timeSeriesData);

    return (
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              ticks={[0, 50, 100]}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="postureDuduk"
              name="Postur Duduk"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={{ stroke: '#60A5FA', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="posturPunggung"
              name="Postur Punggung"
              stroke="#34D399"
              strokeWidth={2}
              dot={{ stroke: '#34D399', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
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
                Sesi Terakhir
              </h2>

              <div className="space-y-6">
                {latestSession ? (
                  <>
                    <div>
                      <h3 className="text-xl font-medium mb-4">Informasi Sesi</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300">
                          Mulai: {formatTime(latestSession.start_time)}
                        </p>
                        <p className="text-sm text-gray-300">
                          Selesai: {formatTime(latestSession.end_time)}
                        </p>
                        <p className="text-sm text-gray-300">
                          Durasi: {formatDuration(latestSession.duration)}
                        </p>
                      </div>
                    </div>

                    {latestSession.posture_statistics && (
                      <div>
                        <h3 className="text-xl font-medium mb-4">Statistik Postur</h3>
                        {renderPostureStats(latestSession.posture_statistics)}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-gray-400">Belum ada sesi yang tercatat</p>
                )}
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
                      <th className="px-4 py-2 text-left">Postur Dominan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionHistory.map((session, idx) => (
                      <tr key={idx} className="border-b border-gray-700">
                        <td className="px-4 py-2">{formatTime(session.start_time)}</td>
                        <td className="px-4 py-2">{formatDuration(session.duration)}</td>
                        <td className="px-4 py-2 capitalize">
                          {session.posture_statistics?.dominant_sit || '-'}
                        </td>
                      </tr>
                    ))}
                    {sessionHistory.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-center text-gray-400">
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
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Grafik Monitoring Postur
            </h2>
            {timeSeriesData.length > 0 ? (
              renderChart()
            ) : (
              <div className="bg-gray-700 w-full h-64 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Belum ada data monitoring</span>
              </div>
            )}
          </div>
        </Reveal>

        {/* Statistics Summary Panel */}
        <Reveal>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Rangkuman Statistik
            </h2>
            {sessionHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-medium mb-2">Total Sesi</h3>
                  <p className="text-3xl font-bold">{sessionHistory.length}</p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-medium mb-2">Total Waktu</h3>
                  <p className="text-3xl font-bold">
                    {formatDuration({
                      hours: Math.floor(sessionHistory.reduce((acc, session) => 
                        acc + (session.duration?.total_seconds || 0), 0) / 3600),
                      minutes: Math.floor((sessionHistory.reduce((acc, session) => 
                        acc + (session.duration?.total_seconds || 0), 0) % 3600) / 60),
                      seconds: Math.floor(sessionHistory.reduce((acc, session) => 
                        acc + (session.duration?.total_seconds || 0), 0) % 60)
                    })}
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-medium mb-2">Rata-rata Durasi</h3>
                  <p className="text-3xl font-bold">
                    {formatDuration({
                      hours: Math.floor((sessionHistory.reduce((acc, session) => 
                        acc + (session.duration?.total_seconds || 0), 0) / sessionHistory.length) / 3600),
                      minutes: Math.floor(((sessionHistory.reduce((acc, session) => 
                        acc + (session.duration?.total_seconds || 0), 0) / sessionHistory.length) % 3600) / 60),
                      seconds: Math.floor((sessionHistory.reduce((acc, session) => 
                        acc + (session.duration?.total_seconds || 0), 0) / sessionHistory.length) % 60)
                    })}
                  </p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h3 className="text-lg font-medium mb-2">Sesi Terakhir</h3>
                  <p className="text-sm">
                    {latestSession ? formatTime(latestSession.end_time) : '-'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-400">Belum ada data statistik</p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default DashboardMonitoring;