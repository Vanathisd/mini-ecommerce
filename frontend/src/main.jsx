import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/Home.css'
import './styles/shop.css'

import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/authContext.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
  </StrictMode>,
)
