import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginHeader from '../components/login/LoginHeader';
import ErrorMessage from '../components/login/ErrorMessage';
import GoogleLoginButton from '../components/login/GoogleLoginButton';
import LoginInfo from '../components/login/LoginInfo';
import FeaturesList from '../components/login/FeaturesList';

/**
 * Login - Login-Seite mit Google-Authentifizierung
 * 
 * Funktionen:
 * - Google OAuth Login
 * - Fehlerbehandlung
 * - Feature-Highlights
 * - Loading-State
 */
const Login = () => {
  const { loginWithGoogle, error: authError } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handhabt Google Login
   */
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login fehlgeschlagen:', error);
      setError('Login fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          
          {/* Logo und Titel */}
          <LoginHeader />

          {/* Fehlermeldung */}
          {(error || authError) && (
            <ErrorMessage message={error || authError} />
          )}

          {/* Google Login Button */}
          <GoogleLoginButton
            onClick={handleLogin}
            loading={loading}
          />

          {/* Info-Text */}
          <LoginInfo />

          {/* Feature-Liste */}
          <FeaturesList />
        </div>
      </div>
    </div>
  );
};

export default Login;