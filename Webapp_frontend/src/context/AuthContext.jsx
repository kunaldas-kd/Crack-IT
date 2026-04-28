import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

// Decode a JWT payload without a library
function decodeJWT(token) {
  try {
    const base64Payload = token.split('.')[1];
    const decoded = JSON.parse(atob(base64Payload));
    return decoded;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const payload = decodeJWT(accessToken);
      setUser({
        authenticated: true,
        uid: payload?.username || payload?.user_id || 'User',
        user_id: payload?.user_id,
        first_name: payload?.first_name || '',
        last_name: payload?.last_name || '',
        email: payload?.email || '',
      });
    }
  }, []);

  const loginUser = (access, refresh) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    const payload = decodeJWT(access);
    setUser({
      authenticated: true,
      uid: payload?.username || payload?.user_id || 'User',
      user_id: payload?.user_id,
      first_name: payload?.first_name || '',
      last_name: payload?.last_name || '',
      email: payload?.email || '',
    });
    navigate('/dashboard');
  };

  const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
