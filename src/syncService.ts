
import { supabase } from './lib/supabaseClient';

// Safe JSON parser helper 
const safeParse = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
};

// List of all keys we sync between localStorage and Supabase
const SYNC_KEYS = [
  'students',
  'staff',
  'system_settings',
  'website_settings',
  'website_fatawa',
  'website_gallery',
  'website_gallery_categories',
  'website_home_sections',
  'books',
  'grades',
  'results',
  'saved_salaries',
  'saved_fees',
  'role_permissions',
  'users',
  'recycle_bin',
  'books_list',
  'book_assignments',
  'grades_list',
  'addresses',
  'districts',
  'madrasas',
  'exams',
  'hours',
  'expulsions',
  'gradeSettings',
  'minPositionPercentage',
  'positions',
  'online_links',
  'online_applications',
  'licensed_madrasas',
  'examRecords',
  'all_exam_results',
  'jamia_papers',
  'jamia_posts',
  'fin_transactions',
  'fin_heads',
  'fin_accounts',
  'library_books',
  'studentList',
  'teacherAttendance',
  'attendanceRecords',
  'zk_attendance_data'
];

/**
 * Update a specific key in the central Supabase dataset.
 */
export async function updateCentralKey(key: string, value: any): Promise<boolean> {
  // Update local storage first
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  window.dispatchEvent(new Event('storage_updated'));

  if (!supabase) {
    console.log('Supabase not initialized. Saved to local storage only.');
    return true; // Return true as local save succeeded
  }

  try {
    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';
    
    // Check if entry exists for upsert
    const { error } = await supabase
      .from('madrassa_data')
      .upsert({ tenant_id: tenantId, key: key, value: value, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id,key' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Could not update centralized key "${key}" in Supabase:`, err);
    return true; // Still return true as local storage was updated
  }
}

/**
 * Pull all data for the current tenant from Supabase.
 */
export async function pullGlobalData(): Promise<void> {
  if (!supabase) return;

  try {
    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';
    const { data, error } = await supabase
      .from('madrassa_data')
      .select('key, value')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    if (data) {
      isLocalUpdateFromSupabase = true;
      data.forEach((row: any) => {
        if (SYNC_KEYS.includes(row.key)) {
          localStorage.setItem(row.key, JSON.stringify(row.value));
        }
      });
      isLocalUpdateFromSupabase = false;
      window.dispatchEvent(new Event('storage_updated'));
      console.log('Successfully pulled global data from Supabase.');
    }
  } catch (err) {
    console.error('Failed to pull global data from Supabase:', err);
  }
}

/**
 * Dummy syncToServer for backward compatibility.
 * Sync is now handled by monkey-patching localStorage.setItem.
 */
export async function syncToServer(): Promise<boolean> {
  return true;
}

// Monkey-patch localStorage.setItem globally to automatically sync all changes to Supabase
const originalSetItem = localStorage.setItem;
let isLocalUpdateFromSupabase = false;

localStorage.setItem = function(key: string, value: string): void {
  // Always write locally first to keep the page snappy
  originalSetItem.call(localStorage, key, value);

  // If this update comes from our real-time snapshot pull, skip pushing it back!
  if (isLocalUpdateFromSupabase) {
    return;
  }

  // If the key is in our sync keys list, send it to Supabase in the background
  if (SYNC_KEYS.includes(key) && supabase) {
    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch (_) {
      // Keep as string if it is not valid JSON
    }

    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';

    supabase
      .from('madrassa_data')
      .upsert({ tenant_id: tenantId, key: key, value: parsedValue, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id,key' })
      .then(({ error }) => {
        if (error) {
           console.warn(`[Real-time Monkeypatch] Could not sync key "${key}" to Supabase:`, error);
        } else {
           console.log(`[Real-time Monkeypatch] Synced key "${key}" to Supabase.`);
        }
    });

    // Notify other parts of the UI on this page
    window.dispatchEvent(new Event('storage_updated'));
  }
};

let realtimeChannel: any = null;

export function startRealTimeSync() {
  if (realtimeChannel || !supabase) return;
  console.log('Starting Real-time Supabase Sync...');

  const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';

  realtimeChannel = supabase
    .channel('madrassa_data_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'madrassa_data', 
      filter: `tenant_id=eq.${tenantId}` 
    }, (payload: any) => {
        console.log('Change detected:', payload);
        if (!payload.new) return;
        const { key, value } = payload.new;
        if (key && SYNC_KEYS.includes(key)) {
            isLocalUpdateFromSupabase = true;
            originalSetItem.call(localStorage, key, JSON.stringify(value));
            isLocalUpdateFromSupabase = false;
            window.dispatchEvent(new Event('storage_updated'));
        }
    })
    .subscribe();
}

export function stopRealTimeSync() {
  if (realtimeChannel && supabase) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
    console.log('Stopped Real-time Supabase Sync.');
  }
}
