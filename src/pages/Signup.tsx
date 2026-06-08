import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, InputAdornment, IconButton, Alert, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerThunk, clearAuthError } from '../store/slices/authSlice';
import {
  authPageSx, authCardSx, authCardContentSx,
  logoBoxSx, submitButtonSx, spinnerOverlaySx,
} from '../styles/common';

export default function Signup() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const loading    = useAppSelector((s) => s.auth.loading);
  const reduxError = useAppSelector((s) => s.auth.error);

  const [form, setForm]         = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]     = useState(false);
  const [localError, setLocalError] = useState('');

  const error = localError || reduxError || '';

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearAuthError());

    const { username, email, password, confirm } = form;
    if (!username.trim() || !email.trim() || !password || !confirm) {
      setLocalError('All fields are required.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email.'); return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.'); return;
    }
    if (password !== confirm) {
      setLocalError('Passwords do not match.'); return;
    }

    const result = await dispatch(registerThunk({ username: username.trim(), email: email.trim(), password }));
    if (registerThunk.fulfilled.match(result)) {
      navigate('/path');
    }
  };

  return (
    <Box sx={authPageSx}>
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', maxWidth: 440 }}
      >
      <Card sx={{ ...authCardSx(440), maxWidth: '100%' }}>
        <CardContent sx={authCardContentSx}>
          <Box textAlign="center" mb={3}>
            <Box sx={logoBoxSx}>🧠</Box>
            <Typography variant="h6" fontWeight={800} color="primary">SMARTPREP AI</Typography>
          </Box>

          <Typography variant="h5" fontWeight={800} mb={0.5}>Create Your Account</Typography>
          <Typography variant="body2" color="text.secondary" mb={2.5}>
            Start your personalized learning journey
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField label="Username"  fullWidth margin="dense" required value={form.username} onChange={update('username')} />
            <TextField label="Email"     fullWidth margin="dense" required type="email" value={form.email} onChange={update('email')} />
            <TextField
              label="Password" fullWidth margin="dense" required
              type={showPw ? 'text' : 'password'}
              value={form.password} onChange={update('password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                      {showPw ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password" fullWidth margin="dense" required
              type={showPw ? 'text' : 'password'}
              value={form.confirm} onChange={update('confirm')}
            />

            <Button
              type="submit" variant="contained" fullWidth
              sx={submitButtonSx}
              disabled={loading}
            >
              {loading && (
                <Box sx={spinnerOverlaySx}>
                  <CircularProgress size={20} color="inherit" />
                </Box>
              )}
              <span style={{ visibility: loading ? 'hidden' : 'visible' }}>Sign Up</span>
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={2} color="text.secondary">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
              Login
            </Link>
          </Typography>
        </CardContent>
      </Card>
      </motion.div>
    </Box>
  );
}
