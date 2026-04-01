/* Tihtina Guest Platform - API Services (Supabase Integrated) */

// Supabase Configuration
const SUPABASE_URL = 'https://lqvrlesdbgpknrrqudxe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdnJsZXNkYmdwa25ycnF1ZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDg2MjIsImV4cCI6MjA5MDYyNDYyMn0.aSlQN5CqfiMjNVjEb9bWXKF_ZRt_2vjfCi2nes914UM';

// Initialize Supabase Client
// Note: Ensure <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> is in your HTML
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const api = {
    // Authentication
    login: async (email, password) => {
        console.log('API: Logging in with', email);
        if (!supabase) return { success: false, error: 'Supabase not initialized' };
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) return { success: false, error: error.message };
        
        localStorage.setItem('tihtina_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
    },

    signup: async (userData) => {
        console.log('API: Signing up with', userData);
        if (!supabase) return { success: false, error: 'Supabase not initialized' };

        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    full_name: userData.name,
                    phone: userData.phone
                }
            }
        });

        if (error) return { success: false, error: error.message };
        
        // Also create a profile in the guests table
        if (data.user) {
            await supabase.from('guests').insert([{
                id: data.user.id,
                full_name: userData.name,
                phone: userData.phone
            }]);
        }

        return { success: true, user: data.user };
    },

    // Hotels
    getHotels: async () => {
        console.log('API: Fetching hotels from Supabase');
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('hotels')
            .select('*');

        if (error) {
            console.error('Error fetching hotels:', error);
            // Fallback to static data if table doesn't exist yet
            return [
                { id: 1, name: 'Sheraton Addis', location: 'Addis Ababa', price_per_night: 18500, rating: 4.9, image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' }
            ];
        }

        return data;
    },

    getHotelDetails: async (id) => {
        console.log('API: Fetching hotel details for', id);
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('hotels')
            .select('*')
            .eq('id', id)
            .single();

        return data || null;
    },

    // Bookings
    createBooking: async (bookingData) => {
        console.log('API: Creating booking', bookingData);
        if (!supabase) return { success: false, error: 'Supabase not initialized' };

        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { success: false, error: 'Must be logged in to book' };

        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                guest_id: user.id,
                hotel_id: bookingData.hotelId,
                check_in: bookingData.checkIn,
                check_out: bookingData.checkOut,
                status: 'pending',
                total_price: bookingData.totalPrice
            }])
            .select();

        if (error) return { success: false, error: error.message };
        return { success: true, bookingId: data[0].id };
    },

    getBookings: async () => {
        console.log('API: Fetching user bookings');
        if (!supabase) return [];

        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return [];

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                hotels (
                    name
                )
            `)
            .eq('guest_id', user.id);

        if (error) return [];
        return data.map(b => ({
            ...b,
            hotelName: b.hotels?.name || 'Unknown Hotel',
            date: b.check_in
        }));
    },

    // Emergency
    sendEmergencyAlert: async (data) => {
        console.log('API: Sending emergency alert!', data);
        if (!supabase) return { success: false };

        const { error } = await supabase.from('emergency_alerts').insert([data]);
        return { success: !error };
    },

    // User Profile
    getUserProfile: async () => {
        console.log('API: Fetching user profile');
        if (!supabase) return null;
        const { data } = await supabase.auth.getUser();
        return data.user || JSON.parse(localStorage.getItem('tihtina_user'));
    }
};

window.api = api; 
export default api;
