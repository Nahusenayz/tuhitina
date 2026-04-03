import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { emergencyDb } from '../lib/db';
import type { EmergencyAlert } from '../types';

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await emergencyDb.getAll();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await emergencyDb.acknowledge(id);
      await fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      alert('Failed to acknowledge alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Emergency Alerts
        </h2>
        <button 
          onClick={fetchAlerts}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {activeAlerts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-red-700">Active Alerts</h3>
          <div className="grid gap-4">
            {activeAlerts.map((alert) => (
              <div 
                key={alert.id}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-sm animate-pulse"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase">
                        {alert.type}
                      </span>
                      <span className="text-sm text-red-800 font-medium font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <MapPin className="w-4 h-4" />
                      {alert.location}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeAlerts.length === 0 && acknowledgedAlerts.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">All clear</h3>
          <p className="text-gray-500 mt-1">No emergency alerts at this time.</p>
        </div>
      )}

      {acknowledgedAlerts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Recent History</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
            {acknowledgedAlerts.map((alert) => (
              <div key={alert.id} className="p-4 flex justify-between items-center opacity-60">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{alert.location}</p>
                    <p className="text-xs text-gray-500 italic">
                      Acknowledged at {new Date(alert.acknowledged_at!).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-400 capitalize">
                  {alert.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
