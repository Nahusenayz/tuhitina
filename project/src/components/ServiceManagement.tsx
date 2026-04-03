import { useState, useEffect } from 'react';
import { Plus, Bell, Trash2, Edit2, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { serviceDb } from '../lib/db';
import type { HospitalityService } from '../types';

export default function ServiceManagement() {
  const [services, setServices] = useState<HospitalityService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState<Partial<HospitalityService>>({
    name: '',
    description: '',
    price: 0,
    category: 'Amenity',
    is_available: true,
  });

  const fetchServices = async () => {
    try {
      const data = await serviceDb.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await serviceDb.create(newService);
      setIsAdding(false);
      setNewService({ name: '', description: '', price: 0, category: 'Amenity', is_available: true });
      fetchServices();
    } catch (error: any) {
      console.error('Error creating service:', error);
      alert(`Failed to create service: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await serviceDb.delete(id);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="w-6 h-6 text-green-600" />
          Service Management
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Service
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Service Name</label>
                <input
                  required
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Luxury Spa Treatment"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                >
                  <option value="Amenity">Amenity</option>
                  <option value="Dining">Dining</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price (ETB)</label>
                <input
                  required
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2 flex items-center pt-8">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newService.is_available}
                    onChange={(e) => setNewService({ ...newService, is_available: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Available to guests</span>
                </label>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                  rows={3}
                ></textarea>
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
                className="px-6 py-2 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 shadow-lg shadow-green-200"
              >
                Create Service
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-bold">Service</th>
              <th className="px-6 py-4 font-bold">Category</th>
              <th className="px-6 py-4 font-bold">Price</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-500 max-w-xs truncate">{service.description}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center w-fit gap-1">
                    <Tag className="w-3 h-3" />
                    {service.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-900">{new Intl.NumberFormat().format(service.price)} </span>
                  <span className="text-xs text-gray-500 uppercase">ETB</span>
                </td>
                <td className="px-6 py-4">
                  {service.is_available ? (
                    <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Available
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1 text-sm font-medium">
                      <XCircle className="w-4 h-4" /> Unavailable
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
