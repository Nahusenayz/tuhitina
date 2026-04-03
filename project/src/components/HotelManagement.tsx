import { useState, useEffect } from 'react';
import { Plus, Hotel as HotelIcon, MapPin, Trash2, Edit2, Star, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { hotelDb } from '../lib/db';
import type { Hotel } from '../types';
import ImageUpload from './ImageUpload';

export default function HotelManagement() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingHotel, setEditingHotel] = useState<string | null>(null);
  const [newHotel, setNewHotel] = useState<Partial<Hotel>>({
    name: '',
    location: '',
    price_per_night: 0,
    rating: 5,
    image_url: '',
    description: '',
    amenities: [],
    status: 'approved'
  });

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await hotelDb.getAll();
      setHotels(data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hotelDb.create(newHotel);
      setIsAdding(false);
      setNewHotel({
        name: '',
        location: '',
        price_per_night: 0,
        rating: 5,
        image_url: '',
        description: '',
        amenities: [],
        status: 'approved'
      });
      fetchHotels();
    } catch (error: any) {
      console.error('Error creating hotel:', error);
      alert(`Failed to create hotel: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel listing? This will remove all associated data.')) return;
    try {
      await hotelDb.delete(id);
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
    }
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Synchronizing hotel directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HotelIcon className="w-6 h-6 text-blue-600" />
            Active Properties
          </h2>
          <p className="text-sm text-gray-500">Manage all approved and active hotel listings</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Property
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-3xl shadow-xl border border-blue-50 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Listing</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Property Name</label>
                  <input
                    required
                    type="text"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                    placeholder="e.g. Grand Ethiopian Resort"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Location City</label>
                    <input
                      required
                      type="text"
                      value={newHotel.location}
                      onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                      placeholder="Addis Ababa"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Price / Night (ETB)</label>
                    <input
                      required
                      type="number"
                      value={newHotel.price_per_night}
                      onChange={(e) => setNewHotel({ ...newHotel, price_per_night: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                  <textarea
                    value={newHotel.description}
                    onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 resize-none"
                    rows={4}
                    placeholder="Describe the property's unique features..."
                  ></textarea>
                </div>
              </div>
              
              <div className="space-y-6">
                <ImageUpload 
                  label="Primary Property Photo"
                  currentImage={newHotel.image_url}
                  onUpload={(url) => setNewHotel({ ...newHotel, image_url: url })}
                />
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Admin Tip</p>
                      <p className="text-xs text-blue-700 mt-1">High-quality landscape photos (16:9) perform best on the guest platform.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 rounded-xl text-gray-500 hover:bg-gray-50 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Create Listing
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-blue-100/30 transition-all duration-500 flex flex-col">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={hotel.image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'} 
                alt={hotel.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {hotel.rating}
              </div>
              {hotel.status === 'approved' && (
                <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Live
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <p className="text-white text-lg font-black tracking-tight">{hotel.name}</p>
                <p className="text-white/80 text-xs font-bold flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {hotel.location}
                </p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">
                  {hotel.description || 'Modern luxury property offering exceptional services and breathtaking views of the city.'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter leading-none">Starting from</p>
                    <p className="text-xl font-black text-blue-600 mt-1">
                      {new Intl.NumberFormat().format(hotel.price_per_night)} <span className="text-xs">ETB</span>
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    {/* Placeholder for amenities icons summary */}
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <HotelIcon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-6 border-t border-gray-50">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-bold transition-all active:scale-95">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="flex items-center justify-center px-4 py-3 rounded-2xl bg-gray-50 text-red-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
