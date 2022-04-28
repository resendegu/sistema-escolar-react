import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import '../../App.css';

import Typography from '@material-ui/core/Typography';

import Box from '@material-ui/core/Box';
import { AddBox, AssignmentInd, Build, Email, GroupWork, Home, PeopleAlt, PersonAdd } from '@material-ui/icons';
import AddStudent from './addStudent/AddStudent';
import SchoolSettings from './schoolSettings/SchoolSettings';
import Students from './students/Students';
import AddClass from './addClass/AddClass';
import Classes from './classes/Classes';
import Dashboard from '../../muiDashboard/Dashboard';
import PreEnrollments from './preMatriculas/PreEnrollments';

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

export default function SecretariaTabs() {
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
          <Tab label="Alunos" icon={<PeopleAlt />} {...a11yProps(1)} />
          <Tab label="Turmas" icon={<GroupWork />} {...a11yProps(2)} />
          <Tab label="Novo Aluno" icon={<PersonAdd />} {...a11yProps(3)} />
          <Tab label="Nova Turma" icon={<AddBox />} {...a11yProps(4)} />
          <Tab label="Pré-Matrículas" icon={<AssignmentInd />} {...a11yProps(5)} />
          <Tab label="Conf. da Escola" icon={<Build />} {...a11yProps(6)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Dashboard />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Students />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Classes />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <AddStudent />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <AddClass />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <PreEnrollments changeTab={handleChange}/>
      </TabPanel>
      <TabPanel value={value} index={6}>
        <SchoolSettings />
      </TabPanel>
    </div>
  );
}
