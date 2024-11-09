import { supabase } from '../../config/supabase';
import { Order } from './types';

export const orderService = {
  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users (*),
        items:order_items (
          *,
          product:products (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users (*),
        items:order_items (
          *,
          product:products (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}; 