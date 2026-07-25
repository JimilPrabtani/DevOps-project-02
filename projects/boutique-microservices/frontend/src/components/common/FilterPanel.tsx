import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

export interface FilterOptions {
  priceRange: [number, number];
  category: string;
  brand: string[];
  size: string[];
  color: string[];
  rating: number;
  inStock: boolean;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  brands: string[];
  sizes: string[];
  colors: string[];
  maxPrice: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  categories,
  brands,
  sizes,
  colors,
  maxPrice,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, maxPrice],
    category: '',
    brand: [],
    size: [],
    color: [],
    rating: 0,
    inStock: false,
  });

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    const newFilters = { ...filters, priceRange: newValue as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrand = filters.brand.includes(brand)
      ? filters.brand.filter(b => b !== brand)
      : [...filters.brand, brand];
    const newFilters = { ...filters, brand: newBrand };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSizeToggle = (size: string) => {
    const newSize = filters.size.includes(size)
      ? filters.size.filter(s => s !== size)
      : [...filters.size, size];
    const newFilters = { ...filters, size: newSize };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColorToggle = (color: string) => {
    const newColor = filters.color.includes(color)
      ? filters.color.filter(c => c !== color)
      : [...filters.color, color];
    const newFilters = { ...filters, color: newColor };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleInStockToggle = () => {
    const newFilters = { ...filters, inStock: !filters.inStock };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      priceRange: [0, maxPrice],
      category: '',
      brand: [],
      size: [],
      color: [],
      rating: 0,
      inStock: false,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = [
    filters.category,
    filters.brand.length,
    filters.size.length,
    filters.color.length,
    filters.rating,
    filters.inStock,
  ].filter(Boolean).length + (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0);

  const accordionSx = {
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    boxShadow: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    '&:before': { display: 'none' },
    '&.Mui-expanded': { margin: 0 },
  };

  return (
    <Card sx={{ height: 'fit-content', position: 'sticky', top: 88, borderRadius: '16px' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon sx={{ fontSize: '1.1rem', color: '#FF5B24' }} />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>Filters</Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 91, 36, 0.2)',
                  color: '#FF5B24',
                  fontSize: '0.72rem',
                  height: 20,
                }}
              />
            )}
          </Box>
          {activeFilterCount > 0 && (
            <Button
              startIcon={<ClearIcon sx={{ fontSize: '0.85rem' }} />}
              onClick={clearFilters}
              size="small"
              sx={{ color: 'rgba(250, 244, 232, 0.6)', fontSize: '0.78rem', p: '2px 8px' }}
            >
              Clear
            </Button>
          )}
        </Box>

        <Accordion defaultExpanded sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(250, 244, 232, 0.5)', fontSize: '1.1rem' }} />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '0.88rem' }}>Price Range</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1, pb: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(214, 200, 180, 0.7)' }}>
              ${filters.priceRange[0]} — ${filters.priceRange[1]}
            </Typography>
            <Slider
              value={filters.priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={maxPrice}
              step={50}
              sx={{
                mt: 1.5,
                color: '#FF5B24',
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16,
                  backgroundColor: '#FAF4E8',
                },
                '& .MuiSlider-track': {
                  border: 'none',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                },
              }}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(250, 244, 232, 0.5)', fontSize: '1.1rem' }} />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '0.88rem' }}>Category</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1 }}>
            <FormControl fullWidth size="small">
              <Select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                displayEmpty
                sx={{
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.85rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(250, 244, 232, 0.5)', fontSize: '1.1rem' }} />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '0.88rem' }}>Brand</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {brands.map((brand) => (
                <FormControlLabel
                  key={brand}
                  control={
                    <Checkbox
                      checked={filters.brand.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      size="small"
                      sx={{ color: 'rgba(255, 255, 255, 0.3)', '&.Mui-checked': { color: '#FF5B24' } }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'rgba(250, 244, 232, 0.8)' }}>{brand}</Typography>}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(250, 244, 232, 0.5)', fontSize: '1.1rem' }} />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '0.88rem' }}>Size</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {sizes.map((size) => (
                <Chip
                  key={size}
                  label={size}
                  clickable
                  onClick={() => handleSizeToggle(size)}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    backgroundColor: filters.size.includes(size) ? 'rgba(255, 91, 36, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: filters.size.includes(size) ? '#FF5B24' : 'rgba(250, 244, 232, 0.7)',
                    border: filters.size.includes(size) ? '1px solid rgba(255, 91, 36, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(250, 244, 232, 0.5)', fontSize: '1.1rem' }} />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '0.88rem' }}>Color</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {colors.map((color) => (
                <Chip
                  key={color}
                  label={color}
                  clickable
                  onClick={() => handleColorToggle(color)}
                  size="small"
                  sx={{
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    backgroundColor: filters.color.includes(color) ? 'rgba(255, 91, 36, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    color: filters.color.includes(color) ? '#FF5B24' : 'rgba(250, 244, 232, 0.7)',
                    border: filters.color.includes(color) ? '1px solid rgba(255, 91, 36, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(250, 244, 232, 0.5)', fontSize: '1.1rem' }} />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '0.88rem' }}>Rating</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {[4, 3, 2, 1].map((rating) => (
                <FormControlLabel
                  key={rating}
                  control={
                    <Checkbox
                      checked={filters.rating === rating}
                      onChange={() => handleRatingChange(filters.rating === rating ? 0 : rating)}
                      size="small"
                      sx={{ color: 'rgba(255, 255, 255, 0.3)', '&.Mui-checked': { color: '#FF5B24' } }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'rgba(250, 244, 232, 0.8)' }}>{rating} Stars & Up</Typography>}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.inStock}
                onChange={handleInStockToggle}
                size="small"
                sx={{ color: 'rgba(255, 255, 255, 0.3)', '&.Mui-checked': { color: '#FF5B24' } }}
              />
            }
            label={<Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'rgba(250, 244, 232, 0.8)' }}>In Stock Only</Typography>}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;