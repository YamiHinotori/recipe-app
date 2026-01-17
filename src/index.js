import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShoppingListProvider } from './context/ShoppingListContext';
import { RecipeProvider } from './context/RecipeContext';
import { ProductDatabaseProvider } from './context/ProductDatabaseContext';
import { StoreLayoutsProvider } from './context/StoreLayoutsContext';
import Dashboard from './components/Dashboard.jsx';
import Rezept from './components/Rezept.jsx';
import ShoppingList from './components/ShoppingList.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ProductManager from './components/ProductManager.jsx';
import StoresManager from './components/StoresManager.jsx';
import Login from './components/Login.jsx';
import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// App Component mit Routes
const App = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter basename="/recipe-app">
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/recipe/:id"
          element={
            <ProtectedRoute>
              <Rezept />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/shopping-list"
          element={
            <ProtectedRoute>
              <ShoppingList />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductManager />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/stores"
          element={
            <ProtectedRoute>
              <StoresManager />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

// Root Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RecipeProvider>
        <ProductDatabaseProvider>
          <StoreLayoutsProvider>
            <ShoppingListProvider>
              <App />
            </ShoppingListProvider>
          </StoreLayoutsProvider>
        </ProductDatabaseProvider>
      </RecipeProvider>
    </AuthProvider>
  </React.StrictMode>
);