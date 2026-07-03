import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2d6a4f',      // deep forest green
      light: '#52b788',
      dark: '#1b4332',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f4a261',      // warm amber — compost/earth tone
      light: '#ffb347',
      dark: '#e76f51',
      contrastText: '#fff',
    },
    success: { main: '#52b788' },
    background: {
      default: '#f8faf9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#555f61',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '10px 22px' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
          '&:hover': { background: 'linear-gradient(135deg, #1b4332, #2d6a4f)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
  },
});

export default theme;
