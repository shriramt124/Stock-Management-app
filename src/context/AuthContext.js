import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Create the context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = firestore();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is signed in
        try {
          // Get additional user data from Firestore
          const userDoc = await db.collection('users').doc(user.uid).get();
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check if user account is active
            if (!userData.isActive) {
              await auth().signOut();
              setCurrentUser(null);
              setLoading(false);
              return;
            }

            setCurrentUser({
              uid: user.uid,
              email: user.email,
              role: userData.role || 'user',
              ...userData,
            });
          } else {
            // If no user document exists, sign out
            await auth().signOut();
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          await auth().signOut();
          setCurrentUser(null);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  const isUser = () => {
    return currentUser && currentUser.role === 'user';
  };

  const canModifyStock = () => {
    return isAdmin();
  };

  const value = {
    currentUser,
    loading,
    isAdmin,
    isUser,
    canModifyStock,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};