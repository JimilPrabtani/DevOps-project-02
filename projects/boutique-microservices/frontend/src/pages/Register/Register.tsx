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
  Grid,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false,
    subscribeNewsletter: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const steps = ['Personal Info', 'Account Details', 'Preferences'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters long');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      navigate('/shop');
    } catch (error: any) {
      const data = error?.response?.data;
      const fieldErrors = data?.fields ? Object.values(data.fields).join(' ') : null;
      setError(fieldErrors || data?.error || data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.firstName || !formData.lastName)) {
      setError('Please enter your first and last name');
      return;
    }
    if (activeStep === 1 && (!formData.email || !formData.password || !formData.confirmPassword)) {
      setError('Please fill in all account details');
      return;
    }
    if (activeStep === 1 && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (activeStep === 1 && formData.password.length < 12) {
      setError('Password must be at least 12 characters long');
      return;
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                Personal Information
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)', mb: 1 }}>
                Tell us a bit about yourself
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'rgba(250, 244, 232, 0.4)', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'rgba(250, 244, 232, 0.4)', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                Account Details
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)', mb: 1 }}>
                Create your login credentials
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'rgba(250, 244, 232, 0.4)', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password (min. 12 chars)"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(250, 244, 232, 0.4)', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(250, 244, 232, 0.5)' }}
                      >
                        {showPassword ? <VisibilityOff sx={{ fontSize: '1.1rem' }} /> : <Visibility sx={{ fontSize: '1.1rem' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(250, 244, 232, 0.4)', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: 'rgba(250, 244, 232, 0.5)' }}
                      >
                        {showConfirmPassword ? <VisibilityOff sx={{ fontSize: '1.1rem' }} /> : <Visibility sx={{ fontSize: '1.1rem' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                Preferences
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)', mb: 1 }}>
                Customize your experience
              </Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    name="agreeToTerms"
                    sx={{ color: 'rgba(255, 255, 255, 0.3)', '&.Mui-checked': { color: '#FF5B24' } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'rgba(250, 244, 232, 0.8)' }}>
                    I agree to the{' '}
                    <Link to="/terms" style={{ color: '#FF5B24' }}>
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" style={{ color: '#FF5B24' }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.subscribeNewsletter}
                    onChange={(e) => setFormData({ ...formData, subscribeNewsletter: e.target.checked })}
                    name="subscribeNewsletter"
                    sx={{ color: 'rgba(255, 255, 255, 0.3)', '&.Mui-checked': { color: '#FF5B24' } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'rgba(250, 244, 232, 0.8)' }}>
                    Subscribe to our newsletter for exclusive offers and new releases
                  </Typography>
                }
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '85vh',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            borderRadius: '20px',
            backgroundColor: 'rgba(28, 21, 40, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography
              component="h1"
              variant="h3"
              gutterBottom
              sx={{ fontWeight: 700, fontSize: '1.75rem' }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)' }}>
              Join our community for clean biotech protection
            </Typography>
          </Box>

          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 3.5,
              '& .MuiStepLabel-label': { fontSize: '0.78rem', color: 'rgba(250, 244, 232, 0.5)' },
              '& .MuiStepLabel-label.Mui-active': { color: '#FF5B24', fontWeight: 600 },
              '& .MuiStepIcon-root': { color: 'rgba(255, 255, 255, 0.12)' },
              '& .MuiStepIcon-root.Mui-active': { color: '#FF5B24' },
              '& .MuiStepIcon-root.Mui-completed': { color: '#5EEAD4' },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {renderStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3.5 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{
                  visibility: activeStep === 0 ? 'hidden' : 'visible',
                  borderRadius: '10px',
                }}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formData.agreeToTerms}
                  sx={{
                    px: 3.5,
                    py: 1,
                    borderRadius: '12px',
                  }}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    px: 3.5,
                    py: 1,
                    borderRadius: '12px',
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 3.5 }}>
            <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#FF5B24', textDecoration: 'none', fontWeight: 500 }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;