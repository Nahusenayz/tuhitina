import { useState } from 'react';
import { Lock, User, Hotel, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onLogin: (user: any) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      if (data.user) {
        onLogin(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: hotelName,
            role: 'hotel_owner'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create hotel record
        const { error: hotelError } = await supabase.from('hotels').insert([{
          name: hotelName,
          owner_id: authData.user.id,
          status: 'pending',
          image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
          location: 'Pending Details'
        }]);

        if (hotelError) throw hotelError;

        // 3. Create profile
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          full_name: hotelName,
          role: 'hotel_owner'
        }]);

        if (profileError) throw profileError;

        setSuccess('Registration successful! Please wait for admin approval before logging in.');
        setIsRegistering(false);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Hotel className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">TIHTINA-AI</h1>
          <p className="text-gray-500 font-medium">
            {isRegistering ? 'Hotel Registration' : 'Management Console'}
          </p>
        </div>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hotel Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <Hotel className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="Grand Resort Addis"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="admin@hotel.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register Property' : 'Sign In')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isRegistering ? 'Already have an account? Login' : 'Hotel Owner? Register your Property'}
          </button>
          <div className="mt-4">
            <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
              TIHTINA-AI SECURE ACCESS NODE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
