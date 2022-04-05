import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';


export function useAuth() {
    const value = useContext(AuthContext);

    useEffect(() => {}, [value])
    return value;
}