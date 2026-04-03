export interface Guest {
  id: string;
  property_id: string;
  name: string;
  phone?: string;
  email?: string;
  room_number: string;
  check_in_date: string;
  check_out_date?: string;
  status: 'checked_in' | 'checked_out';
  created_at: string;
  synced_at?: string;
}

export interface Preference {
  id: string;
  guest_id: string;
  pillow_type?: 'soft' | 'firm';
  dietary_restrictions?: string;
  spa_preference?: string;
  created_at: string;
}

export interface HousekeepingTask {
  id: string;
  property_id: string;
  room_number: string;
  status: 'dirty' | 'cleaning' | 'clean';
  assigned_to?: string;
  created_at: string;
  completed_at?: string;
}

export interface PricingHistory {
  id: string;
  property_id: string;
  base_price_usd: number;
  exchange_rate: number;
  demand_multiplier: number;
  final_price_etb: number;
  occupancy_rate?: number;
  created_at: string;
}

export interface LicenseActivation {
  id: string;
  property_id: string;
  activation_key: string;
  expiry_date: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  property_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface GuestWithPreferences extends Guest {
  preferences?: Preference;
}

export interface EmergencyAlert {
  id: string;
  guest_id?: string;
  type: string;
  location: string;
  status: 'active' | 'acknowledged';
  timestamp: string;
  acknowledged_at?: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  price_per_night: number;
  rating: number;
  image_url: string;
  description?: string;
  amenities?: string[];
  created_at: string;
}

export interface Experience {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image_url: string;
  description?: string;
  category: string;
  created_at: string;
}

export interface HospitalityService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
}
