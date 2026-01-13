import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';

const AppWrapper: React.FC = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

export default AppWrapper;