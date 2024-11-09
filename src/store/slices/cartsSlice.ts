import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartGroupedByUser } from '../../services/supabase/types';

interface CartsState {
  carts: CartGroupedByUser[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CartsState = {
  carts: [],
  isLoading: false,
  error: null,
};

const cartsSlice = createSlice({
  name: 'carts',
  initialState,
  reducers: {
    setCarts: (state, action: PayloadAction<CartGroupedByUser[]>) => {
      state.carts = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCarts, setLoading, setError } = cartsSlice.actions;
export default cartsSlice.reducer; 