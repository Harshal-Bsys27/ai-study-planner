import { StrictMode, useMemo, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.jsx'
import { ThemeModeContext } from './theme'

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary:    { main: '#0f766e', light: '#14b8a6', dark: '#0d6460', contrastText: '#fff' },
    secondary:  { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2', contrastText: '#fff' },
    success:    { main: '#10b981', light: '#34d399', dark: '#059669' },
    warning:    { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    error:      { main: '#f43f5e', light: '#fb7185', dark: '#e11d48' },
    background: mode === 'light'
      ? { default: '#f0f9ff', paper: '#ffffff' }
      : { default: '#061311', paper: '#0b1f1c' },
    text: mode === 'light'
      ? {
          primary: '#0b1f24',
          secondary: '#4b5a5f',
          disabled: '#94a3b8',
        }
      : {
          primary: '#e2e8f0',
          secondary: '#a3b3b8',
          disabled: '#64748b',
        },
    divider: mode === 'light' ? 'rgba(15, 118, 110, 0.1)' : 'rgba(148, 163, 184, 0.2)',
  },

  typography: {
    fontFamily: '"Outfit", "Space Grotesk", "Inter", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
    h2: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15 },
    h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
    h4: { fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600, letterSpacing: '0.01em' },
    subtitle2: { fontWeight: 600, letterSpacing: '0.02em' },
    body1:  { lineHeight: 1.65, fontWeight: 400 },
    body2:  { lineHeight: 1.6,  fontWeight: 400 },
    caption: { fontWeight: 500, letterSpacing: '0.03em' },
    overline: { fontWeight: 700, letterSpacing: '0.15em', fontSize: '0.7rem' },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
  },

  shape: { borderRadius: 14 },

  shadows: [
    'none',
    '0 1px 4px rgba(15, 23, 42, 0.06)',
    '0 2px 8px rgba(15, 23, 42, 0.08)',
    '0 4px 12px rgba(15, 23, 42, 0.09)',
    '0 6px 16px rgba(15, 23, 42, 0.1)',
    '0 8px 20px rgba(15, 23, 42, 0.11)',
    '0 10px 24px rgba(15, 23, 42, 0.12)',
    '0 12px 28px rgba(15, 23, 42, 0.13)',
    '0 14px 32px rgba(15, 23, 42, 0.14)',
    '0 16px 36px rgba(15, 23, 42, 0.14)',
    '0 18px 40px rgba(15, 23, 42, 0.14)',
    '0 20px 44px rgba(15, 23, 42, 0.14)',
    '0 22px 48px rgba(15, 23, 42, 0.14)',
    '0 24px 52px rgba(15, 23, 42, 0.14)',
    '0 26px 56px rgba(15, 23, 42, 0.14)',
    '0 28px 60px rgba(15, 23, 42, 0.14)',
    '0 30px 64px rgba(15, 23, 42, 0.14)',
    '0 32px 68px rgba(15, 23, 42, 0.14)',
    '0 34px 72px rgba(15, 23, 42, 0.14)',
    '0 36px 76px rgba(15, 23, 42, 0.14)',
    '0 38px 80px rgba(15, 23, 42, 0.14)',
    '0 40px 84px rgba(15, 23, 42, 0.14)',
    '0 42px 88px rgba(15, 23, 42, 0.14)',
    '0 44px 92px rgba(15, 23, 42, 0.14)',
    '0 48px 96px rgba(15, 23, 42, 0.14)',
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Outfit", "Space Grotesk", sans-serif',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(15, 118, 110, 0.07)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 700,
          letterSpacing: '0.02em',
          fontSize: '0.9rem',
          padding: '9px 22px',
          transition: 'all 0.25s ease',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(15, 118, 110, 0.35)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            transform: 'translateY(-1px)',
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 500,
            '& fieldset': { borderColor: 'rgba(15, 118, 110, 0.2)', borderWidth: '1.5px' },
            '&:hover fieldset': { borderColor: 'rgba(15, 118, 110, 0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#0f766e', borderWidth: '2px' },
          },
          '& .MuiInputLabel-root': { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 500,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          letterSpacing: '0.01em',
          borderRadius: 8,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '14px !important',
          '&:before': { display: 'none' },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: '"Outfit", sans-serif',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#64748b',
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.95rem',
          letterSpacing: '0.01em',
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 500,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 500,
          fontSize: '0.8rem',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          backgroundColor: 'rgba(15, 118, 110, 0.12)',
        },
        bar: {
          borderRadius: 999,
        },
      },
    },
  },
})

const getStoredMode = () => {
  const stored = localStorage.getItem('themeMode')
  return stored === 'dark' || stored === 'light' ? stored : 'light'
}

export const Root = () => {
  const [mode, setMode] = useState(getStoredMode)
  const theme = useMemo(() => getTheme(mode), [mode])

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('themeMode', next)
      // Update html data attribute for CSS to respond
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }

  // Set initial theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
