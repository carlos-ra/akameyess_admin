import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../services/supabase/types';

interface OrdersState {
  items: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setOrders, setLoading, setError } = ordersSlice.actions;
export default ordersSlice.reducer; 