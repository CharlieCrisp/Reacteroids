import React from 'react';
import { render } from 'react-dom';
import App from "./App";
import style from './style.css';
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>, 
  document.getElementById('root')
);
