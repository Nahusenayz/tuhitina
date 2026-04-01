/* Tihtina Guest Platform - Loyalty Points System */

const LOYALTY_KEY = 'tihtina_loyalty_points';

const loyalty = {
    getPoints: () => {
        return parseInt(localStorage.getItem(LOYALTY_KEY)) || 1250; // Initial mock points
    },
    
    addPoints: (amount) => {
        const current = loyalty.getPoints();
        localStorage.setItem(LOYALTY_KEY, current + amount);
        return current + amount;
    },
    
    getTier: () => {
        const points = loyalty.getPoints();
        if (points > 5000) return 'Gold';
        if (points > 2000) return 'Silver';
        return 'Bronze';
    }
};

window.loyalty = loyalty;
export default loyalty;
