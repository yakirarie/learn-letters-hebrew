import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppStateProvider } from './state/AppStateProvider'
import { QuizSessionProvider } from './state/QuizSession'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <AppStateProvider>
      <QuizSessionProvider>
        <App />
      </QuizSessionProvider>
      </AppStateProvider>
    </ErrorBoundary>
  </StrictMode>,
)
