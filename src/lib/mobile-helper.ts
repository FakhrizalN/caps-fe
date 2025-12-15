/**
 * Mobile App Detection & Redirect Handler
 * 
 * Untuk Flutter WebView:
 * - Skip landing page
 * - Redirect berdasarkan role setelah login
 * - Disable back button ke landing page
 */

// Check if running in Flutter WebView
export const isFlutterWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.navigator.userAgent.includes('FlutterWebView') || 
         typeof (window as any).FlutterApp !== 'undefined';
};

// Get initial route for mobile
export const getMobileInitialRoute = (): string => {
  if (typeof window === 'undefined') return '/login';
  
  // Check if user is logged in
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return '/login';
  }
  
  // Decode token to get role
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;
    
    if (role === 'Alumni') {
      return '/profile-user'; // Dashboard untuk user/alumni
    } else {
      return '/dashboard'; // Dashboard untuk admin
    }
  } catch (err) {
    return '/login';
  }
};

// Redirect based on role after login
export const redirectAfterLogin = (role: string) => {
  if (isFlutterWebView()) {
    // Untuk mobile app
    if (role === 'Alumni') {
      window.location.href = '/profile-user'; // User dashboard
    } else {
      window.location.href = '/dashboard'; // Admin dashboard
    }
  } else {
    // Untuk web browser (existing behavior)
    if (role === 'Alumni') {
      window.location.href = '/';
    } else {
      window.location.href = '/dashboard';
    }
  }
};

// Prevent navigation to landing page in mobile app
export const preventLandingPageNavigation = () => {
  if (typeof window === 'undefined') return;
  
  if (isFlutterWebView()) {
    // Intercept navigation ke landing page
    window.addEventListener('popstate', (event) => {
      if (window.location.pathname === '/') {
        // Redirect back to appropriate dashboard
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role === 'Alumni') {
              window.location.replace('/profile-user');
            } else {
              window.location.replace('/dashboard');
            }
          } catch (err) {
            window.location.replace('/login');
          }
        } else {
          window.location.replace('/login');
        }
        event.preventDefault();
      }
    });
  }
};

// Hide landing page elements in mobile view
export const hideLandingPageInMobile = () => {
  if (typeof document === 'undefined') return;
  
  if (isFlutterWebView()) {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide landing page elements in Flutter WebView */
      body[data-page="landing"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
};

export default {
  isFlutterWebView,
  getMobileInitialRoute,
  redirectAfterLogin,
  preventLandingPageNavigation,
  hideLandingPageInMobile,
};
