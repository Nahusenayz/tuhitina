# TIHTINA-AI - Offline-First Hospitality Operating System

TIHTINA-AI is a comprehensive, offline-first hospitality management system built with Electron, React, TypeScript, and SQLite. Designed for hotels and hospitality businesses in Ethiopia, it features local-first data storage with cloud sync capabilities.

## Features

### 1. Guest Check-in/out
- Fast offline guest registration
- Automatic or manual room assignment
- Email-based guest profile lookup
- Automatic preference recall for returning guests
- SQLite-powered local storage

### 2. Guest Preferences Management
- Track pillow preferences (soft/firm)
- Dietary restrictions tracking
- Spa preference management
- Persistent across visits via email matching

### 3. Housekeeping Management
- Automatic dirty room detection on checkout
- Task status tracking (dirty, cleaning, clean)
- Real-time status dashboard
- Offline task management

### 4. Dynamic Pricing
- Real-time USD to ETB currency conversion
- Automatic demand-based pricing adjustments
- Occupancy rate calculation
- Price history tracking
- Integration with exchange rate APIs

### 5. License Activation (Mock Telebirr)
- Simulated Telebirr payment integration
- HMAC-based activation key generation
- License expiry tracking
- Annual license management

### 6. Cloud Sync
- One-click sync to Supabase PostgreSQL
- Syncs guests, preferences, housekeeping, and pricing
- Offline-first with periodic sync
- Conflict-free data replication

## Tech Stack

### Desktop Application
- **Framework**: Electron 41
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Local Database**: SQLite (better-sqlite3)

### Cloud Backend
- **Database**: Supabase (PostgreSQL)
- **Sync**: Real-time via Supabase client
- **Authentication**: Supabase Auth (optional)

## Project Structure

```
tihtina-ai/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry
│   ├── preload.ts        # IPC bridge
│   └── database.ts       # SQLite initialization
├── src/
│   ├── components/       # React components
│   │   ├── GuestCheckin.tsx
│   │   ├── GuestList.tsx
│   │   ├── PreferenceForm.tsx
│   │   ├── Housekeeping.tsx
│   │   ├── DynamicPricing.tsx
│   │   ├── LicenseActivation.tsx
│   │   └── CloudSync.tsx
│   ├── lib/             # Utilities
│   │   ├── db.ts        # SQLite helpers
│   │   └── supabase.ts  # Cloud sync
│   ├── types/           # TypeScript types
│   │   ├── index.ts
│   │   └── electron.d.ts
│   ├── App.tsx          # Main application
│   └── main.tsx         # React entry
├── .env                 # Environment variables
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for cloud sync)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   The `.env` file is already configured with the Supabase connection. Update if needed:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PROPERTY_ID=your_property_id
   LICENSE_SECRET_KEY=your_secret_key
   ```

3. **Database Setup**

   The Supabase database schema is already configured with the following tables:
   - `guests` - Guest information
   - `preferences` - Guest preferences
   - `housekeeping_tasks` - Cleaning tasks
   - `pricing_history` - Pricing records
   - `license_activations` - License keys
   - `audit_logs` - Audit trail

   Local SQLite database is created automatically on first run.

### Development

```bash
npm run dev
```

This starts the Vite dev server. For Electron development:

```bash
npm run electron:dev
```

### Building for Production

```bash
npm run build
```

This will:
1. Compile TypeScript
2. Build the React app with Vite
3. Package the Electron app with electron-builder
4. Create installers in the `release/` directory

### Platform-Specific Builds

- **Windows**: Creates NSIS installer
- **macOS**: Creates DMG file
- **Linux**: Creates AppImage

## Usage Guide

### First Time Setup

1. **Launch the application**
2. **Activate License**
   - Navigate to "License" tab
   - Click "Pay via Telebirr"
   - Complete mock payment
   - License key is generated automatically

3. **Configure Property ID**
   - Set your property ID in `.env` file
   - Restart application

### Daily Operations

#### Check-in Guest
1. Go to "Check-in" tab
2. Enter guest details (name, phone, email)
3. Assign room (or leave blank for auto-assign)
4. System checks for existing preferences
5. Set preferences if new guest
6. Guest is checked in

#### Manage Guests
1. Go to "Guests" tab
2. View all checked-in guests
3. Click "Check Out" to check out a guest
4. View recent checkout history

#### Housekeeping
1. Go to "Housekeeping" tab
2. View dirty rooms (from checkouts)
3. Click "Start Cleaning" to begin
4. Click "Mark Clean" when done

#### Dynamic Pricing
1. Go to "Pricing" tab
2. Set base price in USD
3. Click "Fetch Rate" for current exchange rate
4. System calculates demand multiplier based on occupancy
5. Click "Save Pricing" to record

#### Cloud Sync
1. Go to "Cloud Sync" tab
2. Review what will be synced
3. Click "Sync Now"
4. Monitor sync status and results

## Database Schema

### Local (SQLite)
All tables replicate the cloud schema using SQLite data types:
- TEXT for strings and UUIDs
- REAL for numbers
- INTEGER for booleans (0/1)

### Cloud (Supabase PostgreSQL)
- Row Level Security (RLS) enabled on all tables
- Authenticated access required
- Indexed on key fields for performance

## Security Considerations

- Local database stored in user data directory
- Encrypted at rest (OS-level)
- Cloud sync uses HTTPS
- API keys stored in environment variables
- No passwords stored in plain text

## Troubleshooting

### App won't start
- Check Node.js version (18+)
- Delete `node_modules` and reinstall
- Check for port conflicts (5173)

### Database errors
- Delete local database file and restart
- Check file permissions in user data directory

### Sync fails
- Verify internet connection
- Check Supabase credentials in `.env`
- Check Supabase project status

### Build fails
- Run `npm run typecheck` to check TypeScript errors
- Clear build cache: `rm -rf dist dist-electron`
- Rebuild: `npm run build`

## Future Enhancements

- **Real Telebirr Integration**: Production payment processing
- **Multi-property Support**: Manage multiple hotels
- **Staff Management**: User roles and permissions
- **Reporting**: Analytics and business intelligence
- **WhatsApp Integration**: Guest communication
- **Local AI**: Chatbot for guest services
- **Inventory Management**: Stock tracking
- **POS Integration**: Restaurant and bar

## License

Proprietary - TIHTINA-AI
Annual license required for production use.

## Support

For support and inquiries:
- Email: support@tihtina-ai.com
- Documentation: docs.tihtina-ai.com

---

Built with ❤️ for Ethiopian hospitality businesses
