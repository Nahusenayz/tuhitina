import { supabase } from './supabase';
import type { 
  Guest, 
  Preference, 
  HousekeepingTask, 
  PricingHistory, 
  LicenseActivation, 
  AuditLog, 
  EmergencyAlert,
  Hotel,
  Experience,
  HospitalityService
} from '../types';

const isElectron = typeof window !== 'undefined' && window.electron;

function generateId(): string {
  return crypto.randomUUID();
}

export async function execute(sql: string, params: unknown[] = []): Promise<unknown> {
  if (isElectron) {
    return window.electron.db.execute(sql, params);
  }
  console.warn('Not in Electron environment');
  return null;
}

export async function get(sql: string, params: unknown[] = []): Promise<unknown> {
  if (isElectron) {
    return window.electron.db.get(sql, params);
  }
  console.warn('Not in Electron environment');
  return null;
}

export const guestDb = {
  async create(guest: Omit<Guest, 'id' | 'created_at' | 'synced_at'>): Promise<Guest> {
    const id = generateId();
    const created_at = new Date().toISOString();

    await execute(
      `INSERT INTO guests (id, property_id, name, phone, email, room_number, check_in_date, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, guest.property_id, guest.name, guest.phone, guest.email, guest.room_number, guest.check_in_date, guest.status, created_at]
    );

    return { ...guest, id, created_at };
  },

  async getAll(property_id: string): Promise<Guest[]> {
    const result = await execute(
      'SELECT * FROM guests WHERE property_id = ? ORDER BY created_at DESC',
      [property_id]
    );
    return (result as Guest[]) || [];
  },

  async getById(id: string): Promise<Guest | null> {
    const result = await get('SELECT * FROM guests WHERE id = ?', [id]);
    return (result as Guest) || null;
  },

  async getByEmail(email: string): Promise<Guest[]> {
    const result = await execute('SELECT * FROM guests WHERE email = ? ORDER BY created_at DESC', [email]);
    return (result as Guest[]) || [];
  },

  async checkout(id: string): Promise<void> {
    const check_out_date = new Date().toISOString();
    await execute(
      'UPDATE guests SET status = ?, check_out_date = ? WHERE id = ?',
      ['checked_out', check_out_date, id]
    );
  },

  async getAllUnsync(): Promise<Guest[]> {
    const result = await execute('SELECT * FROM guests WHERE synced_at IS NULL');
    return (result as Guest[]) || [];
  },

  async markSynced(id: string): Promise<void> {
    const synced_at = new Date().toISOString();
    await execute('UPDATE guests SET synced_at = ? WHERE id = ?', [synced_at, id]);
  },

  async delete(id: string): Promise<void> {
    await execute('DELETE FROM guests WHERE id = ?', [id]);
    await execute('DELETE FROM preferences WHERE guest_id = ?', [id]);
  },
};

export const preferenceDb = {
  async create(preference: Omit<Preference, 'id' | 'created_at'>): Promise<Preference> {
    const id = generateId();
    const created_at = new Date().toISOString();

    await execute(
      `INSERT INTO preferences (id, guest_id, pillow_type, dietary_restrictions, spa_preference, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, preference.guest_id, preference.pillow_type, preference.dietary_restrictions, preference.spa_preference, created_at]
    );

    return { ...preference, id, created_at };
  },

  async getByGuestId(guest_id: string): Promise<Preference | null> {
    const result = await get('SELECT * FROM preferences WHERE guest_id = ?', [guest_id]);
    return (result as Preference) || null;
  },

  async getByGuestEmail(email: string): Promise<Preference | null> {
    const result = await get(
      `SELECT p.* FROM preferences p
       JOIN guests g ON p.guest_id = g.id
       WHERE g.email = ?
       ORDER BY p.created_at DESC
       LIMIT 1`,
      [email]
    );
    return (result as Preference) || null;
  },
};

export const housekeepingDb = {
  async create(task: Omit<HousekeepingTask, 'id' | 'created_at'>): Promise<HousekeepingTask> {
    const id = generateId();
    const created_at = new Date().toISOString();

    await execute(
      `INSERT INTO housekeeping_tasks (id, property_id, room_number, status, assigned_to, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, task.property_id, task.room_number, task.status, task.assigned_to, created_at]
    );

    return { ...task, id, created_at };
  },

  async getAll(property_id: string): Promise<HousekeepingTask[]> {
    const result = await execute(
      'SELECT * FROM housekeeping_tasks WHERE property_id = ? ORDER BY created_at DESC',
      [property_id]
    );
    return (result as HousekeepingTask[]) || [];
  },

  async updateStatus(id: string, status: HousekeepingTask['status']): Promise<void> {
    const completed_at = status === 'clean' ? new Date().toISOString() : null;
    await execute(
      'UPDATE housekeeping_tasks SET status = ?, completed_at = ? WHERE id = ?',
      [status, completed_at, id]
    );
  },
};

export const pricingDb = {
  async create(pricing: Omit<PricingHistory, 'id' | 'created_at'>): Promise<PricingHistory> {
    const id = generateId();
    const created_at = new Date().toISOString();

    await execute(
      `INSERT INTO pricing_history (id, property_id, base_price_usd, exchange_rate, demand_multiplier, final_price_etb, occupancy_rate, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, pricing.property_id, pricing.base_price_usd, pricing.exchange_rate, pricing.demand_multiplier, pricing.final_price_etb, pricing.occupancy_rate, created_at]
    );

    return { ...pricing, id, created_at };
  },

  async getLatest(property_id: string): Promise<PricingHistory | null> {
    const result = await get(
      'SELECT * FROM pricing_history WHERE property_id = ? ORDER BY created_at DESC LIMIT 1',
      [property_id]
    );
    return (result as PricingHistory) || null;
  },
};

