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
        console.log('API: Fetching approved hotels from Supabase');
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('hotels')
            .select('*')
            .eq('status', 'approved');

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
        
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user || JSON.parse(localStorage.getItem('tihtina_user'));
        
        if (!user) return null;

        // Fetch additional info from guests table
        const { data: guestData, error } = await supabase
            .from('guests')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching guest profile:', error);
            return user; // Return auth user as fallback
        }

        return { ...user, ...guestData };
    },

    updateUserProfile: async (userData) => {
        console.log('API: Updating user profile', userData);
        if (!supabase) return { success: false, error: 'Supabase not initialized' };

        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return { success: false, error: 'Not logged in' };

        const { error } = await supabase
            .from('guests')
            .update({
                full_name: userData.name,
                phone: userData.phone
            })
            .eq('id', authData.user.id);

        if (error) return { success: false, error: error.message };
        return { success: true };
    },

    // Experiences
    getExperiences: async () => {
        console.log('API: Fetching experiences');
        if (!supabase) return [];
        const { data, error } = await supabase.from('experiences').select('*');
        if (error) return [];
        return data;
    },

    // Services
    getServices: async () => {
        console.log('API: Fetching services');
        if (!supabase) return [];
        const { data, error } = await supabase.from('services').select('*').eq('is_available', true);
        if (error) return [];
        return data;
    },

    // Feedback
    submitFeedback: async (feedbackData) => {
        console.log('API: Submitting feedback', feedbackData);
        if (!supabase) return { success: false };
        const { error } = await supabase.from('feedback').insert([{
            guest_name: feedbackData.name,
            rating: feedbackData.rating,
            comment: feedbackData.comment,
            status: 'pending'
        }]);
        return { success: !error };
    },

    // --- SUPER ADMIN METHODS ---
    adminGetAllHotels: async () => {
        console.log('API: [Admin] Fetching all hotels');
        if (!supabase) return [];
        const { data, error } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching admin hotels:', error);
            return [];
        }
        return data;
    },

    adminAddHotel: async (hotelData) => {
        console.log('API: [Admin] Adding new hotel', hotelData);
        if (!supabase) return { success: false, error: 'Supabase not initialized' };
        const { data, error } = await supabase.from('hotels').insert([{
            name: hotelData.name,
            location: hotelData.location,
            price_per_night: hotelData.price,
            rating: hotelData.rating || 4.5,
            image_url: hotelData.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
            status: 'approved'
        }]).select();
        if (error) return { success: false, error: error.message };
        return { success: true, hotel: data[0] };
    },

    adminDeleteHotel: async (id) => {
        console.log('API: [Admin] Deleting hotel', id);
        if (!supabase) return { success: false, error: 'Supabase not initialized' };
        const { error } = await supabase.from('hotels').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
    },

    adminGetAllUsers: async () => {
        console.log('API: [Admin] Fetching all users');
        if (!supabase) return [];
        const { data, error } = await supabase.from('guests').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching admin users:', error);
            return [];
        }
        return data;
    },

    adminGetStats: async () => {
        console.log('API: [Admin] Calculating stats');
        if (!supabase) return { hotels: 0, users: 0, bookings: 0 };
        
        const [hotels, users, bookings] = await Promise.all([
            supabase.from('hotels').select('id', { count: 'exact', head: true }),
            supabase.from('guests').select('id', { count: 'exact', head: true }),
            supabase.from('bookings').select('id', { count: 'exact', head: true })
        ]);

        return {
            hotels: hotels.count || 0,
            users: users.count || 0,
            bookings: bookings.count || 0,
            revenue: 245000 // Placeholder for now
        };
    }
};

window.api = api; 
export default api;
