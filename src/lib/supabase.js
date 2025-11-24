import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto'; // Parfois nécessaire sur Expo

// ⚠️ Utilise ici ta clé PUBLIQUE (anon key), PAS la service_role !
const SUPABASE_URL = 'https://ubrcomlckwavojphpixb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicmNvbWxja3dhdm9qcGhwaXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODA3NjIsImV4cCI6MjA3OTU1Njc2Mn0.-s-2pS3Wz1Z1UtDmTIX98taZmN0NiJ01MDvJaqspMPY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});