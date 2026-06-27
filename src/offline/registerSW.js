/**
 * Register the service worker (production builds only — the dev SW would
 * interfere with Vite HMR). Caches the app shell on first load.
 */
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
};
