import { useState, useEffect } from 'react';
import { Users, Hotel, Map, Bell, Star, AlertTriangle } from 'lucide-react';
import { dashboardDb } from '../lib/db';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    guests: 0,
    hotels: 0,
    experiences: 0,
    services: 0,
    activeAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardDb.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cards = [
    { name: 'Total Guests', value: stats.guests, icon: Users, color: 'bg-blue-500' },
    { name: 'Hotels', value: stats.hotels, icon: Hotel, color: 'bg-indigo-500' },
    { name: 'Experiences', value: stats.experiences, icon: Map, color: 'bg-purple-500' },
    { name: 'Services', value: stats.services, icon: Bell, color: 'bg-green-500' },
    { name: 'Active Alerts', value: stats.activeAlerts, icon: AlertTriangle, color: 'bg-red-500', alert: stats.activeAlerts > 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-xl text-white shadow-lg shadow-${card.color.split('-')[1]}-200`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.name}</p>
                <p className={`text-2xl font-bold ${card.alert ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-left hover:bg-blue-50 hover:border-blue-200 transition-all">
              <p className="font-bold text-gray-900">Add Hotel</p>
              <p className="text-xs text-gray-500 mt-1">List a new property</p>
            </button>
            <button className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-left hover:bg-purple-50 hover:border-purple-200 transition-all">
              <p className="font-bold text-gray-900">Add Experience</p>
              <p className="text-xs text-gray-500 mt-1">Create a new tour</p>
            </button>
            <button className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-left hover:bg-green-50 hover:border-green-200 transition-all">
              <p className="font-bold text-gray-900">New Service</p>
              <p className="text-xs text-gray-500 mt-1">Add hotel amenity</p>
            </button>
            <button className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-left hover:bg-red-50 hover:border-red-200 transition-all">
              <p className="font-bold text-gray-900">Manage SOS</p>
              <p className="text-xs text-gray-500 mt-1">Respond to alerts</p>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4">Platform Growth</h3>
          <p className="text-blue-100 mb-8">Your hospitality ecosystem is expanding. Manage your listings to ensure the best guest experience.</p>
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold">85%</p>
              <p className="text-sm text-blue-200">Occupancy</p>
            </div>
            <div>
              <p className="text-3xl font-bold">4.8</p>
              <p className="text-sm text-blue-200">Avg Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-blue-200">New Bookings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
