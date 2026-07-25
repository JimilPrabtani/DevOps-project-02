import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  IconButton,
  CardMedia,
  Chip,
  Paper,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as LocalShippingIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  FavoriteBorder as WishlistIcon,
} from '@mui/icons-material';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        const productData = await productService.getById(id);
        setProduct(productData);
      } catch (error) {
        console.error('Error loading product:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem(product);
      }
      setSnackbarOpen(true);
      setQuantity(1);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (product && newQuantity >= 1 && newQuantity <= product.inventory) {
      setQuantity(newQuantity);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <LoadingSkeleton variant="detail" />
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom>
            Product not found
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')} sx={{ borderRadius: '12px' }}>
            Back to Products
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{ color: 'rgba(250, 244, 232, 0.6)', textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/products')}
            sx={{ color: 'rgba(250, 244, 232, 0.6)', textDecoration: 'none' }}
          >
            Products
          </Link>
          <Typography variant="body2" sx={{ color: '#FAF4E8', fontWeight: 500 }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: '20px',
                overflow: 'hidden',
                backgroundColor: 'rgba(28, 21, 40, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  height: { xs: 320, md: 480 },
                  objectFit: 'cover',
                  borderRadius: '16px',
                }}
                image={product.imageUrl || '/images/placeholder.svg'}
                alt={product.name}
              />
            </Paper>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Product Info */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(250, 244, 232, 0.7)',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize',
                    }}
                  />
                  {product.isNew && (
                    <Chip
                      label="NEW"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 194, 75, 0.2)',
                        color: '#FFC24B',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {product.inventory <= 5 && product.inventory > 0 && (
                    <Chip
                      label="Low Stock"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 91, 36, 0.2)',
                        color: '#FF5B24',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>
                
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.2rem' } }}>
                  {product.name}
                </Typography>
                
                {product.rating && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        sx={{
                          fontSize: '1rem',
                          color: index < product.rating! ? '#FFC24B' : 'rgba(255, 194, 75, 0.3)',
                        }}
                      />
                    ))}
                    <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.55)' }}>
                      ({product.reviewCount || 0} reviews)
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2.5 }}>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700, fontSize: '1.8rem' }}>
                    ${(() => {
                      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                      return isNaN(price) || !isFinite(price) ? '0.00' : price.toFixed(2);
                    })()}
                  </Typography>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'rgba(250, 244, 232, 0.4)' }}>
                      ${(() => {
                        const price = typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice;
                        return isNaN(price) || !isFinite(price) ? '0.00' : price.toFixed(2);
                      })()}
                    </Typography>
                  )}
                  {product.discountPercentage && product.discountPercentage > 0 && (
                    <Chip
                      label={`-${product.discountPercentage}%`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(230, 95, 142, 0.2)',
                        color: '#E65F8E',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>
                
                <Typography variant="body2" sx={{ color: 'rgba(214, 200, 180, 0.8)', mb: 3, lineHeight: 1.6 }}>
                  {product.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2.5, mb: 3.5, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <LocalShippingIcon sx={{ fontSize: '1rem', color: '#FFC24B' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.7)' }}>Free shipping over $500</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <RefreshIcon sx={{ fontSize: '1rem', color: '#5EEAD4' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.7)' }}>30-day returns</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <SecurityIcon sx={{ fontSize: '1rem', color: '#2F9C95' }} />
                    <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.7)' }}>Encrypted checkout</Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Purchase Controls */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: '16px',
                  backgroundColor: 'rgba(28, 21, 40, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {product.inventory === 0 ? (
                  <Typography variant="h6" color="error" gutterBottom sx={{ fontSize: '1rem' }}>
                    Out of Stock
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                    <Typography variant="body2" sx={{ mr: 2, color: 'rgba(250, 244, 232, 0.7)' }}>
                      Quantity:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', p: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        sx={{ color: '#FAF4E8' }}
                      >
                        <RemoveIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                      <Typography
                        variant="body2"
                        sx={{
                          mx: 2,
                          minWidth: '2rem',
                          textAlign: 'center',
                          fontWeight: 600,
                        }}
                      >
                        {quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.inventory}
                        sx={{ color: '#FAF4E8' }}
                      >
                        <AddIcon sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" sx={{ ml: 2, color: 'rgba(250, 244, 232, 0.5)' }}>
                      {product.inventory} in stock
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                  <Button
                    variant="contained"
                    size="medium"
                    onClick={handleAddToCart}
                    disabled={product.inventory === 0}
                    startIcon={<ShoppingBagIcon sx={{ fontSize: '1rem' }} />}
                    sx={{
                      flexGrow: 1,
                      py: 1.1,
                      borderRadius: '12px',
                    }}
                  >
                    {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  
                  <IconButton
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      p: 1.1,
                      color: '#FAF4E8',
                    }}
                  >
                    <WishlistIcon sx={{ fontSize: '1.2rem' }} />
                  </IconButton>
                </Box>
                
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => navigate('/cart')}
                  fullWidth
                  sx={{ py: 1, borderRadius: '12px' }}
                >
                  View Cart ({quantity} {quantity === 1 ? 'item' : 'items'})
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Product Details Tabs */}
        <Box sx={{ mt: 5 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: 'rgba(28, 21, 40, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                '& .MuiTab-root': {
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: 'rgba(250, 244, 232, 0.6)',
                  '&.Mui-selected': { color: '#FF5B24' },
                },
                '& .MuiTabs-indicator': { backgroundColor: '#FF5B24' },
              }}
            >
              <Tab label="Description" />
              <Tab label="Details" />
              <Tab label="Reviews" />
              <Tab label="Shipping" />
            </Tabs>
            
            <Box sx={{ px: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="body2" paragraph sx={{ lineHeight: 1.7, color: 'rgba(250, 244, 232, 0.85)' }}>
                  {product.description}
                </Typography>
                <Typography variant="body2" paragraph sx={{ lineHeight: 1.7, color: 'rgba(250, 244, 232, 0.7)' }}>
                  Experience the perfect blend of luxury and functionality. Crafted with attention to detail and using clean materials, this formula exemplifies excellence in biotech R&D.
                </Typography>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.5)' }}>Product ID:</Typography>
                    <Typography variant="body2">{product.id}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.5)' }}>Category:</Typography>
                    <Typography variant="body2">{product.category}</Typography>
                  </Grid>
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.7)' }}>
                  No reviews yet. Be the first to review this product!
                </Typography>
              </TabPanel>
              
              <TabPanel value={tabValue} index={3}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Shipping Information</Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'rgba(250, 244, 232, 0.8)' }}>
                  • Free shipping on orders over $500<br/>
                  • Standard delivery: 3-5 business days<br/>
                  • 30-day return policy
                </Typography>
              </TabPanel>
            </Box>
          </Paper>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ borderRadius: '10px' }}>
          {quantity} {quantity === 1 ? 'item' : 'items'} added to cart
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail;