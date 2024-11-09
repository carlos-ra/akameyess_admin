import { supabase } from '../../config/supabase';
import { CartItem, CartGroupedByUser } from './types';

export const cartService = {
  async getAllCarts(): Promise<CartGroupedByUser[]> {
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (*),
        user:users (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group cart items by user
    const groupedCarts = (cartItems || []).reduce<Record<string, CartGroupedByUser>>((acc, item) => {
      if (!item.user_id || !item.user) return acc;

      if (!acc[item.user_id]) {
        acc[item.user_id] = {
          user: item.user,
          items: []
        };
      }

      acc[item.user_id].items.push(item);
      return acc;
    }, {});

    return Object.values(groupedCarts);
  },

  async getCartItemsByUserId(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async addItem(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const { data: existing, error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{ user_id: userId, product_id: productId, quantity }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async removeItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 