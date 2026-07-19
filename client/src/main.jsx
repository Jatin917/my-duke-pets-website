import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import { CustomerAuthProvider } from './context/CustomerAuthContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <CustomerAuthProvider>
          <WishlistProvider>
            <CompareProvider>
              <App />
            </CompareProvider>
          </WishlistProvider>
        </CustomerAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
