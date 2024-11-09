import { supabase } from '../../config/supabase';
import { User } from './types';

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (error) throw error;
    return data;
  },

  async createUser(email: string, display_name?: string, photo_url?: string): Promise<User> {
    const uuid = crypto.randomUUID();

    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        id: uuid,
        email, 
        display_name, 
        photo_url,
        role: 'user'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
}; 