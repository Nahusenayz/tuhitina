/*
  # TIHTINA-AI Hospitality OS Database Schema

  1. New Tables
    - `guests`
      - `id` (uuid, primary key)
      - `property_id` (text) - for multi-property support
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `room_number` (text)
      - `check_in_date` (timestamptz)
      - `check_out_date` (timestamptz, nullable)
      - `status` (text) - checked_in, checked_out
      - `created_at` (timestamptz)
      - `synced_at` (timestamptz, nullable)
    
    - `preferences`
      - `id` (uuid, primary key)
      - `guest_id` (uuid, foreign key)
      - `pillow_type` (text) - soft, firm
      - `dietary_restrictions` (text)
      - `spa_preference` (text)
      - `created_at` (timestamptz)
    
    - `housekeeping_tasks`
      - `id` (uuid, primary key)
      - `property_id` (text)
      - `room_number` (text)
      - `status` (text) - dirty, cleaning, clean
      - `assigned_to` (text, nullable)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
    
    - `pricing_history`
      - `id` (uuid, primary key)
      - `property_id` (text)
      - `base_price_usd` (numeric)
      - `exchange_rate` (numeric)
      - `demand_multiplier` (numeric)
      - `final_price_etb` (numeric)
      - `occupancy_rate` (numeric)
      - `created_at` (timestamptz)
    
    - `license_activations`
      - `id` (uuid, primary key)
      - `property_id` (text)
      - `activation_key` (text)
      - `expiry_date` (timestamptz)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `audit_logs`
      - `id` (uuid, primary key)
      - `property_id` (text)
      - `action` (text)
      - `entity_type` (text)
      - `entity_id` (text)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  room_number text NOT NULL,
  check_in_date timestamptz NOT NULL DEFAULT now(),
  check_out_date timestamptz,
  status text NOT NULL DEFAULT 'checked_in',
  created_at timestamptz DEFAULT now(),
  synced_at timestamptz
);

CREATE TABLE IF NOT EXISTS preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  pillow_type text,
  dietary_restrictions text,
  spa_preference text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  room_number text NOT NULL,
  status text NOT NULL DEFAULT 'dirty',
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS pricing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  base_price_usd numeric NOT NULL,
  exchange_rate numeric NOT NULL,
  demand_multiplier numeric NOT NULL DEFAULT 1.0,
  final_price_etb numeric NOT NULL,
  occupancy_rate numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS license_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL UNIQUE,
  activation_key text NOT NULL,
  expiry_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON guests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON preferences FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON housekeeping_tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON pricing_history FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON license_activations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON audit_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_guests_property_id ON guests(property_id);
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
CREATE INDEX IF NOT EXISTS idx_housekeeping_property_id ON housekeeping_tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_status ON housekeeping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_audit_property_id ON audit_logs(property_id);