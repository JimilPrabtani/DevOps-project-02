import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  ShoppingBag as OrdersIcon,
  Favorite as WishlistIcon,
  CreditCard as PaymentIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Please log in to view your profile
          </Typography>
          <Button variant="contained" href="/login" sx={{ borderRadius: '12px' }}>
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  const menuItems = [
    { icon: <OrdersIcon sx={{ color: '#FFC24B' }} />, label: 'Order History', path: '/orders' },
    { icon: <WishlistIcon sx={{ color: '#E65F8E' }} />, label: 'Wishlist', path: '/wishlist' },
    { icon: <PaymentIcon sx={{ color: '#5EEAD4' }} />, label: 'Payment Methods', path: '/payment' },
    { icon: <SettingsIcon sx={{ color: '#A78BFA' }} />, label: 'Account Settings', path: '/settings' },
  ];

  const stats = [
    { label: 'Total Orders', value: '12' },
    { label: 'Wishlist Items', value: '8' },
    { label: 'Member Since', value: new Date(user.createdAt || Date.now()).toLocaleDateString() },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          My Profile
        </Typography>
        
        <Grid container spacing={3.5}>
          {/* Profile Header */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: '20px',
                backgroundColor: 'rgba(28, 21, 40, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  mx: 'auto',
                  mb: 2,
                  backgroundColor: 'rgba(255, 91, 36, 0.2)',
                  color: '#FF5B24',
                  fontSize: '2.2rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 91, 36, 0.3)',
                }}
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  mb: 1.5,
                  textTransform: 'capitalize',
                  backgroundColor: 'rgba(255, 194, 75, 0.15)',
                  color: '#FFC24B',
                  fontSize: '0.75rem',
                }}
              />
              <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)', mb: 2.5 }}>
                {user.email}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon sx={{ fontSize: '0.9rem' }} />}
                fullWidth
                sx={{ mb: 1.5, borderRadius: '12px' }}
              >
                Edit Profile
              </Button>
              <Button
                variant="text"
                color="error"
                startIcon={<LogoutIcon sx={{ fontSize: '0.9rem' }} />}
                onClick={logout}
                fullWidth
                sx={{ borderRadius: '12px', fontSize: '0.85rem' }}
              >
                Logout
              </Button>
            </Paper>
          </Grid>
          
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              {/* Stats Cards */}
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2}>
                  {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={index}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: '16px',
                          backgroundColor: 'rgba(28, 21, 40, 0.6)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                          <Typography variant="h3" color="primary" gutterBottom sx={{ fontWeight: 700, fontSize: '1.75rem' }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.6)' }}>
                            {stat.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              
              {/* Personal Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(28, 21, 40, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                    Personal Information
                  </Typography>
                  <List dense disablePadding>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PersonIcon sx={{ fontSize: '1.1rem', color: 'rgba(250, 244, 232, 0.5)' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Full Name"
                        secondary={`${user.firstName} ${user.lastName}`}
                        primaryTypographyProps={{ fontSize: '0.75rem', color: 'rgba(250, 244, 232, 0.5)' }}
                        secondaryTypographyProps={{ fontSize: '0.88rem', color: '#FAF4E8', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <EmailIcon sx={{ fontSize: '1.1rem', color: 'rgba(250, 244, 232, 0.5)' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Address"
                        secondary={user.email}
                        primaryTypographyProps={{ fontSize: '0.75rem', color: 'rgba(250, 244, 232, 0.5)' }}
                        secondaryTypographyProps={{ fontSize: '0.88rem', color: '#FAF4E8', fontWeight: 500 }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <PhoneIcon sx={{ fontSize: '1.1rem', color: 'rgba(250, 244, 232, 0.5)' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone Number"
                        secondary="Not provided"
                        primaryTypographyProps={{ fontSize: '0.75rem', color: 'rgba(250, 244, 232, 0.5)' }}
                        secondaryTypographyProps={{ fontSize: '0.88rem', color: 'rgba(250, 244, 232, 0.7)' }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <LocationIcon sx={{ fontSize: '1.1rem', color: 'rgba(250, 244, 232, 0.5)' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Address"
                        secondary="Not provided"
                        primaryTypographyProps={{ fontSize: '0.75rem', color: 'rgba(250, 244, 232, 0.5)' }}
                        secondaryTypographyProps={{ fontSize: '0.88rem', color: 'rgba(250, 244, 232, 0.7)' }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              {/* Quick Actions */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(28, 21, 40, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                    Quick Actions
                  </Typography>
                  <List disablePadding>
                    {menuItems.map((item, index) => (
                      <ListItem
                        key={index}
                        component="a"
                        href={item.path}
                        sx={{
                          borderRadius: '10px',
                          mb: 0.75,
                          py: 0.75,
                          px: 1.5,
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          textDecoration: 'none',
                          color: '#FAF4E8',
                          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;