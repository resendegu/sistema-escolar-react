import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import '../../App.css';

import Typography from '@material-ui/core/Typography';

import Box from '@material-ui/core/Box';
import { AttachFile, AttachMoney, CallToAction, Gavel, Home, } from '@material-ui/icons';

import Contracts from './contracts/Contracts';

import Dashboard from '../../muiDashboard/Dashboard';
import Finances from './finances/Finances';
import WriteOffBillets from '../../shared/WriteOffBillets';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-force-tabpanel-${index}`}
      aria-labelledby={`scrollable-force-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function StudentTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="sticky" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="on"
          indicatorColor="standard"
          textColor="primary"
          aria-label="scrollable force tabs example"
        >
          <Tab label="Dashboard" icon={<Home />} {...a11yProps(0)} />
          <Tab label="Contratos" icon={<AttachFile />} {...a11yProps(1)} />
          <Tab label="Financeiro" icon={<AttachMoney />} {...a11yProps(2)} />
          <Tab label="Boletos" icon={<CallToAction />} {...a11yProps(3)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Dashboard />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Contracts />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Finances />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <WriteOffBillets />
      </TabPanel>
      </div>
  );
}
