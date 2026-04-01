import { useState } from 'react';
import { Heart } from 'lucide-react';
import { preferenceDb } from '../lib/db';
import type { Preference } from '../types';

interface PreferenceFormProps {
  guestId: string;
  existingPreference?: Preference | null;
  onSuccess: () => void;
}

export default function PreferenceForm({ guestId, existingPreference, onSuccess }: PreferenceFormProps) {
  const [formData, setFormData] = useState({
    pillow_type: existingPreference?.pillow_type || '',
    dietary_restrictions: existingPreference?.dietary_restrictions || '',
    spa_preference: existingPreference?.spa_preference || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await preferenceDb.create({
        guest_id: guestId,
        pillow_type: formData.pillow_type as 'soft' | 'firm' | undefined,
        dietary_restrictions: formData.dietary_restrictions,
        spa_preference: formData.spa_preference,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {existingPreference && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-sm text-green-800">
            Using previous preferences as defaults. You can modify them below.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pillow Type
        </label>
        <select
          value={formData.pillow_type}
          onChange={(e) => setFormData({ ...formData, pillow_type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select preference</option>
          <option value="soft">Soft</option>
          <option value="firm">Firm</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dietary Restrictions
        </label>
        <textarea
          value={formData.dietary_restrictions}
          onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
          placeholder="e.g., Vegetarian, Gluten-free"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Spa Preference
        </label>
        <input
          type="text"
          value={formData.spa_preference}
          onChange={(e) => setFormData({ ...formData, spa_preference: e.target.value })}
          placeholder="e.g., Hot stone massage"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        <Heart className="w-4 h-4" />
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}
