import React from 'react';
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Home,
  ShoppingBag,
  Menu as MenuIcon,
  AutoAwesome,
  ReceiptLong,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useState } from 'react';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Sunfreaks Brand', path: '/', icon: <AutoAwesome sx={{ color: '#FFC24B' }} /> },
    { label: 'Shop Home', path: '/shop', icon: <Home sx={{ color: '#5EEAD4' }} /> },
    { label: 'All Products', path: '/products', icon: <ShoppingBag sx={{ color: '#E65F8E' }} /> },
  ];

  if (isAuthenticated) {
    navItems.push(
      { label: 'My Orders', path: '/orders', icon: <ReceiptLong sx={{ color: '#FFC24B' }} /> },
      { label: 'My Profile', path: '/profile', icon: <Person sx={{ color: '#2F9C95' }} /> }
    );
  }

  const drawer = (
    <Box
      sx={{
        height: '100%',
        backgroundColor: 'rgba(15, 10, 22, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Toolbar
        sx={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          px: 2.5,
        }}
      >
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to="/"
          onClick={() => setMobileOpen(false)}
          sx={{
            fontWeight: 700,
            color: '#FAF4E8',
            fontSize: '1.05rem',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { opacity: 0.9 },
          }}
        >
          <Box component="span" sx={{ color: '#FF5B24' }}>☀</Box> SUNFREAKS
        </Typography>
      </Toolbar>
      <List sx={{ p: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{
                borderRadius: 2.5,
                mb: 0.75,
                py: 1,
                px: 1.5,
                backgroundColor: isActive ? 'rgba(255, 91, 36, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 91, 36, 0.3)' : '1px solid transparent',
                color: isActive ? '#FAF4E8' : '#D6C8B4',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#FAF4E8',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'rgba(15, 10, 22, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '-0.01em',
              color: '#FAF4E8',
              flexGrow: 1,
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              '&:hover': { opacity: 0.9 },
            }}
          >
            <Box component="span" sx={{ color: '#FF5B24' }}>☀</Box> Sunfreaks Boutique
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={() => navigate('/cart')}
              sx={{
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 91, 36, 0.15)',
                border: '1px solid rgba(255, 91, 36, 0.3)',
                color: '#FF5B24',
                padding: '8px',
                transition: 'all 200ms ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 91, 36, 0.25)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Badge badgeContent={itemCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                <ShoppingCart sx={{ fontSize: '1.25rem' }} />
              </Badge>
            </IconButton>

            {isAuthenticated ? (
              <IconButton
                color="inherit"
                onClick={logout}
                title="Logout"
                sx={{
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FAF4E8',
                  padding: '8px',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
                }}
              >
                <AccountCircle sx={{ fontSize: '1.25rem' }} />
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                onClick={() => navigate('/login')}
                title="Login"
                sx={{
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 194, 75, 0.15)',
                  border: '1px solid rgba(255, 194, 75, 0.3)',
                  color: '#FFC24B',
                  padding: '8px',
                  '&:hover': { backgroundColor: 'rgba(255, 194, 75, 0.25)' },
                }}
              >
                <AccountCircle sx={{ fontSize: '1.25rem' }} />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation drawer"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 3.5 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;