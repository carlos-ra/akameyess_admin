import { getSupabaseClient } from '../../config/supabase';
import { Order } from './types';

export const orderService = {
  async getAllOrders(): Promise<Order[]> {
    const supabase = await getSupabaseClient();
    
    // Get all orders with user emails
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }

    if (!orders) {
      return [];
    }

    // Get user emails
    const ordersWithEmails = await Promise.all(orders.map(async (order) => {
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', order.user_id)
        .single();

      return {
        ...order,
        email: userData?.email
      };
    }));

    return ordersWithEmails;
  },

  async getCartItemsByOrderId(orderId: string) {
    const supabase = await getSupabaseClient();
    
    console.log('Starting to fetch cart items for order:', orderId);

    // Direct query to cart_items with the specific order_id
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        id,
        user_id,
        order_id,
        product_id,
        quantity,
        price_at_time,
        created_at,
        updated_at,
        product:products (
          id,
          title,
          description,
          price,
          images
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('Error fetching cart items:', itemsError);
      throw itemsError;
    }

    // Log the raw response for debugging
    console.log('Raw cart items:', items);

    // Transform the data to match the expected type
    const transformedItems = items?.map(item => ({
      ...item,
      product: item.product || {
        id: '',
        title: 'Unknown Product',
        description: '',
        price: 0,
        images: {}
      }
    })) || [];

    console.log('Transformed items:', transformedItems);
    return transformedItems;
  },

  async updateOrderStatus(id: string, status: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
}; 