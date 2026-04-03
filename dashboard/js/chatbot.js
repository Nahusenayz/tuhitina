/**
 * Tihtina AI Assistant
 * A lightweight, knowledge-based chatbot for the guest platform.
 */

const TIHTINA_AI_MEMORY = {
    app: {
        keywords: ['app', 'what is this', 'tihtina', 'about', 'platform', 'os', 'how it works'],
        response: "Tihtina-AI Hospitality OS is a premium platform designed for modern Ethiopian hospitality. It connects guests like you with curated hotels and authentic local experiences, while providing hotel owners with professional tools to manage their properties in real-time."
    },
    emergency: {
        keywords: ['emergency', 'help', 'police', 'ambulance', 'fire', 'accident', '991', '907', '939', 'hospital'],
        response: "🚨 **Emergency Contacts in Ethiopia:**\n- **Police:** 991\n- **Fire Department:** 939\n- **Medical Emergency (Ambulance):** 907 or 92 (Red Cross)\n- **Tourism Protection:** Contact 991 and ask for tourism police."
    },
    hospitality: {
        keywords: ['food', 'eat', 'coffee', 'culture', 'tradition', 'habesha', 'injera', 'lalibela', 'axum', 'simien', 'buna'],
        response: "☕ **Ethiopian Hospitality Tips:**\n- **Coffee Ceremony (Buna):** Don't miss it! It's our symbol of friendship. You'll usually have three cups: Abol, Tona, and Bereka.\n- **Injera:** Our staple sourdough flatbread. Try it with *Doro Wat* (spicy chicken stew).\n- **Sites:** Visit Lalibela's rock-hewn churches or Addis Ababa's Unity Park.\n- **Currency:** Ethiopian Birr (ETB). ATMs are available in all major hotels."
    },
    bookings: {
        keywords: ['book', 'reservation', 'my bookings', 'cancel', 'check-in', 'hotel'],
        response: "You can view and manage your reservations in the **My Bookings** tab in the navigation bar. For specific hotel questions, you can contact the property directly after booking."
    },
    greetings: {
        keywords: ['hello', 'hi', 'hey', 'selam', 'ciao', 'tena yistillin'],
        response: "Selam! I am Tihtina, your AI personal assistant. How can I help you explore Ethiopia today?"
    }
};

class TihtinaChatbot {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.renderUI();
        this.setupListeners();
    }

    renderUI() {
        // Only render if not already present
        if (document.getElementById('tihtina-chatbot-container')) return;

        const container = document.createElement('div');
        container.id = 'tihtina-chatbot-container';
        container.className = 'chatbot-window hidden';
        container.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-info">
                    <div class="chatbot-avatar">
                        <i class="fas fa-wand-magic-sparkles"></i>
                    </div>
                    <div>
                        <p class="chatbot-name">Tihtina AI</p>
                        <p class="chatbot-status">Online Assistant</p>
                    </div>
                </div>
                <button id="close-chatbot" class="chatbot-close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="chatbot-messages" class="chatbot-messages">
                <div class="message bot-message">
                    Selam! I'm Tihtina. How can I help you with your stay in Ethiopia?
                </div>
            </div>
            <div class="chatbot-input-area">
                <input type="text" id="chatbot-input" placeholder="Ask about the app, Ethiopia, or emergencies..." autocomplete="off">
                <button id="send-chatbot-msg" class="chatbot-send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        document.body.appendChild(container);
    }

    setupListeners() {
        const toggleBtn = document.getElementById('chatbot-toggle-btn');
        const closeBtn = document.getElementById('close-chatbot');
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.getElementById('send-chatbot-msg');
        const window = document.getElementById('tihtina-chatbot-container');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleWindow());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleWindow(false));
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSendMessage();
            });
        }
    }

    toggleWindow(force) {
        const window = document.getElementById('tihtina-chatbot-container');
        this.isOpen = typeof force === 'boolean' ? force : !this.isOpen;
        if (this.isOpen) {
            window.classList.remove('hidden');
            window.classList.add('fade-in-up');
            document.getElementById('chatbot-input').focus();
        } else {
            window.classList.add('hidden');
            window.classList.remove('fade-in-up');
        }
    }

    handleSendMessage() {
        const input = document.getElementById('chatbot-input');
        const query = input.value.trim();
        if (!query) return;

        this.addMessage(query, 'user-message');
        input.value = '';

        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.getAIResponse(query);
            this.addMessage(response, 'bot-message');
        }, 800);
    }

    getAIResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Match sections based on keywords
        for (const key in TIHTINA_AI_MEMORY) {
            const section = TIHTINA_AI_MEMORY[key];
            if (section.keywords.some(kw => lowerQuery.includes(kw))) {
                return section.response;
            }
        }

        return "I'm not sure I understand. You can ask me about the Tihtina App, Ethiopian emergency numbers, or hospitality tips like where to eat or visit!";
    }

    addMessage(text, className) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.className = `message ${className}`;
        div.innerHTML = text.replace(/\n/g, '<br>');
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.className = 'message bot-message typing';
        div.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.tihtinaChatbot = new TihtinaChatbot();
});
