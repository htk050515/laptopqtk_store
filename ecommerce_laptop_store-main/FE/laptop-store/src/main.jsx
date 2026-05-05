import React from 'react';
import ReactDOM from 'react-dom/client'; // Chú ý import từ 'react-dom/client'
import App from './App';
import './index.css'; // Nếu bạn sử dụng CSS
const root = ReactDOM.createRoot(document.getElementById('root'));

// Sử dụng root để render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);