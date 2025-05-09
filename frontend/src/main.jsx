/**
 * Main Entry for WebChat Frontend
 * This file connects our React app to the DOM and sets up providers
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './store/store'
import App from './App'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import ErrorBoundary from './components/ErrorBoundary'
import ApiProvider from './contexts/ApiContext'
import WebSocketProvider from './contexts/WebSocketContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Import main stylesheet (consolidated CSS)
import './styles/main.css'

// Thiết lập Content Security Policy
if (process.env.NODE_ENV === 'production') {
  const meta = document.createElement('meta')
  meta.httpEquiv = 'Content-Security-Policy'
  meta.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss:;"
  document.getElementsByTagName('head')[0].appendChild(meta)
}

// Thêm CSRF token meta tag
const csrfMeta = document.createElement('meta')
csrfMeta.name = 'csrf-token'
csrfMeta.content = window.__CSRF_TOKEN__ || ''
document.getElementsByTagName('head')[0].appendChild(csrfMeta)

// Create root and render application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ApiProvider>
            <ThemeProvider>
              <WebSocketProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </WebSocketProvider>
            </ThemeProvider>
          </ApiProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
