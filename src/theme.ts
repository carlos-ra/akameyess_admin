import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: {
      fontFamily: '"Poppins", sans-serif',
    },
    h2: {
      fontFamily: '"Poppins", sans-serif',
    },
    h3: {
      fontFamily: '"Poppins", sans-serif',
    },
    h4: {
      fontFamily: '"Poppins", sans-serif',
    },
    h5: {
      fontFamily: '"Poppins", sans-serif',
    },
    h6: {
      fontFamily: '"Poppins", sans-serif',
    },
    subtitle1: {
      fontFamily: '"Poppins", sans-serif',
    },
    subtitle2: {
      fontFamily: '"Poppins", sans-serif',
    },
    body1: {
      fontFamily: '"Poppins", sans-serif',
    },
    body2: {
      fontFamily: '"Poppins", sans-serif',
    },
    button: {
      fontFamily: '"Poppins", sans-serif',
      textTransform: 'none', // This prevents uppercase transformation
    },
  },
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    primary: {
      main: '#1976d2',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px',
          whiteSpace: 'nowrap',
          fontFamily: '"Poppins", sans-serif',
          '&.description-cell': {
            maxWidth: '300px',
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          tableLayout: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", sans-serif',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: '"Poppins", sans-serif',
        },
      },
    },
  },
}); 