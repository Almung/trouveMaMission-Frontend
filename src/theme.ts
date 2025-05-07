import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#f47216', // Sopra Steria orange
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9px',
          padding: '15px',
          fontWeight: 700,
          fontSize: '17px',
          textTransform: 'none',
        },
        contained: {
          '&:hover': {
            backgroundColor: '#ffffff',
            color: '#f47216',
            boxShadow: '0px 0px 0px 2px #ffffff, 0px 0px 0px 4px #0000003a',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#ecedec',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: '#ecedec',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f47216',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 10px rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
        },
      },
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
      fontSize: '24px',
    },
  },
});

export default theme; 