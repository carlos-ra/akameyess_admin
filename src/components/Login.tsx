import { useState } from 'react';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Box, TextField, Button, Typography, Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/authSlice';
import { userService } from '../services/supabase/users';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting login with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user);

      // Create or get user in Supabase
      try {
        let supabaseUser = await userService.getUserByEmail(email);
        
        if (!supabaseUser) {
          console.log('Creating new user in Supabase');
          supabaseUser = await userService.createUser(
            email,
            userCredential.user.displayName || undefined,
            userCredential.user.photoURL || undefined
          );
          console.log('Created Supabase user:', supabaseUser);
        } else {
          console.log('Found existing Supabase user:', supabaseUser);
        }
      } catch (supabaseError) {
        console.error('Error with Supabase:', supabaseError);
      }

      // Dispatch user data to Redux
      const serializableUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };
      dispatch(setUser(serializableUser));

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error('Login error:', error);
      const authError = error as AuthError;
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Admin Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 