import { createContext } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import ResponsiveDrawer from './navbar/components/Drawer';
import Secretaria from './secretaria/Secretaria'
import Navbar from './navbar/Navbar';
import { AuthContextProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth';
import LoginDialog from './login/LoginDialog';

export const AuthContext = createContext({});

function App() {

  
  return (
    <>
    <BrowserRouter>
      <AuthContextProvider>
        <Navbar />
        <Switch>
          <Route path="/secretaria" component={Secretaria} />
        </Switch>
        
      </AuthContextProvider>
    </BrowserRouter>
    
    
    </>  
    
  );
}

export default App;
