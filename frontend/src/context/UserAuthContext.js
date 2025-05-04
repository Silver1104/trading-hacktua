// // src/context/UserAuthContext.js
// import { createContext, useContext, useEffect, useState } from "react";
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   onAuthStateChanged,
//   signOut,
//   GoogleAuthProvider,
//   signInWithPopup,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
// } from "firebase/auth";
// import { auth } from "../firebase";
// import { userService } from "../services/api";

// const userAuthContext = createContext();

// export function UserAuthContextProvider({ children }) {
//   const [user, setUser] = useState({});
//   const [mongoUser, setMongoUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Helper function to sync Firebase user with MongoDB
//   const syncUserWithMongoDB = async (currentUser) => {
//     if (!currentUser) {
//       setMongoUser(null);
//       return;
//     }

//     try {
//       // Determine authentication provider
//       let authProvider = 'email';
//       if (currentUser.providerData && currentUser.providerData.length > 0) {
//         authProvider = currentUser.providerData[0].providerId.replace('.com', '');
//         if (authProvider === 'password') authProvider = 'email';
//         if (authProvider === 'phone') authProvider = 'phone';
//       }

//       // Prepare user data
//       const userData = {
//         firebaseUID: currentUser.uid,
//         email: currentUser.email || '',
//         displayName: currentUser.displayName || '',
//         phoneNumber: currentUser.phoneNumber || '',
//         authProvider
//       };

//       // Create or update user in MongoDB
//       const dbUser = await userService.createOrUpdateUser(userData);
//       setMongoUser(dbUser);
//     } catch (error) {
//       console.error("Error syncing with MongoDB:", error);
//     }
//   };

//   async function logIn(email, password) {
//     return signInWithEmailAndPassword(auth, email, password);
//   }

//   async function signUp(email, password) {
//     return createUserWithEmailAndPassword(auth, email, password);
//   }

//   async function logOut() {
//     setMongoUser(null);
//     return signOut(auth);
//   }

//   async function googleSignIn() {
//     const googleAuthProvider = new GoogleAuthProvider();
//     return signInWithPopup(auth, googleAuthProvider);
//   }

//   function setUpRecaptha(number) {
//     const recaptchaVerifier = new RecaptchaVerifier(
//       "recaptcha-container",
//       {},
//       auth
//     );
//     recaptchaVerifier.render();
//     return signInWithPhoneNumber(auth, number, recaptchaVerifier);
//   }

//   // Function to update user data in MongoDB
//   async function updateUserData(userData) {
//     if (!user || !user.uid) return;
    
//     try {
//       const updatedUser = await userService.updateUserData(user.uid, userData);
//       setMongoUser(updatedUser);
//       return updatedUser;
//     } catch (error) {
//       console.error("Error updating user data:", error);
//       throw error;
//     }
//   }

  

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentuser) => {
//       console.log("Auth", currentuser);
//       setLoading(true);
//       setUser(currentuser);
      
//       if (currentuser) {
//         await syncUserWithMongoDB(currentuser);
//       } else {
//         setMongoUser(null);
//       }
      
//       setLoading(false);
//     });

//     return () => {
//       unsubscribe();
//     };
//   }, []);

//   return (
//     <userAuthContext.Provider
//       value={{
//         user,
//         mongoUser,
//         loading,
//         logIn,
//         signUp,
//         logOut,
//         googleSignIn,
//         setUpRecaptha,
//         updateUserData,
//       }}
//     >
//       {children}
//     </userAuthContext.Provider>
//   );
// }

// export function useUserAuth() {
//   return useContext(userAuthContext);
// }

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
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
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
  
  // Update user profile in Firebase and MongoDB
  async function updateProfile(profileData) {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Update Firebase profile
      await firebaseUpdateProfile(auth.currentUser, profileData);
      
      // Update MongoDB
      const userData = {
        displayName: profileData.displayName || user.displayName || "",
        photoURL: profileData.photoURL || user.photoURL || "",
      };
      
      await userService.createOrUpdateUser({
        firebaseUID: user.uid,
        email: user.email || "",
        displayName: userData.displayName,
        phoneNumber: user.phoneNumber || "",
        authProvider: mongoUser?.authProvider || "email",
      });
      
      // Refresh user state
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      await syncUserWithMongoDB(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
  
  // Update password (requires reauthentication)
  async function updatePassword(currentPassword, newPassword) {
    if (!user) throw new Error("User not authenticated");
    if (!user.email) throw new Error("Email authentication required to change password");
    
    try {
      // Reauthenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }
  
  // Update phone number (two step process)
  async function updatePhone(phoneNumber, verificationCode = null) {
    if (!user) throw new Error("User not authenticated");
    
    try {
      if (!verificationCode) {
        // Step 1: Send verification code
        const recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          { size: "invisible" },
          auth
        );
        
        const confirmationResult = await signInWithPhoneNumber(
          auth, 
          phoneNumber, 
          recaptchaVerifier
        );
        
        // Store confirmation result in sessionStorage to persist through rerenders
        window.sessionStorage.setItem(
          "phoneConfirmationResult", 
          JSON.stringify({ 
            verificationId: confirmationResult.verificationId 
          })
        );
        
        return confirmationResult;
      } else {
        // Step 2: Verify code and update phone
        const storedData = window.sessionStorage.getItem("phoneConfirmationResult");
        if (!storedData) throw new Error("Verification session expired");
        
        const { verificationId } = JSON.parse(storedData);
        
        // Here we'd normally use PhoneAuthProvider.credential and updatePhoneNumber
        // but this is a simplified version. In a real app, you might need to use
        // Firebase Admin SDK or a custom token approach.
        
        // For demo purposes, we'll just update MongoDB
        await userService.createOrUpdateUser({
          firebaseUID: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          phoneNumber: phoneNumber,
          authProvider: mongoUser?.authProvider || "email",
        });
        
        // Clean up session storage
        window.sessionStorage.removeItem("phoneConfirmationResult");
        
        // Refresh user state
        await syncUserWithMongoDB(user);
        
        return true;
      }
    } catch (error) {
      console.error("Error updating phone:", error);
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
        updateProfile,
        updatePassword,
        updatePhone
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}