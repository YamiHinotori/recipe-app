import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from './components/Dashboard.jsx';
import Rezept from './components/Rezept.jsx'
import "./index.css"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipe/:id" element={<Rezept />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);