import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../api/services/authService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/**
 * OAuth Callback Page
 *
 * This page is the redirect target after a successful Google OAuth login.
 * The server redirects here with ?token=<JWT> in the URL.
 *
 * Flow:
 *  1. Extract the token from the query string
 *  2. Store it in localStorage (same as local login)
 *  3. Fetch the user profile via GET /api/v1/auth/me
 *  4. Dispatch AUTH_SUCCESS to AuthContext
 *  5. Redirect to the home page
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        const messages = {
          auth_failed: 'Google authentication failed. Please try again.',
          invalid_state: 'Security validation failed (CSRF). Please try again.',
          no_user: 'Could not create or find your account.',
          server_error: 'An unexpected error occurred. Please try again.',
        };
        toast.error(messages[error] || 'Authentication failed.');
        setTimeout(() => navigate('/', { replace: true }), 2000);
        return;
      }

      if (!token) {
        setStatus('error');
        toast.error('No authentication token received.');
        setTimeout(() => navigate('/', { replace: true }), 2000);
        return;
      }

      try {
        // Store token and fetch user profile — same as local login
        await loginWithToken(token);
        setStatus('success');
        toast.success('Signed in with Google successfully!');
        navigate('/', { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        toast.error('Failed to complete sign-in. Please try again.');
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-black" />
            <p className="text-sm uppercase tracking-widest text-gray-400">
              Completing sign-in...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-8 h-8 mx-auto text-red-500 text-2xl">✕</div>
            <p className="text-sm uppercase tracking-widest text-gray-400">
              Redirecting...
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-8 h-8 mx-auto text-green-600 text-2xl">✓</div>
            <p className="text-sm uppercase tracking-widest text-gray-400">
              Welcome!
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
