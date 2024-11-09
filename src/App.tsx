import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from './config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { setUser } from './store/slices/authSlice';
import { RootState } from './store/store';
import { userService } from './services/supabase/users';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import CartManagement from './components/CartManagement';
import Layout from './components/Layout';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      console.log('Auth state changed:', firebaseUser?.email);
      setLoading(true);

      try {
        if (firebaseUser) {
          // Check if user exists in Supabase
          let supabaseUser = await userService.getUserByEmail(firebaseUser.email!);
          console.log('Supabase user:', supabaseUser);

          // If user doesn't exist in Supabase, create them
          if (!supabaseUser) {
            supabaseUser = await userService.createUser(
              firebaseUser.email!,
              firebaseUser.displayName || undefined,
              firebaseUser.photoURL || undefined
            );
            console.log('Created new user in Supabase:', supabaseUser);
          }

          // Only pass serializable user data to Redux
          const serializableUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          dispatch(setUser(serializableUser));
        } else {
          console.log('No user found, clearing state');
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Error syncing user with Supabase:', error);
        dispatch(setUser(null));
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      console.log('Cleaning up auth listener');
      unsubscribe();
    };
  }, [dispatch]);

  // Don't render anything until we've initialized
  if (!initialized || loading) {
    return <div>Loading...</div>;
  }

  console.log('Current auth state:', user);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="carts" element={<CartManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
