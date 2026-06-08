import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField,
  Button, InputAdornment, IconButton, Alert, Checkbox,
  FormControlLabel, CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginThunk, clearAuthError } from '../store/slices/authSlice';
import {
  authPageSx, authCardSx, authCardContentSx,
  logoBoxSx, submitButtonSx, spinnerOverlaySx,
} from '../styles/common';

export default function Login() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const loading    = useAppSelector((s) => s.auth.loading);
  const reduxError = useAppSelector((s) => s.auth.error);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [localError, setLocalError] = useState('');

  const error = localError || reduxError || '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearAuthError());

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter your email and password.');
      return;
    }

    const result = await dispatch(loginThunk({ email: email.trim(), password }));
    if (loginThunk.fulfilled.match(result)) {
      navigate('/path');
    }
  };

  return (
    <Box sx={authPageSx}>
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', maxWidth: 420 }}
      >
      <Card sx={{ ...authCardSx(420), maxWidth: '100%' }}>
        <CardContent sx={authCardContentSx}>
          {/* Logo */}
          <Box textAlign="center" mb={3.5}>
            <Box sx={logoBoxSx}>🧠</Box>
            <Typography variant="h6" fontWeight={800} color="primary">SMARTPREP AI</Typography>
            <Typography variant="caption" color="text.secondary">Learn Smarter. Achieve Bigger.</Typography>
          </Box>

          <Typography variant="h5" fontWeight={800} mb={0.5}>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to continue your learning journey
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email" fullWidth margin="normal" required type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              label="Password" fullWidth margin="normal" required
              type={showPw ? 'text' : 'password'}
              value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={<Typography variant="body2">Remember me</Typography>}
              />
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>
                Forgot Password?
              </Typography>
            </Box>

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
              <span style={{ visibility: loading ? 'hidden' : 'visible' }}>Login</span>
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={2.5} color="text.secondary">
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
              Sign up
            </Link>
          </Typography>
        </CardContent>
      </Card>
      </motion.div>
    </Box>
  );
}
