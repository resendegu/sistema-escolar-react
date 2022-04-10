import { createContext, Fragment, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { auth, onMessageListener } from './services/firebase';
import Notifications from './shared/Notifications';
import ReactNotificationComponent from './shared/ReactNotifications';
import { useSnackbar } from 'notistack';

import './App.css';

import Secretaria from './secretaria/Secretaria'
import Navbar from './navbar/Navbar';
import { AuthContextProvider } from './contexts/AuthContext'
import Home from './home/Home';
import { Button } from '@material-ui/core';
import { notificationsRef } from './services/databaseRefs';

import { ConfirmationServiceProvider } from './contexts/ConfirmContext';
import Professores from './professores/Professores';
import Administration from './adm/Administration';

export const AuthContext = createContext({});

function App() {
  const [ show, setShow ] = useState(false);
  const [ notification, setNotification ] = useState({ title: "", body: "" });

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (show) {
      enqueueSnackbar(notification.body, {title: notification.title, variant: 'info', anchorOrigin: {horizontal: 'right', vertical: 'bottom'}})
      
    }
    
  }, [notification])

  onMessageListener()
    .then((payload) => {
      setShow(true);
      setNotification({
        title: payload.notification.title,
        body: payload.notification.body,
      });
      let storedNotifications = JSON.parse(localStorage.getItem('notifications'))
      if (storedNotifications) {
        storedNotifications.push({
          title: payload.notification.title,
          body: payload.notification.body,
        })
      } else {
        storedNotifications = [{
          title: payload.notification.title,
          body: payload.notification.body,
        }]
      }
      localStorage.setItem('notifications', JSON.stringify(storedNotifications))
      console.log(payload);
    })
    .catch((err) => console.log("failed: ", err));

  return (
    <Fragment>
      <Notifications />
      <Router>
        <ConfirmationServiceProvider>
          <AuthContextProvider>
            <Navbar />
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/secretaria" component={Secretaria} />
              <Route path="/professores" component={Professores} />
              <Route path="/adm" component={Administration}/>
            </Switch>
            
          </AuthContextProvider>
        </ConfirmationServiceProvider>
    </Router>
    </Fragment>
    
  );
}

export default App;
