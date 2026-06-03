import { Platform } from 'react-native';
import apiClient from './api';
import type { UserRole } from '../types';

// ─── Web: load Google Identity Services script ────────────
function loadGoogleScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById('google-gsi')) return resolve();
    const script = document.createElement('script');
    script.id = 'google-gsi';
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

function getWebIdToken(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await loadGoogleScript();
    const google = (window as any).google;
    if (!google) return reject(new Error('Google SDK failed to load'));

    const nonce = btoa(Math.random().toString(36).substring(2));

    google.accounts.id.initialize({
      client_id: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      nonce,
      callback: (response: any) => {
        if (response.credential) resolve(response.credential);
        else reject(new Error('No credential returned from Google'));
      },
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        reject(new Error('Google sign-in could not be displayed. Check your client ID or browser settings.'));
      } else if (notification.isSkippedMoment()) {
        reject(new Error('SIGN_IN_CANCELLED'));
      }
    });
  });
}

// ─── Native: use @react-native-google-signin ─────────────
async function getNativeIdToken(): Promise<string> {
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const idToken = userInfo.data?.idToken;
  if (!idToken) throw new Error('No ID token returned from Google');
  return idToken;
}

// ─── Shared ───────────────────────────────────────────────
export async function signInWithGoogle(role: UserRole) {
  try {
    const idToken = Platform.OS === 'web'
      ? await getWebIdToken()
      : await getNativeIdToken();

    const response = await apiClient.post('/auth/google/', { id_token: idToken, role });
    return { status: response.status, data: response.data };

  } catch (error: any) {
    // Re-map backend 400 to a readable message
    if (error?.response?.status === 400) {
      const data = error.response.data;
      const msg = data?.detail ?? data?.message ?? data?.error
        ?? 'Invalid Google token. Make sure the correct Google client ID is configured.';
      throw new Error(msg);
    }

    // Network error
    if (!error?.response) {
      throw new Error('Network error. Check your connection and try again.');
    }

    // Pass through everything else (SIGN_IN_CANCELLED, IN_PROGRESS, etc.)
    throw error;
  }
}

// ─── Status codes (native parity for web) ────────────────
export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
};