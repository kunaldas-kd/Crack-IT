import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const FeatureContext = createContext();

export const FeatureProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [features, setFeatures] = useState(null);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  useEffect(() => {
    // We only fetch features if the user is logged in, or we could fetch globally.
    // Given the API currently returns all global features, we'll fetch once on load.
    const fetchFeatures = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/settings/list-enable-features/');
        if (response.ok) {
          const data = await response.json();
          // Assuming we take the first global feature config for now
          if (data && data.length > 0) {
            setFeatures(data[0]);
          } else {
            setFeatures(null);
          }
        } else {
          console.error("Failed to fetch features");
          setFeatures(null);
        }
      } catch (error) {
        console.error("Error fetching feature flags:", error);
        setFeatures(null);
      } finally {
        setLoadingFeatures(false);
      }
    };

    fetchFeatures();
  }, [user]);

  return (
    <FeatureContext.Provider value={{ features, loadingFeatures }}>
      {children}
    </FeatureContext.Provider>
  );
};