export const licenseDb = {
  async create(license: Omit<LicenseActivation, 'id' | 'created_at'>): Promise<LicenseActivation> {
    const id = generateId();
    const created_at = new Date().toISOString();

    await execute(
      `INSERT INTO license_activations (id, property_id, activation_key, expiry_date, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, license.property_id, license.activation_key, license.expiry_date, license.is_active ? 1 : 0, created_at]
    );

    return { ...license, id, created_at };
  },

  async getByPropertyId(property_id: string): Promise<LicenseActivation | null> {
    const result = await get('SELECT * FROM license_activations WHERE property_id = ?', [property_id]);
    return (result as LicenseActivation) || null;
  },
};

export const auditDb = {
  async create(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const id = generateId();
    const created_at = new Date().toISOString();

    await execute(
      `INSERT INTO audit_logs (id, property_id, action, entity_type, entity_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, log.property_id, log.action, log.entity_type, log.entity_id, JSON.stringify(log.details || {}), created_at]
    );

    return { ...log, id, created_at };
  },
};

export const emergencyDb = {
  async create(alert: Omit<EmergencyAlert, 'id'>): Promise<EmergencyAlert> {
    const id = generateId();
    await execute(
      `INSERT INTO emergency_alerts (id, guest_id, type, location, status, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, alert.guest_id, alert.type, alert.location, alert.status, alert.timestamp]
    );
    return { ...alert, id };
  },

  async getAll(): Promise<EmergencyAlert[]> {
    const result = await execute('SELECT * FROM emergency_alerts ORDER BY timestamp DESC');
    return (result as EmergencyAlert[]) || [];
  },

  async acknowledge(id: string): Promise<void> {
    const acknowledged_at = new Date().toISOString();
    await execute(
      'UPDATE emergency_alerts SET status = ?, acknowledged_at = ? WHERE id = ?',
      ['acknowledged', acknowledged_at, id]
    );
  },
};

export const hotelDb = {
  async getAll(): Promise<Hotel[]> {
    const { data, error } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async getByOwner(ownerId: string): Promise<Hotel | null> {
    const { data, error } = await supabase.from('hotels').select('*').eq('owner_id', ownerId).single();
    if (error) return null;
    return data;
  },
  async create(hotel: Partial<Hotel>): Promise<Hotel> {
    const { data, error } = await supabase.from('hotels').insert([hotel]).select().single();
    if (error) {
      console.error('Supabase error in hotelDb.create:', error);
      throw error;
    }
    return data;
  },
  async update(id: string, updates: Partial<Hotel>): Promise<Hotel> {
    const { data, error } = await supabase.from('hotels').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    if (error) throw error;
  },
};

export const experienceDb = {
  async getAll(hotelId?: string): Promise<Experience[]> {
    let query = supabase.from('experiences').select('*').order('created_at', { ascending: false });
    if (hotelId) query = query.eq('hotel_id', hotelId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  async create(experience: Partial<Experience>): Promise<Experience> {
    const { data, error } = await supabase.from('experiences').insert([experience]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<Experience>): Promise<Experience> {
    const { data, error } = await supabase.from('experiences').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) throw error;
  },
};

export const serviceDb = {
  async getAll(hotelId?: string): Promise<HospitalityService[]> {
    let query = supabase.from('services').select('*').order('created_at', { ascending: false });
    if (hotelId) query = query.eq('hotel_id', hotelId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
  async create(service: Partial<HospitalityService>): Promise<HospitalityService> {
    const { data, error } = await supabase.from('services').insert([service]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<HospitalityService>): Promise<HospitalityService> {
    const { data, error } = await supabase.from('services').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },
};

export const dashboardDb = {
  async getStats() {
    const { count: guestCount } = await supabase.from('guests').select('*', { count: 'exact', head: true });
    const { count: hotelCount } = await supabase.from('hotels').select('*', { count: 'exact', head: true });
    const { count: experienceCount } = await supabase.from('experiences').select('*', { count: 'exact', head: true });
    const { count: serviceCount } = await supabase.from('services').select('*', { count: 'exact', head: true });
    const { count: alertCount } = await supabase.from('emergency_alerts').select('*', { count: 'exact', head: true }).eq('status', 'active');

    return {
      guests: guestCount || 0,
      hotels: hotelCount || 0,
      experiences: experienceCount || 0,
      services: serviceCount || 0,
      activeAlerts: alertCount || 0,
    };
  },
};
