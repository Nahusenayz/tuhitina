import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function syncToCloud(data: {
  guests?: unknown[];
  preferences?: unknown[];
  housekeepingTasks?: unknown[];
  pricingHistory?: unknown[];
}) {
  const results = {
    guests: 0,
    preferences: 0,
    housekeepingTasks: 0,
    pricingHistory: 0,
    errors: [] as string[],
  };

  if (data.guests && data.guests.length > 0) {
    const { error } = await supabase.from('guests').upsert(data.guests);
    if (error) {
      results.errors.push(`Guests: ${error.message}`);
    } else {
      results.guests = data.guests.length;
    }
  }

  if (data.preferences && data.preferences.length > 0) {
    const { error } = await supabase.from('preferences').upsert(data.preferences);
    if (error) {
      results.errors.push(`Preferences: ${error.message}`);
    } else {
      results.preferences = data.preferences.length;
    }
  }

  if (data.housekeepingTasks && data.housekeepingTasks.length > 0) {
    const { error } = await supabase.from('housekeeping_tasks').upsert(data.housekeepingTasks);
    if (error) {
      results.errors.push(`Housekeeping: ${error.message}`);
    } else {
      results.housekeepingTasks = data.housekeepingTasks.length;
    }
  }

  if (data.pricingHistory && data.pricingHistory.length > 0) {
    const { error } = await supabase.from('pricing_history').insert(data.pricingHistory);
    if (error) {
      results.errors.push(`Pricing: ${error.message}`);
    } else {
      results.pricingHistory = data.pricingHistory.length;
    }
  }

  return results;
}
