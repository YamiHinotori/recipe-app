import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShoppingListProvider } from './context/ShoppingListContext';
import { RecipeProvider } from './context/RecipeContext';
import { ProductDatabaseProvider } from './context/ProductDatabaseContext';
import { StoreLayoutsProvider } from './context/StoreLayoutsContext';
import { MealPlannerProvider } from './context/MealPlannerContext';
import Dashboard from './pages/Dashboard.jsx';
import Rezept from './pages/Rezept.jsx';
import ShoppingList from './pages/ShoppingList.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import ProductManager from './pages/ProductManager.jsx';
import StoresManager from './pages/StoresManager.jsx';
import Login from './pages/Login.jsx';
import MealPlanner from './pages/MealPlanner.jsx';
import InvitationModal from './components/global/InvitationModal.jsx';
import "./index.css";
import { migrateUserToV2 } from './utils/migrateToV2';
import { GroupProvider } from './context/GroupContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import GroupManager from './pages/GroupManager.jsx';
import UserManagement from './pages/UserManagement.jsx';
import { CategoriesProvider } from './context/CategoriesContext';

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
  const { user, pendingInvitation, acceptInvitation, declineInvitation } = useAuth();

  return (
    <>
      {/* Einladungs-Modal (zeigt sich automatisch wenn Einladung vorhanden) */}
      {pendingInvitation && (
        <InvitationModal
          invitation={pendingInvitation}
          onAccept={() => acceptInvitation(pendingInvitation)}
          onDecline={declineInvitation}
        />
      )}

      <HashRouter>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />

          <Route
            path="/migrate"
            element={
              <div>
                  <button onClick={async () => {
                    const result = await migrateUserToV2(user.uid);
                    if (result.success) {
                      alert('Migration erfolgreich!');
                    } else {
                      alert('Migration fehlgeschlagen: ' + result.error);
                    }
                    }}>
                    🔄 Meine Daten zu V2 migrieren
                  </button>
              </div>
            }
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

          <Route 
            path="/wochenplaner" 
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/gruppe"
            element={
              <ProtectedRoute>
                <GroupManager/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UserManagement/> 
              </ProtectedRoute>
            }
          />
        </Routes>
      </HashRouter>
    </>
  );
};

// Root Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AdminProvider>
        <GroupProvider>
          <ProductDatabaseProvider>
            <CategoriesProvider>
              <StoreLayoutsProvider>
                <RecipeProvider>
                  <ShoppingListProvider>
                    <MealPlannerProvider>
                      <App />
                    </MealPlannerProvider>
                  </ShoppingListProvider>
                </RecipeProvider>
              </StoreLayoutsProvider>
              </CategoriesProvider>
          </ProductDatabaseProvider>
        </GroupProvider>
      </AdminProvider>
    </AuthProvider>
  </React.StrictMode>
);