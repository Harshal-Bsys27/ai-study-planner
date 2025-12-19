import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';

const COLORS = {
  primary: '#0F766E',
  secondary: '#06B6D4',
  bg: '#F8FAFC',
};

function Auth({ onLoginSuccess }) {
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess();
    } catch (err) {
      setError('Network error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess();
    } catch (err) {
      setError('Network error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center', color: COLORS.primary }}>
              📚 AI Study Planner
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mb: 3, color: '#64748B' }}>
              Personalized Study Plans
            </Typography>

            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
              <Tab label="Login" sx={{ flex: 1, textTransform: 'capitalize' }} />
              <Tab label="Register" sx={{ flex: 1, textTransform: 'capitalize' }} />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {tab === 0 ? (
              // LOGIN
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    fontWeight: 600,
                    py: 1.5,
                  }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            ) : (
              // REGISTER
              <form onSubmit={handleRegister}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 3 }}
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    fontWeight: 600,
                    py: 1.5,
                  }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Register'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Auth;
