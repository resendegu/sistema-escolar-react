import { createContext } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';

import Secretaria from './secretaria/Secretaria'
import Navbar from './navbar/Navbar';
import { AuthContextProvider } from './contexts/AuthContext'
import Home from './home/Home';

export const AuthContext = createContext({});

function App() {

  
  return (
    <Router>
      <AuthContextProvider>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/secretaria" component={Secretaria} />
        </Switch>
        
      </AuthContextProvider>
    </Router>
  );
}

export default App;
