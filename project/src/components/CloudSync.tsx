import { useState } from 'react';
import { Cloud, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { guestDb, housekeepingDb, execute } from '../lib/db';
import { syncToCloud } from '../lib/supabase';

interface CloudSyncProps {
  propertyId: string;
}

export default function CloudSync({ propertyId }: CloudSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    details?: {
      guests: number;
      preferences: number;
      housekeepingTasks: number;
      pricingHistory: number;
      errors: string[];
    };
  } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const unsyncedGuests = await guestDb.getAllUnsync();

      const guestsToSync = unsyncedGuests.map((g) => ({
        id: g.id,
        property_id: g.property_id,
        name: g.name,
        phone: g.phone,
        email: g.email,
        room_number: g.room_number,
        check_in_date: g.check_in_date,
        check_out_date: g.check_out_date,
        status: g.status,
        created_at: g.created_at,
      }));

      const preferencesResult = await execute(
        `SELECT p.* FROM preferences p
         JOIN guests g ON p.guest_id = g.id
         WHERE g.synced_at IS NULL`
      );
      const preferencesToSync = preferencesResult as unknown[];

      const housekeepingTasks = await housekeepingDb.getAll(propertyId);
      const tasksToSync = housekeepingTasks.filter((t) => t.status === 'clean');

      const pricingResult = await execute(
        'SELECT * FROM pricing_history WHERE property_id = ? ORDER BY created_at DESC LIMIT 10',
        [propertyId]
      );
      const pricingToSync = pricingResult as unknown[];

      const results = await syncToCloud({
        guests: guestsToSync,
        preferences: preferencesToSync,
        housekeepingTasks: tasksToSync,
        pricingHistory: pricingToSync,
      });

      if (results.errors.length === 0) {
        for (const guest of unsyncedGuests) {
          await guestDb.markSynced(guest.id);
        }

        setSyncResult({
          success: true,
          message: 'Data synced successfully!',
          details: results,
        });
      } else {
        setSyncResult({
          success: false,
          message: 'Sync completed with errors',
          details: results,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResult({
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Cloud className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Cloud Sync</h2>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Sync your local data to the cloud for backup and access from other devices.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">What gets synced:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Guest check-ins and check-outs</li>
            <li>• Guest preferences</li>
            <li>• Completed housekeeping tasks</li>
            <li>• Pricing history</li>
          </ul>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {syncResult && (
        <div
          className={`rounded-lg p-4 ${
            syncResult.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {syncResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  syncResult.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {syncResult.message}
              </p>

              {syncResult.details && (
                <div className="mt-3 space-y-1 text-sm">
                  <p className={syncResult.success ? 'text-green-700' : 'text-red-700'}>
                    Guests: {syncResult.details.guests}
                  </p>
                  <p className={syncResult.success ? 'text-green-700' : 'text-red-700'}>
                    Preferences: {syncResult.details.preferences}
                  </p>
                  <p className={syncResult.success ? 'text-green-700' : 'text-red-700'}>
                    Housekeeping: {syncResult.details.housekeepingTasks}
                  </p>
                  <p className={syncResult.success ? 'text-green-700' : 'text-red-700'}>
                    Pricing: {syncResult.details.pricingHistory}
                  </p>

                  {syncResult.details.errors.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="font-semibold text-red-800 mb-1">Errors:</p>
                      {syncResult.details.errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-700">
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
