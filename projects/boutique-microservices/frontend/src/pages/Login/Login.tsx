import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Handled by context
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: '20px',
            backgroundColor: 'rgba(28, 21, 40, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="h1" variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem', mb: 0.5 }}>
              Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)' }}>
              Welcome back to Sunfreaks
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2.5, py: 1.2, borderRadius: '12px' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ color: '#FF5B24', fontWeight: 500 }}>
                  Don't have an account? Sign Up
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;