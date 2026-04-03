import { useState, useEffect } from 'react';
import { Plus, Map, MapPin, Trash2, Edit2, Star, Image as ImageIcon, Tag, Loader2, Sparkles } from 'lucide-react';
import { experienceDb } from '../lib/db';
import type { Experience } from '../types';
import ImageUpload from './ImageUpload';

interface ExperienceManagementProps {
  hotelId?: string;
}

export default function ExperienceManagement({ hotelId }: ExperienceManagementProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    name: '',
    location: '',
    price: 0,
    rating: 5,
    category: 'Cultural',
    image_url: '',
    description: '',
  });

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const data = await experienceDb.getAll(hotelId);
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [hotelId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const experienceToCreate = { ...newExperience, hotel_id: hotelId };
      await experienceDb.create(experienceToCreate);
      setIsAdding(false);
      setNewExperience({
        name: '',
        location: '',
        price: 0,
        rating: 5,
        category: 'Cultural',
        image_url: '',
        description: '',
      });
      fetchExperiences();
    } catch (error: any) {
      console.error('Error creating experience:', error);
      alert(`Failed to create experience: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExperience) return;
    try {
      await experienceDb.update(editingExperience.id, editingExperience);
      setEditingExperience(null);
      fetchExperiences();
    } catch (error: any) {
      console.error('Error updating experience:', error);
      alert(`Failed to update experience: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    try {
      await experienceDb.delete(id);
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  if (loading && experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-gray-500 font-medium">Loading experiences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Map className="w-6 h-6 text-purple-600" />
            Experience Management
          </h2>
          <p className="text-sm text-gray-500">Curate unique guest experiences and tours</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Experience
        </button>
      </div>

      {(isAdding || editingExperience) && (
        <div className="bg-white rounded-3xl shadow-xl border border-purple-50 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {editingExperience ? `Editing ${editingExperience.name}` : 'Create New Experience'}
          </h3>
          <form onSubmit={editingExperience ? handleUpdate : handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Experience Name</label>
                  <input
                    required
                    type="text"
                    value={editingExperience ? editingExperience.name : newExperience.name}
                    onChange={(e) => editingExperience
                      ? setEditingExperience({ ...editingExperience, name: e.target.value })
                      : setNewExperience({ ...newExperience, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50"
                    placeholder="e.g. Traditional Coffee Ceremony"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Category</label>
                    <select
                      value={editingExperience ? editingExperience.category : newExperience.category}
                      onChange={(e) => editingExperience
                        ? setEditingExperience({ ...editingExperience, category: e.target.value })
                        : setNewExperience({ ...newExperience, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50"
                    >
                      <option value="Cultural">Cultural</option>
                      <option value="Nature">Nature</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Food & Drink">Food & Drink</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Location</label>
                    <input
                      required
                      type="text"
                      value={editingExperience ? editingExperience.location : newExperience.location}
                      onChange={(e) => editingExperience
                        ? setEditingExperience({ ...editingExperience, location: e.target.value })
                        : setNewExperience({ ...newExperience, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50"
                      placeholder="e.g. Hotel Garden / City Center"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Price per Person (ETB)</label>
                  <input
                    required
                    type="number"
                    value={editingExperience ? editingExperience.price : newExperience.price}
                    onChange={(e) => editingExperience
                      ? setEditingExperience({ ...editingExperience, price: Number(e.target.value) })
                      : setNewExperience({ ...newExperience, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50"
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <ImageUpload 
                  label="Experience Feature Photo"
                  currentImage={editingExperience ? editingExperience.image_url : newExperience.image_url}
                  onUpload={(url) => editingExperience
                    ? setEditingExperience({ ...editingExperience, image_url: url })
                    : setNewExperience({ ...newExperience, image_url: url })}
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                  <textarea
                    value={editingExperience ? editingExperience.description : newExperience.description}
                    onChange={(e) => editingExperience
                      ? setEditingExperience({ ...editingExperience, description: e.target.value })
                      : setNewExperience({ ...newExperience, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-gray-50/50 resize-none"
                    rows={3}
                    placeholder="Provide details about the activity..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingExperience(null);
                }}
                className="px-6 py-2 rounded-xl text-gray-500 hover:bg-gray-50 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95"
              >
                {editingExperience ? 'Save Changes' : 'Create Experience'}
              </button>
            </div>
          </form>
        </div>
      )}

      {experiences.length === 0 ? (
        <div className="bg-white rounded-3xl p-24 text-center border border-gray-100">
          <Sparkles className="w-16 h-16 text-purple-100 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Experiences Found</h3>
          <p className="text-gray-400 font-medium">Start building your guest journey by adding unique experiences.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-500 flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={exp.image_url || 'https://images.unsplash.com/photo-1545638870-42aa19ac5812?auto=format&fit=crop&w=800&q=80'} 
                  alt={exp.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-purple-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {exp.category}
                </div>
                <div className="absolute bottom-4 left-4">
                  <p className="text-white text-lg font-black tracking-tight">{exp.name}</p>
                  <p className="text-white/80 text-xs font-bold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {exp.location}
                  </p>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2">
                    {exp.description || 'Discover a unique experience curated exclusively for our guests.'}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-black text-yellow-700">{exp.rating}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter leading-none">Starting from</p>
                      <p className="text-xl font-black text-purple-600 mt-1">
                        {new Intl.NumberFormat().format(exp.price)} <span className="text-xs">ETB</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-6 border-t border-gray-50">
                  <button 
                    onClick={() => {
                      setEditingExperience(exp);
                      setIsAdding(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 font-bold transition-all active:scale-95"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="flex items-center justify-center px-4 py-3 rounded-2xl bg-gray-50 text-red-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
