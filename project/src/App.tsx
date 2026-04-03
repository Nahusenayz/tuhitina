import { useState, useEffect } from 'react';
import {
  Hotel,
  UserPlus,
  Users,
  ClipboardList,
  DollarSign,
  Key,
  Cloud,
  Menu,
  X,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import GuestCheckin from './components/GuestCheckin';
import GuestList from './components/GuestList';
import Housekeeping from './components/Housekeeping';
import DynamicPricing from './components/DynamicPricing';
import LicenseActivation from './components/LicenseActivation';
import CloudSync from './components/CloudSync';
import EmergencyAlerts from './components/EmergencyAlerts';
import AdminLogin from './components/AdminLogin';
import { supabase } from './lib/supabase';
import { emergencyDb } from './lib/db';

const PROPERTY_ID = import.meta.env.VITE_PROPERTY_ID || 'demo-property-001';

type TabType = 'checkin' | 'guests' | 'housekeeping' | 'pricing' | 'license' | 'sync' | 'emergency';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_auth') === 'true';
  });
  const [activeTab, setActiveTab] = useState<TabType>('checkin');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    // Supabase Realtime Subscription for Guests
    const guestsChannel = supabase
      .channel('guests-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guests' },
        (payload) => {
          console.log('Guest update:', payload);
          setRefreshTrigger((prev) => prev + 1);
        }
      )
      .subscribe();

    // Supabase Realtime Subscription for Emergency Alerts
    const alertsChannel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'emergency_alerts' },
        async (payload) => {
          console.log('New emergency alert:', payload);
          // Save to local DB first
          try {
            await emergencyDb.create(payload.new as any);
          } catch (err) {
            console.error('Error saving alert to local DB:', err);
          }
          setRefreshTrigger((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(guestsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  const handleCheckinSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('guests');
  };

  const tabs = [
    { id: 'checkin' as TabType, name: 'Check-in', icon: UserPlus },
    { id: 'guests' as TabType, name: 'Guests', icon: Users },
    { id: 'housekeeping' as TabType, name: 'Housekeeping', icon: ClipboardList },
    { id: 'pricing' as TabType, name: 'Pricing', icon: DollarSign },
    { id: 'license' as TabType, name: 'License', icon: Key },
    { id: 'sync' as TabType, name: 'Cloud Sync', icon: Cloud },
    { id: 'emergency' as TabType, name: 'Emergency', icon: AlertTriangle },
  ];

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Hotel className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TIHTINA-AI</h1>
                <p className="text-xs text-gray-500">Offline-First Hospitality OS</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <nav className="hidden md:flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {menuOpen && (
            <nav className="md:hidden pb-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout Admin</span>
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'checkin' && (
          <GuestCheckin propertyId={PROPERTY_ID} onSuccess={handleCheckinSuccess} />
        )}
        {activeTab === 'guests' && (
          <GuestList 
            propertyId={PROPERTY_ID} 
            refreshTrigger={refreshTrigger} 
            onAddUser={() => setActiveTab('checkin')} 
          />
        )}
        {activeTab === 'housekeeping' && <Housekeeping propertyId={PROPERTY_ID} />}
        {activeTab === 'pricing' && <DynamicPricing propertyId={PROPERTY_ID} />}
        {activeTab === 'license' && <LicenseActivation propertyId={PROPERTY_ID} />}
        {activeTab === 'sync' && <CloudSync propertyId={PROPERTY_ID} />}
        {activeTab === 'emergency' && <EmergencyAlerts key={refreshTrigger} />}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            TIHTINA-AI v1.0 - Offline-First Hospitality Management System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
