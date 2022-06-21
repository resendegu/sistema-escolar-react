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

import { ChevronRight, ChevronLeft, Today, ViewComfy, ViewList, ViewWeek, Assistant, Event, CalendarToday, Add, Close, Edit, Delete, ViewAgenda, Visibility } from '@material-ui/icons';
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



const CalendarComponent = ({sourceId, isFromClassCode=false,  handleFault}) => {
    

    const classes = useStyles();

    const initialView = localStorage.getItem('view') || 'dayGridMonth';

    const {enqueueSnackbar, closeSnackbar} = useSnackbar()

    const [eventsSources, setEventsSources] = useState([]);
    const [viewSources, setViewSources] = useState(eventsSources)
    const [sourceSelected, setSourceSelected] = useState({id: ''});
    const [view, setView] = useState(initialView);
    const [eventId, setEventId] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElCreate, setAnchorElCreate] = useState(null);
    const [anchorElCal, setAnchorElCal] = useState(null);
    const [anchorElPop, setAnchorElPop] = useState(null);
    const [anchorElEventInfo, setAnchorElEventInfo] = useState(null);
    const [anchorElRightClick, setAnchorElRightClick] = useState(null);
    const [e, setE] = useState();
    const [openNewCalendar, setOpenNewCalendar] = useState(false);
    const [holidays, setHolidays] = useState(true);

    

    
    const [event, setEvent] = useState(false);
    const [api, setApi] = useState();
   
    useEffect(() => {

        if (isFromClassCode) {
            calendarRef.orderByChild('id').equalTo(sourceId).on('value', (snapshot) => {
                const sources = snapshot.val()
                console.log(sources)
                if (snapshot.exists()) {
                    setEventsSources([...sources])
                } else {
                    setEventsSources([])
                }
                
                if (sources && sources.hasOwnProperty('length')) {
                    setViewSources(sources)
                } else {
                    for (const key in sources) {
                        if (Object.hasOwnProperty.call(sources, key)) {
                            const single = sources[key];
                            sources !== null && setViewSources([single])
                        }
                    }
                    
                }
            }, (error) => {
                enqueueSnackbar(error.message, {title: 'Error', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
            })
        } else if (!isFromClassCode && sourceId) {
            
            calendarRef.orderByChild('id').equalTo(sourceId).on('value', (snapshot) => {
                const sources = snapshot.val()
                console.log(sources)
                if (snapshot.exists()) {
                    setEventsSources([...sources])
                } else {
                    setEventsSources([])
                }
                
                if (sources && sources.hasOwnProperty('length')) {
                    setViewSources(sources)
                } else {
                    for (const key in sources) {
                        if (Object.hasOwnProperty.call(sources, key)) {
                            const single = sources[key];
                            sources !== null && setViewSources([single])
                        }
                    }
                    
                }
            }, (error) => {
                enqueueSnackbar(error.message, {title: 'Error', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
            })
        } else {
            calendarRef.on('value', (snapshot) => {
                const sources = snapshot.val()
                console.log(sources)
                if (snapshot.exists()) {
                    setEventsSources([...sources])
                } else {
                    setEventsSources([])
                }
                if (sources && sources.hasOwnProperty('length')) {
                    setViewSources(sources)
                } else {
                    sources !== null && setViewSources([...sources])
                }
            }, (error) => {
                enqueueSnackbar(error.message, {title: 'Error', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
            })
        }
        
        
        return () => {
            calendarRef.off('value');
        }
    }, [sourceId])
    

    const open = Boolean(anchorEl);
    const openCreate = Boolean(anchorElCreate);
    const openPop = Boolean(anchorElPop);
    const openRightClick = Boolean(anchorElRightClick);

    const id = openPop ? 'simple-popover' : undefined;
    
    const calendarEl = useRef();

    const RightClickContent = () => {

        return (
        <>
            <Box m={2}>
                <Tooltip title={'Retroceder'}>
                    <IconButton variant='outlined' edge="end" color="inherit" onClick={handlePreviousYear}><ChevronLeft /></IconButton>
                </Tooltip>
            </Box>
        </>
        );
    }
    
    
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

    const handlePreviousMonth = (e) => {
        console.log(e)
        if (e.type === 'click') {
            const API = getApi()
            console.log(API)
            API && API.prev()
        } else {
            e.preventDefault()
            setAnchorElRightClick(e.currentTarget)
        }
        
    }

    const handlePreviousYear = (e) => {
        const API = getApi()
        console.log(API)
        API && API.prevYear()
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

    
    const handleCloseCal = () => {
        setAnchorElCal(null);
        
    };

    const handleClosePop = () => {
        setAnchorElPop(null);
    }

    const handleCloseEventInfo = () => {
        setAnchorElEventInfo(null);
        
    };

    const handleCloseRightClick = () => {
        setAnchorElRightClick(null);
    }

    const handleOpenNewCalendarDialog = () => {
        setOpenNewCalendar(true)
    }

    const handleShowSources = (id, show) => {
        const view = eventsSources.filter(source => source.id )
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

                    <Popover
                        id={id}
                        open={openRightClick}
                        anchorEl={anchorElRightClick}
                        onClose={handleCloseRightClick}
                        anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                        }}
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                        }}
                    >
                        <RightClickContent />
                        
                    </Popover>

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
                isFromClassCode={isFromClassCode}
                handleFault={handleFault}
            />}
           
            {/* Popover for creating events */}

            {anchorElCal && 
            <CreateEventPopover 
                anchorElEventCreate={anchorElCal}
                handleClose={handleCloseCal}
                api={api}
                setSourceSelected={setSourceSelected}
                sourceSelected={sourceSelected}
                eventId={eventId}
                setEventId={setEventId}
                e={e}
                calendarEl={calendarEl}
                eventsSources={eventsSources}
                handleOpenNewCalendarDialog={handleOpenNewCalendarDialog}
                isFromClassCode={isFromClassCode}
            />}
            
            <Grid
                justifyContent='space-between'
                container 
                spacing={24}
                alignItems="center"
            >
                <Grid item>
                <Tooltip title={'Anterior'}>
                    <IconButton variant='outlined' edge="end" color="inherit" onContextMenu={handlePreviousMonth} onClick={handlePreviousMonth} ><ChevronLeft /></IconButton>
                </Tooltip>
                <Tooltip title={'Próximo'}>
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
                        <MenuItem onClick={(e) => setAnchorElCal(e.currentTarget)} disabled={eventsSources.length === 0}><ListItemIcon><Event fontSize='small' /></ListItemIcon>Novo evento</MenuItem>
                        {!isFromClassCode && 
                            <MenuItem onClick={() => handleOpenNewCalendarDialog()}><ListItemIcon><CalendarToday fontSize='small' /></ListItemIcon>Criar calendário</MenuItem>
                        }
                        
                    </Menu>
                    
                    
                    
                    
                </Grid>
                <Grid item>
                    
                    {!isFromClassCode && 
                    <Tooltip title={'Calendários'}>
                        <IconButton variant='outlined' edge="end" color="inherit" onClick={(e) => setAnchorElPop(e.currentTarget)}><ViewAgenda /></IconButton>
                    </Tooltip>}
                    <Popover
                        id={id}
                        open={openPop}
                        anchorEl={anchorElPop}
                        onClose={handleClosePop}
                        anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                        }}
                        transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                        }}
                    >
                        <Box m={2}>
                        
                            <InputLabel id="label">Exibir calendários:</InputLabel>
                            {eventsSources && eventsSources.map((calendar, i) => (
                                <FormControlLabel
                                    control={<Checkbox checked={viewSources.indexOf(calendar) !== -1} onChange={(e) => handleShowSources(calendar.id, e.target.checked)} name={calendar.id} />}
                                    label={calendar.id}
                                />
                            ))}
                            
                            <Tooltip title={'Ver todos os calendários'}>
                                <IconButton variant='outlined' edge="end" color="inherit" ><Visibility /></IconButton>
                            </Tooltip>
                        </Box>
                        
                    </Popover>
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
                    eventSources={viewSources}
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