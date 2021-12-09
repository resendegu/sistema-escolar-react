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
        const {displayName, photoURL, uid} = user;

        if (!displayName || !photoURL) {
          console.log(user)
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL
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
      const {displayName, photoURL, uid} = result.user;

      if (!displayName || !photoURL) {
        console.log('Missing account info!')
      }

      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL
      })
      return result.user;
    } 
    
  }

  async function signOut() {
    await auth.signOut();
    setUser(undefined);
    window.open('/');
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



    return (
        <>
            
            <AuthContext.Provider value={{ 
              user, 
              signInWithEmailAndPassword, 
              signOut, 
              passwordRecover,
              createUserWithEmailAndPassword,
              }}>
                {props.children}
            </AuthContext.Provider>
        </>
    );
}
