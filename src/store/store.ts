import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import cartsReducer from './slices/cartsSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    carts: cartsReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 