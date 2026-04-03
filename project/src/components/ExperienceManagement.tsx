import { useState, useEffect } from 'react';
import { Plus, Map, MapPin, Trash2, Edit2, Star, Image as ImageIcon, Tag } from 'lucide-react';
import { experienceDb } from '../lib/db';
import type { Experience } from '../types';

export default function ExperienceManagement() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    name: '',
    location: '',
    price: 0,
    rating: 5,
    category: 'Cultural',
    image_url: 'https://images.unsplash.com/photo-1545638870-42aa19ac5812?auto=format&fit=crop&w=800&q=80',
    description: '',
  });

  const fetchExperiences = async () => {
    try {
      const data = await experienceDb.getAll();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await experienceDb.create(newExperience);
      setIsAdding(false);
      setNewExperience({
        name: '',
        location: '',
        price: 0,
        rating: 5,
        category: 'Cultural',
        image_url: 'https://images.unsplash.com/photo-1545638870-42aa19ac5812?auto=format&fit=crop&w=800&q=80',
        description: '',
      });
      fetchExperiences();
    } catch (error) {
      console.error('Error creating experience:', error);
      alert('Failed to create experience');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await experienceDb.delete(id);
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Map className="w-6 h-6 text-purple-600" />
          Experience Management
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Experience
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Experience Name</label>
                <input
                  required
                  type="text"
                  value={newExperience.name}
                  onChange={(e) => setNewExperience({ ...newExperience, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Coffee Ceremony"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newExperience.category}
                  onChange={(e) => setNewExperience({ ...newExperience, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Cultural">Cultural</option>
                  <option value="Nature">Nature</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Food & Drink">Food & Drink</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  required
                  type="text"
                  value={newExperience.location}
                  onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price (ETB)</label>
                <input
                  required
                  type="number"
                  value={newExperience.price}
                  onChange={(e) => setNewExperience({ ...newExperience, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Image URL</label>
                <input
                  required
                  type="url"
                  value={newExperience.image_url}
                  onChange={(e) => setNewExperience({ ...newExperience, image_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200"
              >
                Create Experience
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences.map((exp) => (
          <div key={exp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="relative h-48 overflow-hidden">
              <img src={exp.image_url} alt={exp.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute top-4 left-4 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {exp.category}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{exp.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {exp.location}
                  </p>
                </div>
                <p className="text-purple-600 font-bold">
                  {new Intl.NumberFormat().format(exp.price)} <span className="text-xs">ETB</span>
                </p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
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
