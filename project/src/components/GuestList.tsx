import { useState, useEffect } from 'react';
import { Users, LogOut } from 'lucide-react';
import { guestDb } from '../lib/db';
import type { Guest } from '../types';

interface GuestListProps {
  propertyId: string;
  refreshTrigger: number;
}

export default function GuestList({ propertyId, refreshTrigger }: GuestListProps) {
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
      loadGuests();
    } catch (error) {
      console.error('Error checking out guest:', error);
      alert('Failed to check out guest');
    }
  };

  const checkedInGuests = guests.filter((g) => g.status === 'checked_in');
  const checkedOutGuests = guests.filter((g) => g.status === 'checked_out');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Loading guests...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Guest List</h2>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Checked In ({checkedInGuests.length})
        </h3>
        {checkedInGuests.length === 0 ? (
          <p className="text-gray-500 text-sm">No guests checked in</p>
        ) : (
          <div className="space-y-2">
            {checkedInGuests.map((guest) => (
              <div
                key={guest.id}
                className="border border-gray-200 rounded-md p-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">{guest.name}</p>
                  <p className="text-sm text-gray-600">Room {guest.room_number}</p>
                  {guest.email && (
                    <p className="text-xs text-gray-500">{guest.email}</p>
                  )}
                </div>
                <button
                  onClick={() => handleCheckout(guest.id, guest.room_number)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors flex items-center gap-1 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Check Out
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Recently Checked Out ({checkedOutGuests.length})
        </h3>
        {checkedOutGuests.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent checkouts</p>
        ) : (
          <div className="space-y-2">
            {checkedOutGuests.slice(0, 5).map((guest) => (
              <div
                key={guest.id}
                className="border border-gray-200 rounded-md p-3 bg-gray-50"
              >
                <p className="font-medium text-gray-700">{guest.name}</p>
                <p className="text-sm text-gray-600">Room {guest.room_number}</p>
                <p className="text-xs text-gray-500">
                  Checked out: {new Date(guest.check_out_date!).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
