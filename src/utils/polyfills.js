// Polyfills pour Three.js sur React Native
import 'react-native-url-polyfill/auto';

// Polyfill pour document (Three.js en a besoin)
if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({}),
    createElementNS: () => ({}),
  };
}

// Polyfill pour window
if (typeof window !== 'undefined') {
  if (!window.addEventListener) {
    window.addEventListener = () => {};
  }
  if (!window.removeEventListener) {
    window.removeEventListener = () => {};
  }
}

export { };
