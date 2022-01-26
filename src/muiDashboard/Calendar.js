import FullCalendar from '@fullcalendar/react';
import { Fragment, useEffect, useRef } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import brLocale from '@fullcalendar/core/locales/pt-br';
import interactionPlugin from '@fullcalendar/interaction';
import Title from './Title';
import useCalendar from '../hooks/useCalendar'
import { Avatar, Backdrop, Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, IconButton, InputLabel, ListItemIcon, makeStyles, Menu, MenuItem, Popover, Radio, RadioGroup, Select, TextField, Tooltip, Typography } from '@material-ui/core';

import { ChevronRight, ChevronLeft, Today, ViewComfy, ViewList, ViewWeek, Assistant, Event, CalendarToday, Add, Close, Edit, Delete } from '@material-ui/icons';
import { useState } from 'react';
import { getRandomKey } from '../shared/FunctionsUse';
import { endOfTomorrow } from 'date-fns/esm';
import { calendarRef } from '../services/databaseRefs';
import { useSnackbar } from 'notistack';
import SeeEventPopover from '../shared/SeeEventPopover';
import FullScreenDialog from '../shared/FullscreenDialog';
import CreateEventPopover from '../shared/CreateEventPopover';
import CreateCalendar from '../shared/CreateCalendar';
import useStyles from '../hooks/useStyles';



const CalendarComponent = () => {
    

    const classes = useStyles();

    const initialView = localStorage.getItem('view') || 'dayGridMonth';

    const {enqueueSnackbar, closeSnackbar} = useSnackbar()

    const [eventsSources, setEventsSources] = useState([]);
    const [sourceSelected, setSourceSelected] = useState({id: ''});
    const [view, setView] = useState(initialView);
    const [eventId, setEventId] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElCreate, setAnchorElCreate] = useState(null);
    const [anchorElCal, setAnchorElCal] = useState(null);
    const [anchorElEventInfo, setAnchorElEventInfo] = useState(null);
    const [e, setE] = useState();
    const [openNewCalendar, setOpenNewCalendar] = useState(false);
    
    
    
    const [event, setEvent] = useState(false);
    const [api, setApi] = useState();
   
    useEffect(() => {
        calendarRef.on('value', (snapshot) => {
            const sources = snapshot.val()
            console.log(sources)
    
            if (sources && sources.hasOwnProperty('length')) {
                setEventsSources(sources)
            } else {
                sources !== null && setEventsSources([sources])
            }
        }, (error) => {
            enqueueSnackbar(error.message, {title: 'Error', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        })
        
        return () => {
            calendarRef.off('value');
        }
    }, [])
    

    const open = Boolean(anchorEl);
    const openCreate = Boolean(anchorElCreate);
    
    const calendarEl = useRef();
    
    
    const handleLoadedEvents = (e) => {
        console.log(e)
    } 

    

    const handleDateClick = (e) => {
        console.log(e)
        setE(e)
        setAnchorElCal(e.dayEl)
    }

    const handleEventClick = (e) => {
        console.log(e)
        setEvent(e.event)
        setAnchorElEventInfo(e.el)
        console.log(e.event)
        const API = getApi()
        setApi(API)
    }

    // const handleSelection = (e) => {
    //     console.log(e)
        
    //     setStartDate(e.startStr)
    //     setEndDate(e.endStr)
    //     setStartTime('00:00')
    //     setEndTime('23:59')
    //     setAnchorElCal(e.jsEvent.target)
        
    // }

    const handleViewChange = (e) => {
        console.log(e.view.type)
        localStorage.setItem('view', e.view.type)
    }

    

    

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

    const handleCloseCreate = () => {
        setAnchorElCreate(null);
    };
    

    const handleChangeView = (view) => {
        const API = getApi()
        console.log(API)
        API && API.changeView(view)
        setView(view)
    }

    
    const handleClosePop = () => {
        setAnchorElCal(null);
        
    };

    const handleCloseEventInfo = () => {
        setAnchorElEventInfo(null);
        
    };

    const handleOpenNewCalendarDialog = () => {
        setOpenNewCalendar(true)
    }

    return (
        <Fragment>
            
            {/* <Dialog
                open={openNewCalendar}
                fullScreen
            >
                <DialogTitle>Criar novo calendário</DialogTitle>
            </Dialog>
            <Title>Calendário da escola</Title> */}

            <CreateCalendar 
                open={openNewCalendar}
                handleClose={() => setOpenNewCalendar(false)}
            />

            {/* Popover to see an event */}
          
            {anchorElEventInfo && 
            <SeeEventPopover 
                anchorElEventInfo={anchorElEventInfo} 
                handleClose={handleCloseEventInfo}
                event={event}
                eventSourceId={sourceSelected.id}
                api={api}
            />}
           
            {/* Popover for creating events */}

            {anchorElCal && 
            <CreateEventPopover 
                anchorElEventCreate={anchorElCal}
                handleClose={handleClosePop}
                api={api}
                setSourceSelected={setSourceSelected}
                sourceSelected={sourceSelected}
                eventId={eventId}
                setEventId={setEventId}
                e={e}
                calendarEl={calendarEl}
                eventsSources={eventsSources}
                handleOpenNewCalendarDialog={handleOpenNewCalendarDialog}
            />}
            
            <Grid
                justifyContent='space-between'
                container 
                spacing={24}
                alignItems="center"
            >
                <Grid item>
                <Tooltip title={'Mês anterior'}>
                    <IconButton variant='outlined' edge="end" color="inherit" onClick={handlePreviousMonth}><ChevronLeft /></IconButton>
                </Tooltip>
                <Tooltip title={'Próximo mês'}>
                    <IconButton variant='outlined' edge="end" color="inherit" onClick={handleNextMonth}><ChevronRight /></IconButton>
                </Tooltip>
                <Tooltip title={'Hoje'}>
                    <IconButton variant='outlined' edge="end" color="inherit" onClick={handleToday}><Today /></IconButton>
                </Tooltip>
                <Tooltip title={'Criar'}>
                    <IconButton variant='outlined' edge="end" color="inherit" onClick={(e) => setAnchorElCreate(e.currentTarget)}><Add /></IconButton>
                </Tooltip>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorElCreate}
                    anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                    }}
                    open={openCreate}
                    onClose={handleCloseCreate}
                    title='Visualização'
                >
                        <MenuItem onClick={(e) => setAnchorElCal(e.currentTarget)}><ListItemIcon><Event fontSize='small' /></ListItemIcon>Novo evento</MenuItem>
                        <MenuItem onClick={() => handleOpenNewCalendarDialog()}><ListItemIcon><CalendarToday fontSize='small' /></ListItemIcon>Criar calendário</MenuItem>
                        
                    </Menu>
                    
                    
                    
                    
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
                        title='Visualização'
                    >
                        <MenuItem onClick={() => handleChangeView('dayGridMonth')}><ListItemIcon><ViewComfy fontSize='small' /></ListItemIcon>Mês</MenuItem>
                        <MenuItem onClick={() => handleChangeView('timeGridWeek')}><ListItemIcon><ViewWeek fontSize='small' /></ListItemIcon>Semana</MenuItem>
                        <MenuItem onClick={() => handleChangeView('listWeek')}><ListItemIcon><ViewList fontSize='small' /></ListItemIcon>Lista semanal</MenuItem>
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
                    eventSources={eventsSources}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    // selectable
                    // select={handleSelection}
                    viewDidMount={handleViewChange}
                    
                    eventsSet={handleLoadedEvents}
                    editable={false}
                    
                />
            </div>
            
        </Fragment>
    );
}
 
export default CalendarComponent;