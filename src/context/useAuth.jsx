import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

// react hook to access auth state
export const useAuth = () => useContext(AuthContext);
