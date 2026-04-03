import { useState, useEffect } from 'react';
import { Check, X, Hotel, Mail, Phone, Calendar, Search, User, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HotelRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching requests:', error);
    else setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const { error } = await supabase
        .from('hotels')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.filter(r => r.id !== id));
    } catch (error: any) {
      alert('Error updating status: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    (r.name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (r.contact_name || '').toLowerCase().includes(filter.toLowerCase())
  );

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Fetching registration queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Registration Queue
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium">Verify and onboard new hospitality partners</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search partners or hotels..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-24 text-center border border-gray-100">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-blue-200" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Queue is Empty</h3>
          <p className="text-gray-400 font-medium max-w-xs mx-auto">All recent hotel registration requests have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/20 transition-all duration-300 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex items-start gap-6 flex-1">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100">
                  <Hotel className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-2">{request.name}</h4>
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full w-fit">
                      <User className="w-3.5 h-3.5" />
                      {request.contact_name || 'Anonymous Applicant'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {request.contact_email}
                    </span>
                    <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {request.contact_phone || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-400 font-medium flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      Applied: {new Date(request.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-0 border-gray-50">
                <button
                  disabled={processing === request.id}
                  onClick={() => handleAction(request.id, 'rejected')}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-red-500 hover:bg-red-50 font-black transition-all border-2 border-transparent active:scale-95 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Decline
                </button>
                <button
                  disabled={processing === request.id}
                  onClick={() => handleAction(request.id, 'approved')}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
                >
                  {processing === request.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Approve Partner
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
