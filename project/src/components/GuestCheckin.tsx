import { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import { guestDb, preferenceDb } from '../lib/db';
import type { Guest, Preference } from '../types';
import PreferenceForm from './PreferenceForm';

interface GuestCheckinProps {
  propertyId: string;
  onSuccess: () => void;
}

export default function GuestCheckin({ propertyId, onSuccess }: GuestCheckinProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    room_number: '',
  });
  const [existingPreference, setExistingPreference] = useState<Preference | null>(null);
  const [showPreferenceForm, setShowPreferenceForm] = useState(false);
  const [currentGuestId, setCurrentGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      checkExistingPreferences();
    } else {
      setExistingPreference(null);
    }
  }, [formData.email]);

  const checkExistingPreferences = async () => {
    if (!formData.email) return;
    const pref = await preferenceDb.getByGuestEmail(formData.email);
    setExistingPreference(pref);
  };

  const generateRoomNumber = () => {
    const floor = Math.floor(Math.random() * 5) + 1;
    const room = Math.floor(Math.random() * 20) + 1;
    return `${floor}${room.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roomNumber = formData.room_number || generateRoomNumber();

      const guest: Omit<Guest, 'id' | 'created_at' | 'synced_at'> = {
        property_id: propertyId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        room_number: roomNumber,
        check_in_date: new Date().toISOString(),
        status: 'checked_in',
      };

      const createdGuest = await guestDb.create(guest);
      setCurrentGuestId(createdGuest.id);
      setShowPreferenceForm(true);
    } catch (error) {
      console.error('Error checking in guest:', error);
      alert('Failed to check in guest');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceSaved = () => {
    setFormData({ name: '', phone: '', email: '', room_number: '' });
    setShowPreferenceForm(false);
    setCurrentGuestId(null);
    setExistingPreference(null);
    onSuccess();
  };

  const handleSkipPreferences = () => {
    setFormData({ name: '', phone: '', email: '', room_number: '' });
    setShowPreferenceForm(false);
    setCurrentGuestId(null);
    setExistingPreference(null);
    onSuccess();
  };

  if (showPreferenceForm && currentGuestId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Guest Preferences</h2>
          <button
            onClick={handleSkipPreferences}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
        </div>
        <PreferenceForm
          guestId={currentGuestId}
          existingPreference={existingPreference}
          onSuccess={handlePreferenceSaved}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Guest Check-in</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {existingPreference && (
            <p className="mt-1 text-sm text-green-600">
              Previous preferences found for this guest!
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Number (leave empty for auto-assign)
          </label>
          <input
            type="text"
            value={formData.room_number}
            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
            placeholder="e.g., 301"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Checking in...' : 'Check In'}
        </button>
      </form>
    </div>
  );
}
