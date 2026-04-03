import { useState, useEffect } from 'react';
import { Plus, Bell, Trash2, Edit2, Tag, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { serviceDb } from '../lib/db';
import type { HospitalityService } from '../types';
import ImageUpload from './ImageUpload';

interface ServiceManagementProps {
  hotelId?: string;
}

export default function ServiceManagement({ hotelId }: ServiceManagementProps) {
  const [services, setServices] = useState<HospitalityService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingService, setEditingService] = useState<HospitalityService | null>(null);
  const [newService, setNewService] = useState<Partial<HospitalityService>>({
    name: '',
    description: '',
    price: 0,
    category: 'Amenity',
    is_available: true,
    image_url: ''
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await serviceDb.getAll(hotelId);
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [hotelId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serviceToCreate = { ...newService, hotel_id: hotelId };
      await serviceDb.create(serviceToCreate);
      setIsAdding(false);
      setNewService({ 
        name: '', 
        description: '', 
        price: 0, 
        category: 'Amenity', 
        is_available: true,
        image_url: '' 
      });
      fetchServices();
    } catch (error: any) {
      console.error('Error creating service:', error);
      alert(`Failed to create service: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      await serviceDb.update(editingService.id, editingService);
      setEditingService(null);
      fetchServices();
    } catch (error: any) {
      console.error('Error updating service:', error);
      alert(`Failed to update service: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await serviceDb.delete(id);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Service Management
          </h2>
          <p className="text-sm text-gray-500">Manage on-property services and amenities</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Service
        </button>
      </div>

      {(isAdding || editingService) && (
        <div className="bg-white rounded-3xl shadow-xl border border-blue-50 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {editingService ? `Editing ${editingService.name}` : 'Create New Service'}
          </h3>
          <form onSubmit={editingService ? handleUpdate : handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Service Name</label>
                  <input
                    required
                    type="text"
                    value={editingService ? editingService.name : newService.name}
                    onChange={(e) => editingService 
                      ? setEditingService({ ...editingService, name: e.target.value })
                      : setNewService({ ...newService, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                    placeholder="e.g. VIP Airport Transfer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Category</label>
                    <select
                      value={editingService ? editingService.category : newService.category}
                      onChange={(e) => editingService 
                        ? setEditingService({ ...editingService, category: e.target.value })
                        : setNewService({ ...newService, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                    >
                      <option value="Amenity">Amenity</option>
                      <option value="Dining">Dining</option>
                      <option value="Wellness">Wellness</option>
                      <option value="Transport">Transport</option>
                      <option value="Concierge">Concierge</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Price (ETB)</label>
                    <input
                      required
                      type="number"
                      value={editingService ? editingService.price : newService.price}
                      onChange={(e) => editingService 
                        ? setEditingService({ ...editingService, price: Number(e.target.value) })
                        : setNewService({ ...newService, price: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                </div>
                <div className="space-y-2 flex items-center pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingService ? editingService.is_available : newService.is_available}
                      onChange={(e) => editingService 
                        ? setEditingService({ ...editingService, is_available: e.target.checked })
                        : setNewService({ ...newService, is_available: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-bold text-gray-700 text-sm">Active & Visible</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-6">
                <ImageUpload 
                  label="Service Icon/Photo"
                  currentImage={editingService ? editingService.image_url : newService.image_url}
                  onUpload={(url) => editingService 
                    ? setEditingService({ ...editingService, image_url: url })
                    : setNewService({ ...newService, image_url: url })}
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Description</label>
                  <textarea
                    value={editingService ? editingService.description : newService.description}
                    onChange={(e) => editingService 
                      ? setEditingService({ ...editingService, description: e.target.value })
                      : setNewService({ ...newService, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 resize-none"
                    rows={3}
                    placeholder="Describe what's included in this service..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingService(null);
                }}
                className="px-6 py-2 rounded-xl text-gray-500 hover:bg-gray-50 font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                {editingService ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5 font-black">Service Detail</th>
                <th className="px-8 py-5 font-black">Category</th>
                <th className="px-8 py-5 font-black text-center">Base Price</th>
                <th className="px-8 py-5 font-black">Availability</th>
                <th className="px-8 py-5 font-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">
                    No services found. Add your first service to get started!
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                          {service.image_url ? (
                            <img src={service.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Bell className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-none mb-1">{service.name}</p>
                          <p className="text-xs text-gray-400 font-medium max-w-xs truncate">{service.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tight flex items-center w-fit gap-1 border border-blue-100/50">
                        <Tag className="w-3 h-3" />
                        {service.category}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="font-black text-gray-900">{new Intl.NumberFormat().format(service.price)} </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ETB</span>
                    </td>
                    <td className="px-8 py-5">
                      {service.is_available ? (
                        <span className="text-green-500 flex items-center gap-1.5 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-gray-300 flex items-center gap-1.5 text-xs font-bold">
                          <XCircle className="w-4 h-4" /> DISABLED
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingService(service);
                            setIsAdding(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 text-gray-300 hover:text-blue-600 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-gray-300 hover:text-red-500 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
