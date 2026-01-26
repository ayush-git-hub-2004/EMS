import { createTheme } from '@mui/material/styles';
import { createContext } from 'react';

const primaryMain = '#1976d2';
const secondaryMain = '#dc004e';

export const defaultMode = 'light';

export const ColorModeContext = createContext({
  mode: defaultMode,
  toggleColorMode: () => {},
});

export const buildTheme = (mode = defaultMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: primaryMain },
      secondary: { main: secondaryMain },
      background: {
        default: mode === 'light' ? '#f4f6fb' : '#0b1224',
        paper: mode === 'light' ? '#ffffff' : '#0f172a',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      // Responsive typography
      h1: {
        fontSize: '2.5rem',
        '@media (max-width:600px)': {
          fontSize: '1.8rem',
        },
      },
      h2: {
        fontSize: '2rem',
        '@media (max-width:600px)': {
          fontSize: '1.5rem',
        },
      },
      h3: {
        fontSize: '1.75rem',
        '@media (max-width:600px)': {
          fontSize: '1.3rem',
        },
      },
      h4: {
        fontSize: '1.5rem',
        '@media (max-width:600px)': {
          fontSize: '1.1rem',
        },
      },
      h5: {
        fontSize: '1.25rem',
        '@media (max-width:600px)': {
          fontSize: '1rem',
        },
      },
      h6: {
        fontSize: '1rem',
        '@media (max-width:600px)': {
          fontSize: '0.95rem',
        },
      },
      body1: {
        fontSize: '1rem',
        '@media (max-width:600px)': {
          fontSize: '0.9rem',
        },
      },
      body2: {
        fontSize: '0.875rem',
        '@media (max-width:600px)': {
          fontSize: '0.8rem',
        },
      },
      button: {
        '@media (max-width:600px)': {
          fontSize: '0.85rem',
        },
      },
    },
    shape: {
      borderRadius: 10,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'background-color 150ms ease, color 150ms ease',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            transition: 'background-color 150ms ease, color 150ms ease',
          },
        },
      },
      MuiContainer: {
        defaultProps: {
          maxWidth: 'lg',
        },
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              paddingLeft: '12px',
              paddingRight: '12px',
            },
            '@media (min-width:601px) and (max-width:960px)': {
              paddingLeft: '16px',
              paddingRight: '16px',
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          fullWidth: true,
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              padding: '8px 16px',
              fontSize: '0.85rem',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              padding: '8px 4px',
              fontSize: '0.75rem',
            },
          },
          head: {
            '@media (max-width:600px)': {
              fontSize: '0.7rem',
              fontWeight: 600,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            '@media (max-width:600px)': {
              fontSize: '0.75rem',
              height: '24px',
            },
          },
        },
      },
    },
  });
