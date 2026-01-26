import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { store } from './store';
import './index.css';
import { buildTheme, defaultMode, ColorModeContext } from './theme';

const Root = () => {
  const [mode, setMode] = useState(() => {
    // Read initial mode from localStorage
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || defaultMode;
  });

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const newMode = prev === 'light' ? 'dark' : 'light';
          // Save to localStorage when mode changes
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    [mode]
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
              />
            </ThemeProvider>
          </ColorModeContext.Provider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
