import { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ResponsiveDrawer from './components/Drawer';
import { Grid } from '@material-ui/core';
import { useAuth } from '../hooks/useAuth';
import LoginDialog from '../login/LoginDialog';
import SignUpDialog from '../login/SignUpDialog';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 30,
    
  },
  appBarToolbar: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    [theme.breakpoints.up("lg")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    marginTop: '7px',
  },
  list: {
    width: 250,
  },
  fullList: {
    width: '100%',
  },
}));

export default function Navbar(props) {
  const classes = useStyles();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [ showSignInDialog, setShowSignInDialog ] = useState(false);
  const [ showSignUpDialog, setShowSignUpDialog ] = useState(false);
  
  const open = Boolean(anchorEl)

  const openMobileDrawer = useCallback(() => {
    setIsMobileOpen(true);
  }, [setIsMobileOpen]);

  const closeMobileDrawer = useCallback(() => {
    setIsMobileOpen(false);
  }, [setIsMobileOpen]);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, [setDrawerOpen]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, [setDrawerOpen]);


  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignIn = () => {
    setShowSignInDialog(true);
    handleClose();
  }

  const handleSignUp = () => {
    setShowSignUpDialog(true);
    handleClose();
  }

  const handleSignOut = () => {
    signOut();
    handleClose();

  }

  const onClose = () => {
    setShowSignUpDialog(false);
    setShowSignInDialog(false);
    console.log('closed')
  }

  return (
    <div className={classes.root}>
      {showSignInDialog ? (
        <LoginDialog onClose={onClose} />
      ) : null}

      {showSignUpDialog ? (
          <SignUpDialog onClose={onClose} />
      ) : null}
      <AppBar position="static">
        <Toolbar>
          <Grid
            justify="space-between" // Add it here :)
            container 
            spacing={24}
            
          >
            <Grid item>
              <IconButton edge="start" className={classes.menuButton} onClick={openDrawer} color="inherit" aria-label="menu">
                <MenuIcon />
              </IconButton>
              
            </Grid>
           
            <Grid item>
              <Typography variant="h6" className={classes.title}>
                Sistema Escolar
              </Typography>
            </Grid>

            <Grid item>
              {user ? (
                <>
                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                    edge="end"
                    
                  >
                    {user.avatar? (<img src={user.avatar} style={{width: "24px", borderRadius: '50%',}} alt=""/>) : <AccountCircle />}
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleSignOut}>Sair</MenuItem>
                  </Menu>
                </>
              ) : (
              <>
              <>
                  <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                    edge="end"
                    
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleSignUp}>Criar conta</MenuItem>
                    <MenuItem onClick={handleSignIn}>Login</MenuItem>
                  </Menu>
                </>
              </>
              )}
            </Grid>

          </Grid>
          
        </Toolbar>
        <ResponsiveDrawer open={isDrawerOpen} onClose={closeDrawer}/>
      </AppBar>
    </div>
  );
}


