import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const BackendContext = createContext();

export const useBackendStatus = () => useContext(BackendContext);

export const BackendProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      try {
        await axios.get(`${BASE_URL}/health`, { timeout: 3000 });
        setIsOffline(false);
      } catch (error) {
        setIsOffline(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <BackendContext.Provider value={{ isOffline, isChecking }}>
      {children}
    </BackendContext.Provider>
  );
};
