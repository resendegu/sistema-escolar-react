import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu'
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { 
    AccountCircle, 
    Home, 
    ImportContacts,
    AllInbox,
    Apartment,
    School,
} from '@material-ui/icons'
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { Box, SwipeableDrawer } from '@material-ui/core';
import SimpleContainer from '../../Container';
import { useAuth } from '../../hooks/useAuth';
import { usersListRef } from '../../services/databaseRefs';


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    position: 'relative',
    padding: theme.spacing(3),
  },
  fullList: {
    width: 'auto',
  },
}));

function ResponsiveDrawer(props) {
  const { window, open, onClose } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useAuth();
  const [ areas, setAreas ] = useState([]);


  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    console.log(user)
    if (user && user !== 'Searching user...') {
      usersListRef.child(user.id).once('value').then((snapshot) => {
        try {
          let userAccess = snapshot.val().acessos
          let localAreas = []
          
          userAccess.professores === true && localAreas.push({text: 'Professores', to: 'professores', icon: 1})

          if (userAccess.master === true) {
            localAreas.push({text: 'Administração', to: 'adm', icon: 2})
            localAreas.push({text: 'Secretaria', to: 'secretaria', icon: 0})
          } else {
            userAccess.adm === true && localAreas.push({text: 'Administração', to: 'adm', icon: 2})
            userAccess.secretaria === true && localAreas.push({text: 'Secretaria', to: 'secretaria', icon: 0})
            userAccess.aluno === true && localAreas.push({text: 'Estudante', to: 'estudante', icon: 3})
          }
          setAreas([...localAreas])
        } catch (error) {
          console.log(error)
        }
        
      })
    } else {

    }
  }, [user])

  const firstIcons = [<AllInbox/>, <ImportContacts/>, <Apartment/>, <School />];
  const drawer = (
    <div>
        <div className={classes.toolbar}>
            <IconButton
                onClick={onClose}
                color="primary"
                aria-label="Close Sidedrawer"
            >
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
            <Link to="/" style={{textDecoration: 'none', color: 'black'}} onClick={onClose}>
                <ListItem button key={'Home'}>
                    <ListItemIcon><Home /></ListItemIcon>
                    <ListItemText primary={'Home'} />
                </ListItem>
            </Link>
            
        </List>
        <Divider />
        <List>
            {areas.map((elem, index) => (
                <Link to={'/' + elem.to} style={{textDecoration: 'none', color: 'black'}} onClick={onClose}>
                    <ListItem button key={elem.text}>
                        <ListItemIcon>{firstIcons[elem.icon]}</ListItemIcon>
                        <ListItemText primary={elem.text} />
                    </ListItem>
                </Link>
            
            ))}
        </List>
        {/* <Divider />
        <List>
            {['All mail', 'Trash', 'Spam'].map((text, index) => (
            <ListItem button key={text}>
                <ListItemIcon></ListItemIcon>
                <ListItemText primary={text} />
            </ListItem>
            ))}
        </List> */}
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      {/* <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Responsive drawer
          </Typography>
          {auth && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
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
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar> */}
      <nav className={classes.drawer} aria-label="menu">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <SwipeableDrawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </SwipeableDrawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <SwipeableDrawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="temporary"
            open={open}
            onClose={onClose}
            disableSwipeToOpen={false}
          >
            {drawer}
          </SwipeableDrawer>
        </Hidden>
      </nav>
      
    </div>
  );
}


export default ResponsiveDrawer;

