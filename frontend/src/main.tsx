import React from 'react';
import ReactDOM from 'react-dom/client';
import Main from './app/Main';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Main />
    </React.StrictMode>
  );
} else {
  console.error('No se encontró el elemento root');
}

