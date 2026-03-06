import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://bzqwwrwuhiquntoevyha.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cXd3cnd1aGlxdW50b2V2eWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzEyOTMsImV4cCI6MjA4ODIwNzI5M30.p7ntwFnI0dTXkKPVyVYGFmKdSPL6usSN-2jdpJx8sRQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
