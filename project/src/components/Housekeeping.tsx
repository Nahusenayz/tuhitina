import { useState, useEffect } from 'react';
import { ClipboardList, Check, Clock, AlertCircle } from 'lucide-react';
import { housekeepingDb, guestDb } from '../lib/db';
import type { HousekeepingTask } from '../types';

interface HousekeepingProps {
  propertyId: string;
}

export default function Housekeeping({ propertyId }: HousekeepingProps) {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
    checkForNewDirtyRooms();
  }, [propertyId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const allTasks = await housekeepingDb.getAll(propertyId);
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewDirtyRooms = async () => {
    try {
      const guests = await guestDb.getAll(propertyId);
      const checkedOutGuests = guests.filter((g) => g.status === 'checked_out');

      for (const guest of checkedOutGuests) {
        const existingTask = tasks.find(
          (t) => t.room_number === guest.room_number && t.status !== 'clean'
        );

        if (!existingTask) {
          await housekeepingDb.create({
            property_id: propertyId,
            room_number: guest.room_number,
            status: 'dirty',
          });
        }
      }

      loadTasks();
    } catch (error) {
      console.error('Error checking dirty rooms:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: HousekeepingTask['status']) => {
    try {
      await housekeepingDb.updateStatus(taskId, status);
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const getStatusIcon = (status: HousekeepingTask['status']) => {
    switch (status) {
      case 'dirty':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'cleaning':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'clean':
        return <Check className="w-5 h-5 text-green-600" />;
    }
  };

  const getStatusColor = (status: HousekeepingTask['status']) => {
    switch (status) {
      case 'dirty':
        return 'bg-red-50 border-red-200';
      case 'cleaning':
        return 'bg-yellow-50 border-yellow-200';
      case 'clean':
        return 'bg-green-50 border-green-200';
    }
  };

  const dirtyTasks = tasks.filter((t) => t.status === 'dirty');
  const cleaningTasks = tasks.filter((t) => t.status === 'cleaning');
  const cleanTasks = tasks.filter((t) => t.status === 'clean');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Housekeeping Tasks</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-red-600">{dirtyTasks.length}</p>
          <p className="text-sm text-red-700">Dirty Rooms</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-yellow-600">{cleaningTasks.length}</p>
          <p className="text-sm text-yellow-700">In Progress</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{cleanTasks.length}</p>
          <p className="text-sm text-green-700">Clean Rooms</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Needs Attention</h3>
          {dirtyTasks.length === 0 ? (
            <p className="text-gray-500 text-sm">All rooms cleaned!</p>
          ) : (
            <div className="space-y-2">
              {dirtyTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-md p-4 flex justify-between items-center ${getStatusColor(
                    task.status
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-medium text-gray-800">Room {task.room_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(task.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'cleaning')}
                    className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 transition-colors text-sm"
                  >
                    Start Cleaning
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cleaningTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">In Progress</h3>
            <div className="space-y-2">
              {cleaningTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-md p-4 flex justify-between items-center ${getStatusColor(
                    task.status
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="font-medium text-gray-800">Room {task.room_number}</p>
                      <p className="text-xs text-gray-500">
                        Started: {new Date(task.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'clean')}
                    className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Mark Clean
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
