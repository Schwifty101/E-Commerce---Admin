import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { analyticsService } from '../../services/analyticsService';

const SystemLogs = ({ dateRange = { from: new Date(), to: new Date() } }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!dateRange?.from || !dateRange?.to) {
        console.warn('Invalid date range provided to SystemLogs');
        return;
      }
      
      setLoading(true);
      try {
        const data = await analyticsService.getSystemLogs(dateRange);
        setLogs(prev => page === 1 ? data.logs : [...prev, ...data.logs]);
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('Failed to fetch system logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [dateRange, page]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && page === 1) {
    return <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">System Logs</h3>
      <div className="space-y-4">
        {logs.map((log, index) => (
          <div key={index} className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{log.action}</p>
                <p className="text-sm text-gray-500">{log.description}</p>
              </div>
              <span className="text-sm text-gray-400">
                {formatTimestamp(log.timestamp)}
              </span>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-gray-500">User: </span>
              <span className="text-gray-900">{log.user}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-500">IP: </span>
              <span className="text-gray-900">{log.ip}</span>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-700"
        >
          Load More
        </button>
      )}
    </div>
  );
};

SystemLogs.propTypes = {
  dateRange: PropTypes.shape({
    from: PropTypes.instanceOf(Date),
    to: PropTypes.instanceOf(Date)
  })
};

export default SystemLogs; 