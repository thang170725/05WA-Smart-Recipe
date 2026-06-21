import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from "./context/AuthContext.jsx"
import { clientId } from "../dist/clientid.js"

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <GoogleOAuthProvider clientId={clientId}>
      <StrictMode>
        <App /> 
      </StrictMode>
    </GoogleOAuthProvider>
  </AuthProvider>
)