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
    typography: {
        padding: theme.spacing(2),
      },
      fieldsContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingRight: "16px",
        flexWrap: "wrap",
      },
      backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        position: 'absolute',
      },
      avatar: {
        backgroundColor: theme.palette.primary,
      },
      formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
      },
      selectEmpty: {
        marginTop: theme.spacing(2),
      },
  }));

const CalendarComponent = () => {
    const { eventsSources } = useCalendar('sistemaEscolar/infoEscola/calendarioGeral');

    const classes = useStyles();

    const initialView = localStorage.getItem('view') || 'dayGridMonth';

    const {enqueueSnackbar, closeSnackbar} = useSnackbar()

    const [sourceSelected, setSourceSelected] = useState({id: ''});
    const [view, setView] = useState(initialView);
    const [eventId, setEventId] = useState('');
    const [repeat, setRepeat] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElCal, setAnchorElCal] = useState(null);
    const [anchorElEventInfo, setAnchorElEventInfo] = useState(null);
    const [days, setDays] = useState([])
    const [loaderPop, setLoaderPop] = useState(false)
    const [recurrenceEnd, setRecurrenceEnd] = useState(false)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:59');
    const [allDay, setAllDay] = useState(true);
    const [title, setTitle] = useState('');
    const [endRecur, setEndRecur] = useState('');
    const [event, setEvent] = useState(false);
    

    const open = Boolean(anchorEl);
    const openPop = Boolean(anchorElCal);
    const id = openPop ? 'simple-popover' : undefined;

    

    useEffect(() => {
        handleRandomKey();
    }, [])

    useEffect(() => {
        handleFormChange('')
        console.log(sourceSelected)
    }, [startDate, endDate, startTime, endTime, title, days, endRecur, allDay, recurrenceEnd, sourceSelected])

    const handleRandomKey = async () => {
        const key = await getRandomKey();
        setEventId(key)
        console.log(key)
    }
    

    const handleFormChange = (e) => {
        console.log(sourceSelected)
        const API = getApi()
        try {
            const event = API.getEventById(eventId)
            console.log(event)
            event.remove()
        } catch (error) {
            console.log(error)
        }

        let start = allDay ? startDate : (startDate + 'T' + startTime)
        let end = allDay ? endDate : (endDate + 'T' + endTime)
        console.log(
            {
                id: eventId,
                title: title,
                start: start,
                end: end,
                daysOfWeek: days,
                startRecur: repeat && startDate,
                endRecur: repeat && (endRecur !== '' ? endRecur + 'T23:59' : endRecur),
            }
        )
        let event = {
            id: eventId,
            title: title,
            start: start,
            end: end,
        }

        if (repeat) {
            event.daysOfWeek = days
            event.startRecur = startDate
            event.endRecur = endRecur !== '' ? endRecur + 'T23:59' : endRecur
        }
        API.addEvent(event)

        recurrenceEnd && setEndRecur('')
    }

    const handleDateClick = (e) => {
        console.log(e)
        setStartDate(e.dateStr)
        setEndDate(e.dateStr)
        setStartTime('00:00')
        setEndTime('23:59')
        setDays([])
        setAnchorElCal(e.dayEl)

    }

    const handleEventClick = (e) => {
        console.log(e)
        setEvent(e.event)
        setAnchorElEventInfo(e.el)
        console.log(e.event)
        const API = getApi()
        let eventTaken = API.getEventById(e.event.id)
        console.log(eventTaken)
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

    const handleClosePop = () => {
        setAnchorElCal(null);
        const API = getApi()
        try {
            const event = API.getEventById(eventId)
            event.remove()
        } catch (error) {
            console.log(error)
        }
    };

    const handleChangeView = (view) => {
        const API = getApi()
        console.log(API)
        API && API.changeView(view)
        setView(view)
    }

    

    const handleAllDay = (e) => {
        setAllDay(e.target.checked)
        if (e.target.checked) {
            setStartTime('00:00')
            setEndTime('23:59')
        }
        

    }

    const handleDays = (e) => {
        let weekDays = days;
        const value = e.target.value
        const checked = e.target.checked
        if (checked) {
            weekDays.indexOf(value) === -1 && weekDays.push(value)
        } else {
            weekDays.splice(weekDays.indexOf(value), 1)
        }
        console.log(weekDays)
        setDays(weekDays)
        handleFormChange('')
    }

    const handleEventSave = async (e) => {
        e.preventDefault()
        setLoaderPop(true)
        let sources = eventsSources;
        let chosenSource = sourceSelected;
        const API = getApi()
        try {
            const event = API.getEventById(eventId)
            console.log(event)
            event.remove()
        } catch (error) {
            console.log(error)
        }

        let start = allDay ? startDate : (startDate + 'T' + startTime)
        let end = allDay ? endDate : (endDate + 'T' + endTime)
        console.log(
            {
                id: eventId,
                title: title,
                start: start,
                end: end,
                daysOfWeek: days,
                startRecur: repeat && startDate,
                endRecur: repeat && (endRecur !== '' ? endRecur + 'T23:59' : endRecur),
            }
        )
        let event = {
            id: eventId,
            title: title,
            start: start,
            end: end,
        }

        if (repeat) {
            event.daysOfWeek = days
            event.startRecur = start
            event.endRecur = endRecur !== '' ? endRecur + 'T23:59' : endRecur
        }
        

        recurrenceEnd && setEndRecur('')
        console.log(chosenSource)
        chosenSource.events.push(event)
        sources = sources.filter((source) => chosenSource.id !== source.id)
        sources.push(chosenSource)

        try {
            await calendarRef.set(sources)
            enqueueSnackbar('Evento adicionado!', {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        } catch (error) {
            enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        }
        setLoaderPop(false)
        setAnchorElCal(null)
    }

    const handleOpenNewCalendarDialog = () => {

    }

    

    const handleCloseEventInfo = () => {
        setAnchorElEventInfo(null);
        
    };

    return (
        <Fragment>
            <Dialog>
                <DialogTitle>Criar novo calendário</DialogTitle>
            </Dialog>
            <Title>Calendário da escola</Title>

            {/* Popover to see an event */}
          
            <SeeEventPopover 
                anchorElEventInfo={anchorElEventInfo} 
                handleClose={handleCloseEventInfo}
                event={event}
                eventSourceId={sourceSelected.id}
            />
           
            {/* Popover for creating events */}
            <Popover
                id={id}
                open={openPop}
                anchorEl={anchorElCal}
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
                
        
                <Backdrop className={classes.backdrop} open={loaderPop}>
                    <CircularProgress color="inherit" />
                </Backdrop>
        
    
                <DialogTitle>
                <Grid 
                    justifyContent="flex-start"
                    direction="row"
                    container
                    spacing={1}
                >
                    <Grid item>
                        <Avatar className={classes.avatar}>
                            <Event />
                        </Avatar>
                    </Grid>

                    <Grid item>
                        <Typography variant="h5" component="h2">
                            Adicionar evento
                        </Typography>
                        
                        
                    </Grid>
                </Grid>
                </DialogTitle>
                <form id="eventAdd" autoComplete="off" onSubmit={handleEventSave}>
                <DialogContent>
                <IconButton onClick={handleOpenNewCalendarDialog}><Add /></IconButton>Novo calendário
                    <Box m={1}>
                        
                        <InputLabel>Calendário</InputLabel>
                        <Select
                            fullWidth
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            
                            value={sourceSelected.id}
                            onChange={(e) => setSourceSelected(eventsSources.filter((source) => source.id === e.target.value)[0])}
                            label="Calendário"
                            required
                        >
                            <MenuItem disabled>Calendário</MenuItem>
                          {eventsSources.map((source, i) => (
                              <MenuItem key={source.id} id={source.id} value={source.id}>{source.id}</MenuItem>
                          ))}  
                        
                        </Select>
                    
                    </Box>
                    <Box m={1}>
                        <TextField 
                            label="Título"
                            type="text"
                            id="title"
                            value={title}
                            required
                            onChange={(e) => {
                                setTitle(e.target.value)
                                
                            }}
                            fullWidth
                        />
                    </Box>
                    
                    <Box m={1} className={classes.fieldsContainer}>
                        <TextField 
                            name="time" 
                            style={{minWidth: '100px',}}  
                            InputLabelProps={{shrink: true,}}  
                            id="initTime" 
                            required 
                            autoComplete="off"  
                            type="date" 
                            format="dd/MM/yyyy" 
                            label="Início"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        
                        <TextField
                            id="initTime"
                            type="time"
                            label="Hr. Início"
                            style={{minWidth: '100px',}} 
                            value={startTime}
                            // helperText="Horário de início"
                            disabled={allDay}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                        
                    </Box>

                    <Box m={1} className={classes.fieldsContainer}>
                    <TextField 
                            name="time" 
                            style={{minWidth: '100px',}}  
                            InputLabelProps={{shrink: true,}}  
                            id="endTime" 
                            required 
                            autoComplete="off"  
                            type="date" 
                            format="dd/MM/yyyy"
                            
                            label="Término"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <TextField
                            id="initTime"
                            type="time"
                            label="Hr. Fim"
                            style={{minWidth: '100px',}}
                            disabled={allDay}
                            // helperText="Horário de término"
                            value={endTime}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </Box>
                    <Box m={1} className={classes.fieldsContainer}>
                        <FormControlLabel
                            control={
                            <Checkbox
                                checked={allDay}
                                onChange={handleAllDay}
                                name="allDay"
                                color="primary"
                                id='allDay'
                            />
                            }
                            label="Dia inteiro"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    // checked={state.checkedB}
                                    onChange={(e) => setRepeat(e.target.checked)}
                                    checked={repeat}
                                    name="repeat"
                                    color="primary"
                                    id='repeat'
                                />
                            }
                            label="Repete"
                        />
                    </Box>
                    {repeat && (<>
                        <FormControl component="fieldset" className={classes.formControl}>
                        <FormLabel component="legend">Dias da semena</FormLabel>
                        
                        <FormHelperText>Escolha os dias da semana para a repetição</FormHelperText>
                    </FormControl>
                        <Box m={1} className={classes.fieldsContainer}>
                            
                            <FormControlLabel
                                    control={<Checkbox onChange={handleDays} value={0} name="gilad" />}
                                    label="D"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    control={<Checkbox onChange={handleDays} value={1} name="jason" />}
                                    label="S"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    control={<Checkbox onChange={handleDays} value={2} name="antoine" />}
                                    label="T"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    control={<Checkbox onChange={handleDays} value={3} name="antoine" />}
                                    label="Q"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    control={<Checkbox onChange={handleDays} value={4} name="antoine" />}
                                    label="Q"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    control={<Checkbox onChange={handleDays} value={5} name="antoine" />}
                                    label="S"
                                    labelPlacement="bottom"
                                />
                                <FormControlLabel
                                    control={<Checkbox onChange={handleDays} value={6} name="antoine" />}
                                    label="S"
                                    labelPlacement="bottom"
                                />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                name="date" 
                                style={{minWidth: '100px',}}  
                                InputLabelProps={{shrink: true,}}  
                                id="endRecur" 
                                required 
                                autoComplete="off"
                                type="date" 
                                format="dd/MM/yyyy" 
                                label="Termina em"
                                disabled={recurrenceEnd}
                                value={endRecur}
                                onChange={(e) => setEndRecur(e.target.value)}
                            />
                            
                        </Box>
                        <Box m={1}>
                            <FormControlLabel
                                control={<Checkbox checked={recurrenceEnd} onChange={(e) => setRecurrenceEnd(e.target.checked)} name="antoine" />}
                                label="Nunca termina"
                                
                            />
                        </Box>
                    
                        </>)}
                    
                    
                    
                    

                </DialogContent>
                <DialogActions>
                    <Button size='small' type='submit'>Salvar</Button>
                    <Button size='small' onClick={handleClosePop}>Fechar</Button>
                </DialogActions>
                </form>
                

            </Popover>
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
                <Tooltip title={'Novo evento'}>
                    <IconButton variant='outlined' edge="end" color="inherit" onClick={(e) => setAnchorElCal(e.currentTarget)}><Add /></IconButton>
                </Tooltip>
                    
                    
                    
                    
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
                    eventSources={eventsSources}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    // selectable
                    // select={handleSelection}
                    viewDidMount={handleViewChange}
                    editable={true}
                    
                    
                />
            </div>
            
        </Fragment>
    );
}
 
export default CalendarComponent;