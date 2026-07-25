import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShoppingCart as AddToCartIcon,
  Favorite as WishlistIcon,
  FavoriteBorder as WishlistBorderIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
  variant?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
  showQuickView = true,
  onQuickView,
  variant = 'grid',
}) => {
  const navigate = useNavigate();
  const isOutOfStock = (product.inventory_quantity ?? product.inventory ?? 0) === 0;

  const getImageSrc = (): string => {
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return '/images/placeholder.svg';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.src = '/images/placeholder.svg';
    target.onerror = () => {
      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NSA3NUgxMTVWMTI1SDg1Vjc1WiIgZmlsbD0iI0QxRDFEMSIvPgo8Y2lyY2xlIGN4PSI5MCIgY3k9IjkwIiByPSI1IiBmaWxsPSIjOUExQTFIIi8+CjxwYXRoIGQ9Ik03NSAxMjVIMTI1VjE0MEg3NVYxMjVaIiBmaWxsPSIjQTFBMUExIi8+Cjwvc3ZnPgo=';
    };
  };

  const renderRating = (rating: number) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ fontSize: '0.85rem' }}>
            {index < rating ? (
              <StarIcon sx={{ fontSize: '0.85rem', color: '#FFC24B' }} />
            ) : (
              <StarBorderIcon sx={{ fontSize: '0.85rem', color: 'rgba(255, 194, 75, 0.4)' }} />
            )}
          </Box>
        ))}
        <Typography variant="caption" sx={{ color: 'rgba(250, 244, 232, 0.55)', fontSize: '0.75rem', ml: 0.5 }}>
          ({product.reviewCount || 0})
        </Typography>
      </Box>
    );
  };

  const cardSx = variant === 'list' 
    ? { 
        display: 'flex', 
        height: 190,
        borderRadius: '16px',
        overflow: 'hidden',
      }
    : {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
      };

  const mediaSx = variant === 'list'
    ? {
        width: 190,
        height: 190,
        objectFit: 'cover',
      }
    : {
        height: 240,
        width: '100%',
        objectFit: 'cover',
      };

  return (
    <Card sx={cardSx}>
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          sx={mediaSx}
          image={getImageSrc()}
          alt={product.name}
          onError={handleImageError}
        />
        
        {product.isNew && (
          <Chip
            label="NEW"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              backgroundColor: 'rgba(255, 194, 75, 0.2)',
              color: '#FFC24B',
              border: '1px solid rgba(255, 194, 75, 0.4)',
              backdropFilter: 'blur(8px)',
              fontWeight: 600,
              fontSize: '0.68rem',
            }}
          />
        )}
        
        {(product.discountPercentage && product.discountPercentage > 0) && (
          <Chip
            label={`-${product.discountPercentage}%`}
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: 'rgba(230, 95, 142, 0.2)',
              color: '#E65F8E',
              border: '1px solid rgba(230, 95, 142, 0.4)',
              backdropFilter: 'blur(8px)',
              fontWeight: 600,
              fontSize: '0.68rem',
            }}
          />
        )}
        
        {isOutOfStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(12, 8, 16, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#FAF4E8', fontWeight: 600, letterSpacing: '0.05em' }}>
              OUT OF STOCK
            </Typography>
          </Box>
        )}
        
        <Box sx={{ position: 'absolute', top: 10, right: (product.discountPercentage && product.discountPercentage > 0) ? 68 : 10, display: 'flex', gap: 0.75 }}>
          {onToggleWishlist && (
            <Tooltip title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product.id);
                }}
                sx={{
                  backgroundColor: 'rgba(15, 10, 22, 0.65)',
                  backdropFilter: 'blur(10px)',
                  color: '#FAF4E8',
                  padding: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 10, 22, 0.85)',
                  },
                }}
                size="small"
              >
                {isInWishlist ? (
                  <WishlistIcon sx={{ fontSize: '1rem', color: '#E65F8E' }} />
                ) : (
                  <WishlistBorderIcon sx={{ fontSize: '1rem' }} />
                )}
              </IconButton>
            </Tooltip>
          )}
          
          {showQuickView && onQuickView && (
            <Tooltip title="Quick view">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                sx={{
                  backgroundColor: 'rgba(15, 10, 22, 0.65)',
                  backdropFilter: 'blur(10px)',
                  color: '#FAF4E8',
                  padding: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(15, 10, 22, 0.85)',
                  },
                }}
                size="small"
              >
                <ViewIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
        <Box sx={{ mb: 0.75 }}>
          <Chip
            label={product.category}
            size="small"
            sx={{
              fontSize: '0.68rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(250, 244, 232, 0.7)',
            }}
          />
        </Box>
        
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            fontSize: '0.98rem',
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: variant === 'list' ? 2 : 1,
            WebkitBoxOrient: 'vertical',
            color: '#FAF4E8',
          }}
        >
          {product.name}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            mb: 1.5,
            color: 'rgba(214, 200, 180, 0.7)',
            fontSize: '0.82rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: variant === 'list' ? 3 : 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description}
        </Typography>
        
        {product.rating && renderRating(product.rating)}
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#FF5B24',
              fontWeight: 600,
              fontSize: '1.05rem',
            }}
          >
            ${(() => {
              const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
              return isNaN(price) || !isFinite(price) ? '0.00' : price.toFixed(2);
            })()}
          </Typography>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <Typography
              variant="caption"
              sx={{ textDecoration: 'line-through', color: 'rgba(250, 244, 232, 0.4)' }}
            >
              ${(() => {
                const price = typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice;
                return isNaN(price) || !isFinite(price) ? '0.00' : price.toFixed(2);
              })()}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/products/${product.id}`)}
          sx={{
            flex: 1,
            fontSize: '0.78rem',
            py: 0.5,
            borderRadius: '10px',
            borderColor: 'rgba(255, 255, 255, 0.12)',
          }}
        >
          Details
        </Button>
        
        <Button
          variant="contained"
          size="small"
          startIcon={<AddToCartIcon sx={{ fontSize: '0.9rem' }} />}
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          sx={{
            flex: 1,
            fontSize: '0.78rem',
            py: 0.5,
            borderRadius: '10px',
          }}
        >
          {isOutOfStock ? 'Sold' : 'Add'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;