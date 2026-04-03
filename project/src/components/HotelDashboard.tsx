import { useState, useEffect } from 'react';
import { 
  Hotel, 
  MapPin, 
  Star, 
  Wifi, 
  Coffee, 
  Tv, 
  Wind, 
  Utensils, 
  Car, 
  ShieldCheck,
  Edit,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  TrendingUp,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ImageUpload from './ImageUpload';

export default function HotelDashboard() {
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHotel, setEditedHotel] = useState<any>(null);
  const [stats, setStats] = useState({
    bookings: 0,
    revenue: 0,
    services: 0,
    experiences: 0
  });

  useEffect(() => {
    fetchHotelData();
  }, []);

  const fetchHotelData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch hotel owned by this user
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (hotelError) throw hotelError;

      setHotel(hotelData);
      setEditedHotel(hotelData);

      // Fetch stats
      if (hotelData) {
        const { count: serviceCount } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('hotel_id', hotelData.id);
        const { count: expCount } = await supabase.from('experiences').select('*', { count: 'exact', head: true }).eq('hotel_id', hotelData.id);
        const { data: bookings } = await supabase.from('bookings').select('total_price').eq('hotel_id', hotelData.id);
        
        setStats({
          bookings: bookings?.length || 0,
          revenue: bookings?.reduce((acc, b) => acc + (b.total_price || 0), 0) || 0,
          services: serviceCount || 0,
          experiences: expCount || 0
        });
      }
    } catch (err) {
      console.error('Error fetching hotel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('hotels')
        .update({
          name: editedHotel.name,
          location: editedHotel.location,
          description: editedHotel.description,
          price_per_night: editedHotel.price_per_night,
          amenities: editedHotel.amenities,
          image_url: editedHotel.image_url,
          contact_email: editedHotel.contact_email,
          contact_phone: editedHotel.contact_phone
        })
        .eq('id', hotel.id);

      if (error) throw error;
      setHotel(editedHotel);
      setIsEditing(false);
      alert('Hotel information updated successfully!');
    } catch (err: any) {
      alert('Error updating hotel: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    const amenities = editedHotel.amenities || [];
    if (amenities.includes(amenity)) {
      setEditedHotel({ ...editedHotel, amenities: amenities.filter((a: string) => a !== amenity) });
    } else {
      setEditedHotel({ ...editedHotel, amenities: [...amenities, amenity] });
    }
  };

  if (loading && !hotel) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading your hotel dashboard...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
        <Hotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">No Hotel Found</h2>
        <p className="text-gray-500 mt-2">We couldn't find a hotel associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
            <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                hotel.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                {hotel.status}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-gray-900">{hotel.rating}</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{hotel.name}</h2>
            <p className="text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
              <MapPin className="w-4 h-4 text-blue-500" />
              {hotel.location}
            </p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Edit className="w-4 h-4" />
            Edit Property
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Total Bookings</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-gray-900">{stats.bookings}</h3>
            <span className="text-xs text-green-500 font-bold">+12%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Total Revenue</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat().format(stats.revenue)} <span className="text-sm font-medium">ETB</span></h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-purple-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Active Services</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.services}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
            <Map className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm font-semibold text-gray-500">Experiences</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.experiences}</h3>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
            <h3 className="text-xl font-bold text-gray-900">Edit Hotel Information</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-xl text-gray-500 hover:bg-gray-50 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Hotel Name</label>
                <input
                  type="text"
                  value={editedHotel.name}
                  onChange={(e) => setEditedHotel({ ...editedHotel, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                  placeholder="Hotel Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Location</label>
                <input
                  type="text"
                  value={editedHotel.location}
                  onChange={(e) => setEditedHotel({ ...editedHotel, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                  placeholder="City, Area"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Price per Night (ETB)</label>
                <input
                  type="number"
                  value={editedHotel.price_per_night}
                  onChange={(e) => setEditedHotel({ ...editedHotel, price_per_night: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                <textarea
                  rows={4}
                  value={editedHotel.description || ''}
                  onChange={(e) => setEditedHotel({ ...editedHotel, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 resize-none"
                  placeholder="Tell us about your property..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <ImageUpload 
                label="Hotel Display Image"
                currentImage={editedHotel.image_url}
                onUpload={(url) => setEditedHotel({ ...editedHotel, image_url: url })}
              />

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 ml-1">Key Amenities</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'wifi', name: 'Free WiFi', icon: Wifi },
                    { id: 'parking', name: 'Parking', icon: Car },
                    { id: 'pool', name: 'Swimming Pool', icon: Wind },
                    { id: 'gym', name: 'Fitness Center', icon: TrendingUp },
                    { id: 'restaurant', name: 'Restaurant', icon: Utensils },
                    { id: 'spa', name: 'Spa & Wellness', icon: Wind },
                  ].map((amenity) => {
                    const Icon = amenity.icon;
                    const isActive = (editedHotel.amenities || []).includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${
                          isActive 
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        {amenity.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    value={editedHotel.contact_email || ''}
                    onChange={(e) => setEditedHotel({ ...editedHotel, contact_email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    value={editedHotel.contact_phone || ''}
                    onChange={(e) => setEditedHotel({ ...editedHotel, contact_phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About the Property</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {hotel.description || "No description provided yet. Click 'Edit Property' to add one."}
              </p>
              
              <div className="mt-8 pt-8 border-t border-gray-50">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Featured Amenities</h4>
                <div className="flex flex-wrap gap-3">
                  {(hotel.amenities || []).length > 0 ? (
                    hotel.amenities.map((a: string) => (
                      <span key={a} className="bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold border border-gray-100/50 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                        {a.charAt(0).toUpperCase() + a.slice(1)}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No amenities listed.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-blue-600 rounded-3xl p-8 shadow-xl shadow-blue-200 text-white">
              <h3 className="text-xl font-bold mb-6">Booking Overview</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-blue-100 font-medium">Current Occupancy</span>
                  <span className="text-xl font-black">74%</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-blue-100 font-medium">Average Daily Rate</span>
                  <span className="text-xl font-black">12,400 <span className="text-xs">ETB</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 font-medium">Monthly Growth</span>
                  <span className="text-xl font-black text-green-300">+21%</span>
                </div>
              </div>
              <button className="w-full mt-8 bg-white text-blue-600 py-3 rounded-2xl font-black hover:bg-gray-50 transition-colors uppercase tracking-widest text-xs">
                View Full Reports
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Customer Contact
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Main Email</p>
                    <p className="text-xs font-bold text-gray-900 truncate">{hotel.contact_email || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Support Line</p>
                    <p className="text-xs font-bold text-gray-900">{hotel.contact_phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subordinate Icons not importable from lucide-react directly
function Mail(props: any) { return <Users {...props} /> } // Fallback for demo
function Phone(props: any) { return <Users {...props} /> } // Fallback for demo
