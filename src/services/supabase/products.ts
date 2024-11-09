import { getSupabaseClient } from '../../config/supabase';
import { Product } from './types';

export const productService = {
  async getAll(): Promise<Product[]> {
    try {
      const supabase = await getSupabaseClient();
      console.log('Fetching products with client:', supabase);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Product> {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const supabase = await getSupabaseClient();
    const productToInsert = {
      title: product.title,
      description: product.description || null,
      price: product.price,
      images: Array.isArray(product.images) 
        ? product.images.reduce((acc, url, index) => ({ ...acc, [index.toString()]: url }), {})
        : product.images,
      category: product.category,
      sub_category: product.sub_category,
      stock: product.stock || 0,
      featured: product.featured || false,
      ali_express_link: product.ali_express_link || null,
      rating: 0,
      reviews: 0
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single();

    if (error) {
      console.error('Create error:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, updates: Partial<Product>): Promise<void> {
    const supabase = await getSupabaseClient();
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 