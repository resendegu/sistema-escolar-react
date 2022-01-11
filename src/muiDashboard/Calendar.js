import FullCalendar from '@fullcalendar/react';
import { Fragment, useRef } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import brLocale from '@fullcalendar/core/locales/pt-br';
import interactionPlugin from '@fullcalendar/interaction';
import Title from './Title';
import useCalendar from '../hooks/useCalendar'
import { Box, Button, Grid, IconButton, ListItemIcon, makeStyles, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { useEffect } from 'preact/hooks';
import { ChevronRight, ChevronLeft, Today, ViewComfy, ViewList, ViewWeek } from '@material-ui/icons';
import { useState } from 'react';


const useStyles = makeStyles((theme) => ({
    div: {
        position: 'absolute',
        zIndex: 9,
        backgroundColor: '#f1f1f1',
        border: '1px solid #d3d3d3',
        textAlign: 'center',
    },

    header: {
        padding: '10px',
        cursor: 'move',
        zIndex: 10,
        backgroundColor: '#2196F3',
        color: '#fff',
    },
    navigationButtons: {
        justifyContent: 'space-around',
        width: '100%',
    },
  }));

const CalendarComponent = () => {
    const { events } = useCalendar('sistemaEscolar/infoEscola/calendarioGeral');

    const classes = useStyles();

    const initialView = localStorage.getItem('view') || 'dayGridMonth';

    const [view, setView] = useState(initialView);
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl)

    const handleDateClick = (e) => {
        console.log(e)
    }

    const handleEventClick = (e) => {
        console.log(e)
    }

    const handleSelection = (e) => {
        console.log(e)
    }

    const handleViewChange = (e) => {
        console.log(e.view.type)
        localStorage.setItem('view', e.view.type)
    }

    

    const calendarEl = useRef()

    const getApi = () => {
    const { current: calendarDom } = calendarEl;
        console.log(calendarEl.current)

        return calendarDom ? calendarDom.getApi() : null;
    }

    const handleNextMonth = () => {
        const API = getApi()
        console.log(API)
        API && API.next()
    }

    const handlePreviousMonth = () => {
        const API = getApi()
        console.log(API)
        API && API.prev()
    }

    const handleToday = () => {
        const API = getApi()
        console.log(API)
        API && API.today()
    }


    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeView = (view) => {
        const API = getApi()
        console.log(API)
        API && API.changeView(view)
        setView(view)
    }

    return (
        <Fragment>
            {/* <div className={classes.div} id="popup">
                <div className={classes.header} id="popupheader">Click here to move</div>
                <p>Move</p>
                <p>this</p>
                <p>DIV</p>
            </div> */}
            <Title>Calendário da escola</Title>
            <Grid
                justifyContent='space-between'
                container 
                spacing={24}
                alignItems="center"
            >
                <Grid item>
                    <Button variant='outlined' onClick={handlePreviousMonth}><ChevronLeft /></Button>
                    <Button variant='outlined' onClick={handleNextMonth}><ChevronRight /></Button>
                    <Button variant='outlined' onClick={handleToday}><Today /></Button>
                </Grid>
                <Grid item>
                    <Tooltip 
                        title={'Tipo de visualização'}
                    >
                        <IconButton
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                            edge="end"
                            
                            //style={{maxWidth: '34px'}}
                        >
                            {view === 'dayGridMonth' && <ViewComfy />}
                            {view === 'timeGridWeek' && <ViewWeek />}
                            {view === 'listWeek' && <ViewList />}
                        </IconButton>
                    </Tooltip>
                    
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
                        <MenuItem onClick={() => handleChangeView('dayGridMonth')}><ListItemIcon><ViewComfy fontSize='small' /></ListItemIcon>Mês</MenuItem>
                        <MenuItem onClick={() => handleChangeView('timeGridWeek')}><ListItemIcon><ViewWeek fontSize='small' /></ListItemIcon>Semana</MenuItem>
                        <MenuItem onClick={() => handleChangeView('listWeek')}><ListItemIcon><ViewList fontSize='small' /></ListItemIcon>Lista</MenuItem>
                    </Menu>
                </Grid>
            </Grid>
            {/* <div className={classes.navigationButtons}>
                <Button variant='outlined' onClick={handlePreviousMonth}><ChevronLeft /></Button>
                <Button variant='outlined' onClick={handleNextMonth}><ChevronRight /></Button>
                
            </div> */}
            <div style={{width: '100%'}}>
                <FullCalendar
                    ref={calendarEl}
                    aspectRatio={2} 
                    plugins={[ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin ]}
                    initialView={initialView}
                    headerToolbar={{
                        left: '',
                        center: 'title',
                        right: '',

                    }}
                    
                    locale={brLocale}
                    eventSources={events}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    selectable
                    select={handleSelection}
                    viewDidMount={handleViewChange}
                    editable={true}
                    
                />
            </div>
            
        </Fragment>
    );
}
 
export default CalendarComponent;