// src/context/UserAuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../firebase";
import { userService } from "../services/api";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({});
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to sync Firebase user with MongoDB
  const syncUserWithMongoDB = async (currentUser) => {
    if (!currentUser) {
      setMongoUser(null);
      return;
    }

    try {
      // Determine authentication provider
      let authProvider = 'email';
      if (currentUser.providerData && currentUser.providerData.length > 0) {
        authProvider = currentUser.providerData[0].providerId.replace('.com', '');
        if (authProvider === 'password') authProvider = 'email';
        if (authProvider === 'phone') authProvider = 'phone';
      }

      // Prepare user data
      const userData = {
        firebaseUID: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || '',
        phoneNumber: currentUser.phoneNumber || '',
        authProvider
      };

      // Create or update user in MongoDB
      const dbUser = await userService.createOrUpdateUser(userData);
      setMongoUser(dbUser);
    } catch (error) {
      console.error("Error syncing with MongoDB:", error);
    }
  };

  async function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function logOut() {
    setMongoUser(null);
    return signOut(auth);
  }

  async function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider);
  }

  function setUpRecaptha(number) {
    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {},
      auth
    );
    recaptchaVerifier.render();
    return signInWithPhoneNumber(auth, number, recaptchaVerifier);
  }

  // Function to update user data in MongoDB
  async function updateUserData(userData) {
    if (!user || !user.uid) return;
    
    try {
      const updatedUser = await userService.updateUserData(user.uid, userData);
      setMongoUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentuser) => {
      console.log("Auth", currentuser);
      setLoading(true);
      setUser(currentuser);
      
      if (currentuser) {
        await syncUserWithMongoDB(currentuser);
      } else {
        setMongoUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider
      value={{
        user,
        mongoUser,
        loading,
        logIn,
        signUp,
        logOut,
        googleSignIn,
        setUpRecaptha,
        updateUserData,
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}