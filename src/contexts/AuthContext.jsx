import { useState } from "react";
import { useEffect } from "react";
import { createContext } from "react";
import { auth } from "../services/firebase";



  
export const AuthContext = createContext({});

export function AuthContextProvider(props) {
    const [user, setUser] = useState('Searching user...');
    

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        
      if (user) {
        const {displayName, photoURL, uid, email, emailVerified} = user;

        if (!displayName || !photoURL) {
          console.log(user)
        }
        console.log(user)

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
          email: email,
          emailVerified: emailVerified,
        })
      } else {
        setUser(undefined)
      }
    })

    return () => {
      unsubscribe();
    }
  }, [])

  

  async function signInWithEmailAndPassword(email, password) {
    const result = await auth.signInWithEmailAndPassword(email, password)

    if (result.user) {
      const {displayName, photoURL, uid, email, emailVerified} = result.user;

      if (!displayName || !photoURL) {
        console.log('Missing account info!')
      }

      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL,
        email: email,
        emailVerified: emailVerified,
      })
      return result.user;
    } 
    
  }

  async function signOut() {
    await auth.signOut();
    setUser(undefined);
    window.location.href = '/'
    return ;
    
  }

  async function passwordRecover(email) {
    await auth.sendPasswordResetEmail(email);
    return ;
      
  }

  async function createUserWithEmailAndPassword(email, password, name) {
    let userCredential = await auth.createUserWithEmailAndPassword(email, password);
    let user = userCredential.user
    user.updateProfile({
      displayName: name,
    })
    return userCredential;
  }

  async function updatePhoto(photo) {
    const localUser = auth.currentUser
    await localUser.updateProfile({photoURL: photo})
    return;
  }

  async function updateName(name) {
    const localUser = auth.currentUser
    await localUser.updateProfile({displayName: name})
    return;
  }

  async function sendEmailVerification() {
    try {
      await auth.currentUser.sendEmailVerification()
      return;
    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
    
  }

    return (
        <>
            
            <AuthContext.Provider value={{ 
              user,
              signInWithEmailAndPassword, 
              signOut, 
              passwordRecover,
              createUserWithEmailAndPassword,
              updatePhoto,
              updateName,
              sendEmailVerification
              }}>
                {props.children}
            </AuthContext.Provider>
        </>
    );
}
