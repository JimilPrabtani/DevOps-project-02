import { createTheme } from '@mui/material/styles';

/**
 * SUNFREAKS STORE THEME
 * Refined, clean iOS-inspired glass aesthetic with subtle UI controls.
 */

export const sunfreaks = {
  void: '#120D1A',
  ink: '#0C0810',
  dusk: 'rgba(32, 23, 46, 0.75)',
  paper: '#1C1528',
  cream: '#FAF4E8',
  sand: '#D6C8B4',
  solar: '#FF5B24',
  flare: '#FFC24B',
  pink: '#E65F8E',
  teal: '#2F9C95',
  plasma: '#A78BFA',
  mint: '#5EEAD4',
} as const;

const iosFontStack = [
  '-apple-system',
  'BlinkMacSystemFont',
  '"SF Pro Display"',
  '"SF Pro Text"',
  '"SF Pro"',
  '"Inter"',
  '"Helvetica Neue"',
  'Helvetica',
  'Arial',
  'sans-serif',
].join(',');

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: sunfreaks.solar,
      light: '#FF7D52',
      dark: '#D4400F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: sunfreaks.flare,
      light: '#FFD780',
      dark: '#D69C2C',
      contrastText: sunfreaks.ink,
    },
    background: {
      default: sunfreaks.void,
      paper: sunfreaks.paper,
    },
    text: {
      primary: sunfreaks.cream,
      secondary: sunfreaks.sand,
    },
    success: { main: sunfreaks.mint },
    info: { main: sunfreaks.plasma },
    error: { main: sunfreaks.pink },
    warning: { main: sunfreaks.flare },
    divider: 'rgba(255, 255, 255, 0.08)',
  },

  shape: { borderRadius: 14 },

  typography: {
    fontFamily: iosFontStack,

    h1: {
      fontFamily: iosFontStack,
      fontWeight: 700,
      fontSize: 'clamp(2rem, 4vw, 2.75rem)',
      lineHeight: 1.12,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: iosFontStack,
      fontWeight: 600,
      fontSize: 'clamp(1.6rem, 3vw, 2.15rem)',
      lineHeight: 1.18,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: iosFontStack,
      fontWeight: 600,
      fontSize: 'clamp(1.3rem, 2vw, 1.6rem)',
      lineHeight: 1.25,
      letterSpacing: '-0.015em',
    },
    h4: { fontFamily: iosFontStack, fontWeight: 600, fontSize: '1.35rem', letterSpacing: '-0.01em' },
    h5: { fontFamily: iosFontStack, fontWeight: 600, fontSize: '1.15rem', letterSpacing: '-0.01em' },
    h6: { fontFamily: iosFontStack, fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.005em' },
    body1: { fontSize: '0.95rem', lineHeight: 1.55, letterSpacing: '-0.005em' },
    body2: { fontSize: '0.875rem', lineHeight: 1.5, letterSpacing: '-0.005em' },
    button: {
      fontFamily: iosFontStack,
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    caption: { fontFamily: iosFontStack, fontSize: '0.8rem', letterSpacing: '0.01em', color: 'rgba(250, 244, 232, 0.65)' },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: sunfreaks.void,
          color: sunfreaks.cream,
          fontFamily: iosFontStack,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '0.55rem 1.35rem',
          border: '1px solid transparent',
          boxShadow: 'none',
          transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          },
          '&:active': {
            transform: 'scale(0.98)',
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: `2px solid ${sunfreaks.solar}`,
            outlineOffset: 2,
          },
        },
        containedPrimary: {
          backgroundColor: sunfreaks.solar,
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(255, 91, 36, 0.3)',
          '&:hover': {
            backgroundColor: '#FF6B38',
            boxShadow: '0 6px 20px rgba(255, 91, 36, 0.42)',
          },
        },
        containedSecondary: {
          backgroundColor: 'rgba(255, 194, 75, 0.15)',
          color: sunfreaks.flare,
          border: '1px solid rgba(255, 194, 75, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(255, 194, 75, 0.25)',
          },
        },
        outlined: {
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.16)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          color: sunfreaks.cream,
          boxShadow: 'none',
          '&:hover': {
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: sunfreaks.cream,
          },
        },
        text: {
          color: sunfreaks.cream,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(28, 21, 40, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 250ms cubic-bezier(0.16, 1, 0.3, 1), border-color 250ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: 'rgba(255, 91, 36, 0.3)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(28, 21, 40, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15, 10, 22, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: sunfreaks.cream,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          backgroundImage: 'none',
        },
      },
    },

    MuiToolbar: {
      styleOverrides: { root: { minHeight: 64 } },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: sunfreaks.cream,
            boxShadow: 'none',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.12)', borderWidth: 1 },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.25)' },
            '&.Mui-focused fieldset': { borderColor: sunfreaks.solar, borderWidth: 1.5 },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontFamily: iosFontStack,
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.01em',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        },
      },
    },
  },
});

export default theme;
