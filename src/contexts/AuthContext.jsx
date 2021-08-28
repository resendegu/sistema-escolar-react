import { useState } from "react";
import { useEffect } from "react";
import { createContext, ReactNode } from "react";
import ResponsiveDialog from "../login/components/FormDialog";
import { firebase, auth } from "../services/firebase";

  
export const AuthContext = createContext({});

export function AuthContextProvider(props) {
    const [user, setUser] = useState();
    const [ open, setOpen ] = useState(false)

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
    await auth.signOut()
    setUser(undefined);
    return ;
    
  }

  async function passwordRecover(email) {
    await auth.sendPasswordResetEmail(email)
    return ;
      
  }



    return (
        <>
            
            <AuthContext.Provider value={{ user, signInWithEmailAndPassword, signOut, passwordRecover }}>
                {props.children}
            </AuthContext.Provider>
        </>
    );
}
