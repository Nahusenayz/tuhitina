import { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, CheckCircle2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Feedback {
  id: string;
  guest_name: string;
  rating: number;
  comment: string;
  created_at: string;
  status: 'pending' | 'reviewed';
}

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleMarkReviewed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: 'reviewed' })
        .eq('id', id);
      
      if (error) throw error;
      fetchFeedback();
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;
      fetchFeedback();
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-orange-500" />
          Guest Feedback
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No feedback received yet.</p>
          </div>
        ) : (
          feedbacks.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                  <User className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.guest_name}</h3>
                    <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic">"{item.comment}"</p>
                <div className="flex gap-2 pt-2">
                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleMarkReviewed(item.id)}
                      className="px-4 py-1 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Mark Reviewed
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-1 rounded-lg bg-gray-50 text-gray-400 text-sm font-medium hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
