import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Paper,
  Fade,
  Slide,
  Chip,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ShoppingBag as ShoppingBagIcon,
  Star as StarIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import ProductCard from '../../components/common/ProductCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const CATEGORIES = ['All', 'Clothing', 'Accessories', 'Bags', 'Jewelry', 'Shoes'];

const Home: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      console.log('[Home] Loading products...');
      try {
        const fetched = await productService.getAll();
        console.log('[Home] Got products:', fetched.length);
        setAllProducts(fetched);
        setDisplayedProducts(fetched.slice(0, 8));
      } catch (error) {
        console.error('[Home] Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      setDisplayedProducts(allProducts.slice(0, 8));
    } else {
      const filtered = allProducts.filter(
        p => p.category.toLowerCase() === cat.toLowerCase()
      );
      setDisplayedProducts(filtered.slice(0, 8));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
          <LoadingSkeleton count={8} />
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'radial-gradient(circle at 60% 30%, rgba(255, 91, 36, 0.15) 0%, rgba(18, 13, 26, 0.95) 70%)',
          color: '#FAF4E8',
          py: { xs: 5, md: 8 },
          borderRadius: '24px',
          mb: 5,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Fade in timeout={800}>
                <Box>
                  <Box
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: '#FFC24B',
                      backgroundColor: 'rgba(255, 194, 75, 0.1)',
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: '999px',
                      border: '1px solid rgba(255, 194, 75, 0.25)',
                      mb: 2.5,
                      letterSpacing: '0.03em',
                    }}
                  >
                    • BIOTECH & LUXURY BOUTIQUE
                  </Box>
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 2.5,
                      fontSize: { xs: '2.2rem', md: '3.2rem' },
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                    }}
                  >
                    Discover Modern
                    <Box component="span" sx={{ color: '#FF5B24', display: 'block' }}>
                      Elegance & Science
                    </Box>
                  </Typography>
                  <Typography
                    variant="body1"
                    component="p"
                    sx={{
                      mb: 4,
                      lineHeight: 1.6,
                      color: 'rgba(214, 200, 180, 0.8)',
                      maxWidth: '44ch',
                    }}
                  >
                    Indulge in our curated collection of luxury products, 
                    where clean formulation meets exceptional quality.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ShoppingBagIcon sx={{ fontSize: '1.1rem' }} />}
                      href="#products-showcase"
                      sx={{
                        px: 3.5,
                        py: 1.25,
                        borderRadius: '12px',
                      }}
                    >
                      Browse Products
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: '1.1rem' }} />}
                      href="/products"
                      sx={{
                        px: 3.5,
                        py: 1.25,
                        borderRadius: '12px',
                      }}
                    >
                      All Collections
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Slide in timeout={1000} direction="right">
                <Box
                  sx={{
                    height: { xs: 240, md: 320 },
                    background: 'linear-gradient(135deg, rgba(255, 91, 36, 0.25) 0%, rgba(255, 194, 75, 0.15) 50%, rgba(230, 95, 142, 0.2) 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 4,
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 700,
                      color: '#FAF4E8',
                      textAlign: 'center',
                      fontSize: { xs: '1.8rem', md: '2.4rem' },
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    CLEAN & PROTECTED
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1.5,
                      color: 'rgba(250, 244, 232, 0.7)',
                      textAlign: 'center',
                      maxWidth: '30ch',
                    }}
                  >
                    Melanin-rich first, invisible protection with zero white cast.
                  </Typography>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Prominent Featured Products Showcase Section (Right below Hero) */}
      <Box sx={{ py: 3, mb: 6 }} id="products-showcase">
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', mb: 3.5, gap: 2 }}>
            <Box>
              <Typography
                variant="h2"
                component="h2"
                sx={{ fontWeight: 700, color: '#FAF4E8', fontSize: '1.75rem', mb: 0.5 }}
              >
                Featured <Box component="span" sx={{ color: '#FF5B24' }}>Products</Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.88rem', color: 'rgba(250, 244, 232, 0.6)' }}>
                Handpicked boutique items available right now
              </Typography>
            </Box>

            {/* Interactive Category Filter Pills */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Chip
                    key={cat}
                    label={cat}
                    clickable
                    onClick={() => handleCategorySelect(cat)}
                    sx={{
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 600 : 400,
                      px: 1,
                      backgroundColor: isSelected ? 'rgba(255, 91, 36, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#FF5B24' : 'rgba(250, 244, 232, 0.7)',
                      border: isSelected ? '1px solid rgba(255, 91, 36, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 200ms ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 91, 36, 0.18)',
                        color: '#FAF4E8',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            {displayedProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id}>
                <ProductCard
                  product={product}
                  onAddToCart={addItem}
                />
              </Grid>
            ))}
          </Grid>

          {displayedProducts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" sx={{ color: 'rgba(250, 244, 232, 0.6)' }}>
                No products found in this category.
              </Typography>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              size="medium"
              href="/products"
              endIcon={<ArrowForwardIcon sx={{ fontSize: '1rem' }} />}
              sx={{
                px: 3.5,
                py: 1,
                borderRadius: '12px',
              }}
            >
              View Full Catalog ({allProducts.length} items)
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(28, 21, 40, 0.6)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  transition: 'transform 200ms ease, border-color 200ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'rgba(255, 91, 36, 0.3)',
                  },
                }}
              >
                <ShippingIcon sx={{ fontSize: 36, color: '#FFC24B', mb: 1.5 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '0.98rem' }}>
                  Free Shipping
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  On orders over $500
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(28, 21, 40, 0.6)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  transition: 'transform 200ms ease, border-color 200ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'rgba(255, 91, 36, 0.3)',
                  },
                }}
              >
                <SecurityIcon sx={{ fontSize: 36, color: '#2F9C95', mb: 1.5 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '0.98rem' }}>
                  Secure Payment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  100% encrypted checkout
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(28, 21, 40, 0.6)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  transition: 'transform 200ms ease, border-color 200ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'rgba(255, 91, 36, 0.3)',
                  },
                }}
              >
                <StarIcon sx={{ fontSize: 36, color: '#E65F8E', mb: 1.5 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '0.98rem' }}>
                  Premium Quality
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  Biotech active formulas
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: 'rgba(28, 21, 40, 0.6)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  transition: 'transform 200ms ease, border-color 200ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'rgba(255, 91, 36, 0.3)',
                  },
                }}
              >
                <RefreshIcon sx={{ fontSize: 36, color: '#5EEAD4', mb: 1.5 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '0.98rem' }}>
                  Easy Returns
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  30-day return policy
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default Home;