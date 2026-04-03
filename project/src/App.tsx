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
  LayoutDashboard,
  Map,
  Bell,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react';
import GuestCheckin from './components/GuestCheckin';
import GuestList from './components/GuestList';
import Housekeeping from './components/Housekeeping';
import DynamicPricing from './components/DynamicPricing';
import LicenseActivation from './components/LicenseActivation';
import CloudSync from './components/CloudSync';
import EmergencyAlerts from './components/EmergencyAlerts';
import AdminLogin from './components/AdminLogin';
import DashboardOverview from './components/DashboardOverview';
import HotelManagement from './components/HotelManagement';
import ExperienceManagement from './components/ExperienceManagement';
import ServiceManagement from './components/ServiceManagement';
import FeedbackManagement from './components/FeedbackManagement';
import HotelRequests from './components/HotelRequests';
import HotelDashboard from './components/HotelDashboard';
import { supabase } from './lib/supabase';
import { emergencyDb } from './lib/db';

const PROPERTY_ID = import.meta.env.VITE_PROPERTY_ID || 'demo-property-001';

type TabType = 'overview' | 'checkin' | 'guests' | 'hotels' | 'experiences' | 'services' | 'feedback' | 'housekeeping' | 'pricing' | 'license' | 'sync' | 'emergency' | 'requests' | 'hotel_dashboard';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Initial Auth Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    // Check for hardcoded admin first
    if (userId === '00000000-0000-0000-0000-000000000000') {
      setProfile({ 
        id: userId, 
        full_name: 'Super Admin', 
        role: 'admin' 
      });
      setActiveTab('overview');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) console.error('Error fetching profile:', error);
      else {
        setProfile(data);
        // Default tabs based on role
        if (data.role === 'hotel_owner') {
          setActiveTab('hotel_dashboard');
        } else {
          setActiveTab('overview');
        }
      }
    } catch (err) {
      console.error('Profile fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  const handleLogin = (newUser: any) => {
    setUser(newUser);
    setLoading(true);
    fetchProfile(newUser.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const handleCheckinSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('guests');
  };

  const adminTabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: LayoutDashboard },
    { id: 'guests' as TabType, name: 'Guests', icon: Users },
    { id: 'checkin' as TabType, name: 'Check-in', icon: UserPlus },
    { id: 'hotels' as TabType, name: 'Hotels', icon: Hotel },
    { id: 'requests' as TabType, name: 'Requests', icon: FileText },
    { id: 'experiences' as TabType, name: 'Experiences', icon: Map },
    { id: 'services' as TabType, name: 'Services', icon: Bell },
    { id: 'feedback' as TabType, name: 'Feedback', icon: MessageSquare },
    { id: 'emergency' as TabType, name: 'Emergency', icon: AlertTriangle },
    { id: 'housekeeping' as TabType, name: 'Housekeeping', icon: ClipboardList },
    { id: 'pricing' as TabType, name: 'Pricing', icon: DollarSign },
    { id: 'license' as TabType, name: 'License', icon: Key },
    { id: 'sync' as TabType, name: 'Cloud Sync', icon: Cloud },
  ];

  const hotelTabs = [
    { id: 'hotel_dashboard' as TabType, name: 'My Hotel', icon: Hotel },
    { id: 'experiences' as TabType, name: 'Experiences', icon: Map },
    { id: 'services' as TabType, name: 'Services', icon: Bell },
  ];

  const currentTabs = profile?.role === 'admin' ? adminTabs : hotelTabs;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium">Initializing Tihtina OS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">TIHTINA</h1>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest leading-none">
                  AI Hospitality OS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 border-l border-gray-100 pl-4 ml-4">
                <div className="text-right mr-2">
                  <p className="text-xs font-bold text-gray-900">{profile?.full_name || 'User'}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{profile?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <nav className="hidden lg:flex gap-1">
              {currentTabs.slice(0, 8).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold text-sm ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 lg:scale-[1.02]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {menuOpen && (
            <nav className="lg:hidden py-4 space-y-1 border-t border-gray-50">
              {currentTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
              >
                <LogOut className="w-5 h-5" />
                Logout System
              </button>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {activeTab === 'overview' && <DashboardOverview />}
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
        {activeTab === 'hotels' && <HotelManagement />}
        {activeTab === 'requests' && <HotelRequests />}
        {activeTab === 'hotel_dashboard' && <HotelDashboard />}
        {activeTab === 'experiences' && <ExperienceManagement hotelId={profile?.hotel_id} />}
        {activeTab === 'services' && <ServiceManagement hotelId={profile?.hotel_id} />}
        {activeTab === 'feedback' && <FeedbackManagement />}
        {activeTab === 'housekeeping' && <Housekeeping propertyId={PROPERTY_ID} />}
        {activeTab === 'pricing' && <DynamicPricing propertyId={PROPERTY_ID} />}
        {activeTab === 'license' && <LicenseActivation propertyId={PROPERTY_ID} />}
        {activeTab === 'sync' && <CloudSync propertyId={PROPERTY_ID} />}
        {activeTab === 'emergency' && <EmergencyAlerts key={refreshTrigger} />}
      </main>

      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
            TIHTINA-AI v1.2 // EXCLUSIVE PROPERTY MANAGEMENT ECOSYSTEM
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
