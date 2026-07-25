import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

interface SearchBarProps {
  onSearch: (query: string) => void;
  suggestions?: string[];
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  suggestions = [],
  placeholder = "Search luxury products...",
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(250, 244, 232, 0.4)', fontSize: '1.2rem' }} />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} size="small" sx={{ color: 'rgba(250, 244, 232, 0.5)' }}>
                <ClearIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(16px)',
            borderRadius: '999px',
            px: 1,
            py: 0.25,
            color: '#FAF4E8',
            fontSize: '0.92rem',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.25)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FF5B24',
              borderWidth: '1px',
            },
          },
        }}
      />
      
      {suggestions.length > 0 && query && (
        <Box sx={{ mt: 1 }}>
          <Autocomplete
            options={suggestions}
            value={[query].filter(Boolean)}
            onChange={(_, newValue) => {
              const newQuery = Array.isArray(newValue) ? newValue[0] : newValue;
              setQuery(newQuery || '');
              onSearch(newQuery || '');
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                placeholder="Suggestions"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  size="small"
                  label={option}
                  {...getTagProps({ index })}
                  sx={{ mr: 0.5, mb: 0.5, borderRadius: '999px', fontSize: '0.75rem' }}
                />
              ))
            }
            multiple
            freeSolo
          />
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;