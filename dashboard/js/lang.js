/* Tihtina Guest Platform - Language Services */

const translations = {
    'en': {
        'home': 'Home',
        'hotels': 'Hotels',
        'experiences': 'Experiences',
        'bookings': 'Bookings',
        'emergency': 'Emergency',
        'dashboard': 'Dashboard',
        'profile': 'Profile',
        'settings': 'Settings',
        'book_now': 'Book Now',
        'price': 'Price',
        'night': 'Night',
        'search_placeholder': 'Hotel, experience, location...',
        'search_hotels_placeholder': 'Search destinations...',
        'featured_hotels': 'Featured Hotels',
        'top_experiences': 'Top Experiences',
        'nearby_places': 'Nearby Gems',
        'special_offers': 'Special Offers',
        'logout': 'Logout',
        'language_toggle': 'EN | አማርኛ',
        'select_date': 'Select Date',
        'guests': 'Guests',
        'total_price': 'Total Price',
        'confirm_booking': 'Confirm Booking',
        'emergency_mode': 'Emergency Mode',
        'police': 'Police',
        'ambulance': 'Ambulance',
        'reception': 'Reception',
        'instructions': 'Instructions',
        'nearest_hospitals': 'Nearest Hospitals',
        'curated_stays': 'Curated Stays',
        'welcome_home': 'Welcome Home',
        'where_to_stay': 'Where to stay?',
        'guest_portal': 'Guest Portal',
        'manage_booking': 'Manage Stay',
        'ai_concierge': 'AI Concierge',
        'loyalty': 'Loyalty',
        'saved': 'Saved',
        'itinerary': 'Itinerary',
        'payments': 'Payments'
    },
    'am': {
        'home': 'መነሻ',
        'hotels': 'ሆቴሎች',
        'experiences': 'ተሞክሮዎች',
        'bookings': 'ቦታ ማስያዝ',
        'emergency': 'አደጋ',
        'dashboard': 'ዳሽቦርድ',
        'profile': 'ፕሮፋይል',
        'settings': 'ቅንብሮች',
        'book_now': 'አሁን ይያዙ',
        'price': 'ዋጋ',
        'night': 'ሌሊት',
        'search_placeholder': 'ሆቴል፣ ተሞክሮ፣ ቦታ ይፈልጉ...',
        'search_hotels_placeholder': 'መድረሻዎችን ይፈልጉ...',
        'featured_hotels': 'ተለይተው የቀረቡ ሆቴሎች',
        'top_experiences': 'ምርጥ ተሞክሮዎች',
        'nearby_places': 'በአቅራቢያ ያሉ ቦታዎች',
        'special_offers': 'ልዩ ቅናሾች',
        'logout': 'ውጣ',
        'language_toggle': 'EN | አማርኛ',
        'select_date': 'ቀን ይምረጡ',
        'guests': 'እንግዶች',
        'total_price': 'ጠቅላላ ዋጋ',
        'confirm_booking': 'ቦታ ማስያዣውን ያረጋግጡ',
        'emergency_mode': 'የአደጋ ጊዜ ሁኔታ',
        'police': 'ፖሊስ',
        'ambulance': 'አምቡላንስ',
        'reception': 'መቀበያ',
        'instructions': 'መመሪያዎች',
        'nearest_hospitals': 'ቅርብ ያሉ ሆስፒታሎች',
        'curated_stays': 'የተመረጡ ቆይታዎች',
        'welcome_home': 'እንኳን ደህና መጡ',
        'where_to_stay': 'የት ማረፍ ይፈልጋሉ?',
        'guest_portal': 'የእንግዳ መግቢያ',
        'manage_booking': 'ቆይታዎን ያስተዳድሩ',
        'ai_concierge': 'AI ረዳት',
        'loyalty': 'ታማኝነት',
        'saved': 'የተቀመጡ',
        'itinerary': 'የጉዞ እቅድ',
        'payments': 'ክፍያዎች'
    }
};

const lang = {
    current: localStorage.getItem('tihtina_lang') || 'en',

    init: () => {
        lang.updateDOM();
        
        // Handle toggle button
        const toggleBtn = document.getElementById('lang-toggle-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => lang.toggle());
        }
    },

    toggle: () => {
        lang.current = lang.current === 'en' ? 'am' : 'en';
        localStorage.setItem('tihtina_lang', lang.current);
        lang.updateDOM();
    },

    updateDOM: () => {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang.current][key]) {
                if (el.tagName === 'INPUT' && el.type === 'text') {
                    el.placeholder = translations[lang.current][key];
                } else {
                    el.innerHTML = translations[lang.current][key];
                }
            }
        });

        // Update placeholder specifically if data-i18n-placeholder is used
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang.current][key]) {
                el.placeholder = translations[lang.current][key];
            }
        });
    },

    get: (key) => translations[lang.current][key] || key
};

window.lang = lang; // Make it globally accessible
export default lang;
