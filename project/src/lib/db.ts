import type { Guest, Preference, HousekeepingTask, PricingHistory, LicenseActivation, AuditLog, EmergencyAlert } from '../types';

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
