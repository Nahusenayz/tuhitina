import { useState, useEffect } from 'react';
import { Plus, Hotel as HotelIcon, MapPin, Trash2, Edit2, Star, Image as ImageIcon } from 'lucide-react';
import { hotelDb } from '../lib/db';
import type { Hotel } from '../types';

export default function HotelManagement() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHotel, setNewHotel] = useState<Partial<Hotel>>({
    name: '',
    location: '',
    price_per_night: 0,
    rating: 5,
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    amenities: [],
  });

  const fetchHotels = async () => {
    try {
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
        image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        amenities: [],
      });
      fetchHotels();
    } catch (error: any) {
      console.error('Error creating hotel:', error);
      alert(`Failed to create hotel: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    try {
      await hotelDb.delete(id);
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <HotelIcon className="w-6 h-6 text-blue-600" />
          Hotel Management
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Hotel
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hotel Name</label>
                <input
                  required
                  type="text"
                  value={newHotel.name}
                  onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sheraton Addis"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  required
                  type="text"
                  value={newHotel.location}
                  onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Addis Ababa, Ethiopia"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price per Night (ETB)</label>
                <input
                  required
                  type="number"
                  value={newHotel.price_per_night}
                  onChange={(e) => setNewHotel({ ...newHotel, price_per_night: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rating (1-5)</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={newHotel.rating}
                  onChange={(e) => setNewHotel({ ...newHotel, rating: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Image URL</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="url"
                    value={newHotel.image_url}
                    onChange={(e) => setNewHotel({ ...newHotel, image_url: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                  <div className="bg-gray-100 p-2 rounded-xl">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Create Listing
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="relative h-48 overflow-hidden">
              <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-bold text-gray-900">{hotel.rating}</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{hotel.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {hotel.location}
                  </p>
                </div>
                <p className="text-blue-600 font-bold">
                  {new Intl.NumberFormat().format(hotel.price_per_night)} <span className="text-xs uppercase">ETB</span>
                </p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(hotel.id)}
                  className="flex items-center justify-center px-4 py-2 rounded-xl bg-gray-50 text-red-600 hover:bg-red-50 transition-colors"
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
