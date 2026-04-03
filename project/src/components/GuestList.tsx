import { useState, useEffect } from 'react';
import { Users, LogOut, Trash2, UserPlus } from 'lucide-react';
import { guestDb } from '../lib/db';
import { supabase } from '../lib/supabase';
import type { Guest } from '../types';

interface GuestListProps {
  propertyId: string;
  refreshTrigger: number;
  onAddUser?: () => void;
}

export default function GuestList({ propertyId, refreshTrigger, onAddUser }: GuestListProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuests();
  }, [propertyId, refreshTrigger]);

  const loadGuests = async () => {
    setLoading(true);
    try {
      const allGuests = await guestDb.getAll(propertyId);
      setGuests(allGuests);
    } catch (error) {
      console.error('Error loading guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (guestId: string, roomNumber: string) => {
    if (!confirm(`Check out guest from room ${roomNumber}?`)) return;

    try {
      await guestDb.checkout(guestId);
      // Try to sync checkout to cloud if online
      await supabase.from('guests').update({ status: 'checked_out', check_out_date: new Date().toISOString() }).eq('id', guestId);
      loadGuests();
    } catch (error) {
      console.error('Error checking out guest:', error);
      alert('Failed to check out guest');
    }
  };

  const handleDelete = async (guestId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete guest ${name}? This will also remove them from the cloud.`)) return;

    try {
      await guestDb.delete(guestId);
      // Delete from cloud
      await supabase.from('guests').delete().eq('id', guestId);
      loadGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Failed to delete guest');
    }
  };

  const checkedInGuests = guests.filter((g) => g.status === 'checked_in');
  const checkedOutGuests = guests.filter((g) => g.status === 'checked_out');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <div className="animate-pulse flex space-y-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                <div className="h-2 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Guest List</h2>
        </div>
        <button
          onClick={onAddUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Add New Guest
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Checked In ({checkedInGuests.length})
        </h3>
        {checkedInGuests.length === 0 ? (
          <p className="text-gray-400 text-sm italic bg-gray-50 p-4 rounded-md border border-dashed border-gray-200">No guests currently checked in</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
            {checkedInGuests.map((guest) => (
              <div
                key={guest.id}
                className="group border border-gray-100 rounded-lg p-4 flex justify-between items-center hover:shadow-md hover:border-blue-100 transition-all bg-white"
              >
                <div>
                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{guest.name}</p>
                  <p className="text-sm text-gray-500 font-medium">Room {guest.room_number}</p>
                  {guest.email && (
                    <p className="text-xs text-gray-400 mt-1">{guest.email}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCheckout(guest.id, guest.room_number)}
                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Check Out
                  </button>
                  <button
                    onClick={() => handleDelete(guest.id, guest.name)}
                    className="p-1.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Guest"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
          Recently Checked Out ({checkedOutGuests.length})
        </h3>
        {checkedOutGuests.length === 0 ? (
          <p className="text-gray-400 text-sm italic bg-gray-50 p-4 rounded-md border border-dashed border-gray-200">No recent checkout history</p>
        ) : (
          <div className="space-y-2">
            {checkedOutGuests.slice(0, 5).map((guest) => (
              <div
                key={guest.id}
                className="border border-gray-50 rounded-lg p-4 bg-gray-50/50 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-700">{guest.name}</p>
                  <p className="text-xs text-gray-500">Room {guest.room_number} • Checked out: {new Date(guest.check_out_date!).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleDelete(guest.id, guest.name)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
