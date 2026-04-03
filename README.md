# TIHTINA-AI Hospitality OS

A professional, multi-tenant hospitality management system designed for the Ethiopian market. This platform integrates a high-performance **Management OS** for hotel owners and administrators with a sleek, user-centric **Guest Platform**.

## 🌟 Key Features

### 1. Management Dashboard (React/Vite)
- **Role-Based Access Control**: Separate interfaces for Global Administrators and Hotel Owners.
- **Hotel Registration & Approval**: Automated workflow for new partners to join the platform.
- **Property Management**: Comprehensive tools to manage hotel descriptions, pricing, and services.
- **Experience Management**: Curated local activities and tours management.
- **Image Upload System**: Integrated Supabase Storage for high-quality property and experience photos.
- **Legacy Admin Bypass**: Secure hardcoded access for system administrators (`user-admin`).

### 2. Guest Platform (HTML5/Vanilla JS)
- **Real-time Synchronization**: Instant updates from the Management OS via Supabase.
- **Curated Stays**: Dynamic hotel listing with verified status and pricing.
- **Experience Discovery**: Local experiences and activities with direct booking potential.
- **Bilingual Support**: Full English and Amharic localization support.
- **Mobile-First Design**: Glassmorphic UI with smooth micro-animations.

## 🏗️ Architecture

- **Frontend (Management)**: React 18, Vite, TailwindCSS (for layout), Lucide Icons.
- **Frontend (Guest)**: Semantic HTML5, CSS3 Custom Properties, Modular JavaScript.
- **Backend/Database**: 
  - **Supabase**: PostgreSQL database, Authentication, and S3-compatible Storage.
  - **Row Level Security (RLS)**: Enforced data isolation for multi-tenant property management.

## 📂 Project Structure

```bash
├── dashboard/              # Guest Platform (HTML/JS)
│   ├── css/                # Global styles and design system
│   ├── js/                 # API client and app logic
│   ├── index.html          # Guest Homepage
│   └── hotels.html         # Live Hotel Directory
├── project/                # Management OS (React/TypeScript)
│   ├── src/
│   │   ├── components/     # UI components (HotelDashboard, AdminLogin, etc.)
│   │   ├── lib/            # Supabase client and DB helpers
│   │   └── App.tsx         # Dashboard routing and state
├── supabase/               # Database migrations and configuration
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project URL & Anon Key

### Installation

1. **Management OS**:
   ```bash
   cd project
   npm install
   npm run dev
   ```

2. **Guest Platform**:
   Simply serve the `dashboard` directory using any local web server (e.g., Live Server in VS Code).

## 🔐 Administrative Credentials

For system testing and legacy administration:
- **Username**: `user-admin`
- **Password**: `pass-admin123`

---
*Developed with Tihtina AI - Empowering Ethiopian Hospitality.*
