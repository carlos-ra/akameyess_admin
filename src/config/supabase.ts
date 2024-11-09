import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a basic client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get Supabase client with auth headers
export const getSupabaseClient = async () => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      console.log('No Firebase user found');
      return supabase;
    }

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Create a new client with the Firebase token in headers
    const client = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'X-Firebase-Token': token,
          'X-User-Email': firebaseUser.email || ''
        }
      }
    });

    return client;
  } catch (error) {
    console.error('Error getting authenticated Supabase client:', error);
    return supabase;
  }
};

// Function to get current Firebase token
export const getCurrentToken = async () => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  return firebaseUser.getIdToken();
}; 