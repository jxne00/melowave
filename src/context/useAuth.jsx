import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// react hook to access auth state
export const useAuth = () => useContext(AuthContext);
