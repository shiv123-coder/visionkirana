import React, { useEffect, useState } from 'react';

interface ServiceStatus {
  database: string;
  ml_service: string;
  cloudinary: string;
}

interface SystemStatus {
  status: string;
  services: ServiceStatus;
}

const SystemStatusPage: React.FC = () => {
  const [statusData, setStatusData] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/system/status`);
        if (!response.ok) {
          throw new Error('Failed to fetch system status');
        }
        const data = await response.json();
        setStatusData(data);
      } catch (err: any) {
        setError(err.message || 'Error connecting to system status API');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !statusData) {
    return <div className="p-8 text-center text-gray-500">Checking system health...</div>;
  }

  if (error && !statusData) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
      case 'unreachable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8 bg-white shadow-xl rounded-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">System Status</h1>
        {statusData && (
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${getStatusColor(statusData.status)}`}>
            {statusData.status.toUpperCase()}
          </span>
        )}
      </div>

      {statusData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gray-50 flex flex-col items-center">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Database</h3>
            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusData.services.database)}`}>
              {statusData.services.database}
            </div>
            <p className="mt-4 text-xs text-gray-400 text-center">Neon PostgreSQL</p>
          </div>

          <div className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gray-50 flex flex-col items-center">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">ML Service</h3>
            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusData.services.ml_service)}`}>
              {statusData.services.ml_service}
            </div>
            <p className="mt-4 text-xs text-gray-400 text-center">Render Web Service</p>
          </div>

          <div className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gray-50 flex flex-col items-center">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Cloudinary Storage</h3>
            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusData.services.cloudinary)}`}>
              {statusData.services.cloudinary}
            </div>
            <p className="mt-4 text-xs text-gray-400 text-center">Cloudinary API</p>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center text-xs text-gray-400">
        Status auto-refreshes every 30 seconds
      </div>
    </div>
  );
};

export default SystemStatusPage;
