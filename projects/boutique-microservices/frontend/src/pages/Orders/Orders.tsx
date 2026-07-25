import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Paper,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
  Pending as PendingIcon,
  Reorder as ReorderIcon,
  Star as StarIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const userOrders = await orderService.getUserOrders();
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadOrders();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <DeliveredIcon sx={{ fontSize: '0.9rem', color: '#5EEAD4' }} />;
      case 'shipped':
        return <ShippingIcon sx={{ fontSize: '0.9rem', color: '#A78BFA' }} />;
      case 'cancelled':
        return <CancelledIcon sx={{ fontSize: '0.9rem', color: '#E65F8E' }} />;
      default:
        return <PendingIcon sx={{ fontSize: '0.9rem', color: '#FFC24B' }} />;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Please log in to view your orders
          </Typography>
          <Button variant="contained" href="/login" sx={{ borderRadius: '12px' }}>
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <LoadingSkeleton variant="list" count={5} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link component="button" variant="body2" onClick={() => navigate('/')} sx={{ color: 'rgba(250, 244, 232, 0.6)', textDecoration: 'none' }}>
            Home
          </Link>
          <Link component="button" variant="body2" onClick={() => navigate('/profile')} sx={{ color: 'rgba(250, 244, 232, 0.6)', textDecoration: 'none' }}>
            Profile
          </Link>
          <Typography variant="body2" sx={{ color: '#FAF4E8', fontWeight: 500 }}>
            Orders
          </Typography>
        </Breadcrumbs>

        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 0.5 }}>
          My Orders
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)', mb: 3 }}>
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </Typography>

        {orders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '20px',
              backgroundColor: 'rgba(28, 21, 40, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <ShoppingBagIcon sx={{ fontSize: 32, color: 'rgba(250, 244, 232, 0.5)' }} />
            </Avatar>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              You haven't placed any orders yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)', mb: 3 }}>
              Start shopping to see your order history here
            </Typography>
            <Button
              variant="contained"
              size="medium"
              href="/products"
              sx={{ px: 3.5, borderRadius: '12px' }}
            >
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {orders.map((order) => (
              <Grid size={{ xs: 12 }} key={order.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: 'rgba(28, 21, 40, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Order Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.98rem' }}>
                          Order #{order.id.slice(-8)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.5)' }}>
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#FAF4E8',
                            fontSize: '0.75rem',
                          }}
                        />
                        <IconButton size="small" sx={{ color: 'rgba(250, 244, 232, 0.6)' }}>
                          <ViewIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Order Items Accordion */}
                    <Accordion
                      sx={{
                        mb: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        boxShadow: 'none',
                        borderRadius: '12px !important',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        '&:before': { display: 'none' },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(250, 244, 232, 0.5)' }} />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mr: 1, alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FF5B24' }}>
                            ${typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount).toFixed(2) : order.totalAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 2, pb: 2 }}>
                        <List disablePadding>
                          {order.items.map((item, index) => (
                            <Box key={item.id}>
                              <ListItem sx={{ px: 0, py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 50 }}>
                                  <CardMedia
                                    component="img"
                                    sx={{
                                      width: 42,
                                      height: 42,
                                      borderRadius: '8px',
                                      objectFit: 'cover',
                                    }}
                                    image={item.product.imageUrl || '/images/placeholder.svg'}
                                    alt={item.product.name}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.product.name}
                                  secondary={`Qty: ${item.quantity} × $${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price.toFixed(2)}`}
                                  primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500, color: '#FAF4E8' }}
                                  secondaryTypographyProps={{ fontSize: '0.78rem', color: 'rgba(250, 244, 232, 0.5)' }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
                                  ${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}
                                </Typography>
                              </ListItem>
                              {index < order.items.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />}
                            </Box>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>

                    {/* Order Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon sx={{ fontSize: '0.85rem' }} />}
                          variant="outlined"
                          sx={{ borderRadius: '8px', fontSize: '0.78rem', py: 0.4 }}
                        >
                          Invoice
                        </Button>
                        {order.status === 'delivered' && (
                          <Button
                            size="small"
                            startIcon={<StarIcon sx={{ fontSize: '0.85rem' }} />}
                            variant="outlined"
                            sx={{ borderRadius: '8px', fontSize: '0.78rem', py: 0.4 }}
                          >
                            Review
                          </Button>
                        )}
                        {order.status === 'delivered' && (
                          <Button
                            size="small"
                            startIcon={<ReorderIcon sx={{ fontSize: '0.85rem' }} />}
                            variant="contained"
                            sx={{ borderRadius: '8px', fontSize: '0.78rem', py: 0.4 }}
                          >
                            Reorder
                          </Button>
                        )}
                      </Box>
                      
                      <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.5)' }}>
                        Est. Delivery: {new Date(
                          new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Orders;