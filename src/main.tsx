import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

const telegramApp = window.Telegram?.WebApp;
if (telegramApp) {
  telegramApp.ready();
  telegramApp.expand();
  telegramApp.setHeaderColor?.('#eef8f8');
  telegramApp.setBackgroundColor?.('#eef8f8');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
