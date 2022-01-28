import { Avatar, Backdrop, Box, Button, Checkbox, CircularProgress, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, IconButton, InputLabel, makeStyles, MenuItem, Popover, Select, TextField, Typography } from "@material-ui/core";
import { Add, Event } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import useCalendar from "../hooks/useCalendar";
import useStyles from "../hooks/useStyles";
import { calendarRef } from "../services/databaseRefs";
import { getRandomKey } from "./FunctionsUse";



const CreateEventPopover = ({ 
    anchorElEventCreate, 
    handleClose, 
    eventsSources,
    sourceSelected, 
    setSourceSelected, 
    e, 
    eventId, 
    setEventId,
    calendarEl,
    handleOpenNewCalendarDialog,
    isFromClassCode 
}) => {

    

    console.log(eventsSources)

    const classes = useStyles();

    const {enqueueSnackbar, closeSnackbar} = useSnackbar()

    const [loaderPop, setLoaderPop] = useState(false)
    
    const [repeat, setRepeat] = useState(false)
    const [days, setDays] = useState([])
    const [recurrenceEnd, setRecurrenceEnd] = useState(false)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:59');
    const [allDay, setAllDay] = useState(true);
    const [title, setTitle] = useState('');
    const [endRecur, setEndRecur] = useState('');
    const [color, setColor] = useState('#0000FF');
    const [textColor, setTextColor] = useState('#000000');

    
    const openPop = Boolean(anchorElEventCreate);
    const id = openPop ? 'simple-popover' : undefined;

    useEffect(() => {
        handleRandomKey();
    }, [])

    useEffect(() => {
        if (e) {
            let dateStr
            let timeStr
            if (e.view.type === 'timeGridWeek') {
                setAllDay(false);
                dateStr = e.dateStr.split('T')[0] || null
                timeStr = e.dateStr.split('T')[1].split('-')[0] || null
            }
             
            setStartDate(e.view.type === 'timeGridWeek' ? dateStr : e.dateStr)
            setEndDate(e.view.type === 'timeGridWeek' ? dateStr : e.dateStr)
            setStartTime(e.view.type === 'timeGridWeek' ? timeStr : '00:00')
            setEndTime(e.view.type === 'timeGridWeek' ? timeStr : '23:59')
            setDays([])
        }
    }, [e])

    useEffect(() => {
        if (calendarEl)
            handleFormChange('')
        
        
        console.log(sourceSelected)
        
    }, [startDate, endDate, startTime, endTime, title, days, endRecur, allDay, recurrenceEnd, sourceSelected, color, textColor])

    const getApi = () => {
        const { current: calendarDom } = calendarEl;
        console.log(calendarEl.current)

        return calendarDom ? calendarDom.getApi() : null;
    }

    const handleRandomKey = async () => {
        const key = await getRandomKey();
        setEventId(key)
        console.log(key)
    }

    const handleFormChange = (e) => {
        console.log(sourceSelected)
        const API = getApi();
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
                startRecur: repeat && start,
                endRecur: repeat && (allDay ? endRecur : (endRecur + 'T' + endTime)),
                color: color,
                textColor: textColor
            }
        )
        let event = {
            id: eventId,
            title: title,
            start: start,
            end: end,
            color: color,
            textColor: textColor
        }

        if (repeat) {
            event.daysOfWeek = days
            event.startRecur = start
            event.endRecur = endRecur !== '' ? endRecur + 'T23:59' : endRecur
        }

        if (eventId !== '')
            API.addEvent(event)

        recurrenceEnd && setEndRecur('')
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
        const API = getApi();
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
            color: color,
            textColor: textColor
        }

        if (repeat) {
            event.daysOfWeek = days
            event.startRecur = start
            event.endRecur = endRecur !== '' ? endRecur + 'T23:59' : endRecur
        }
        

        recurrenceEnd && setEndRecur('')
        console.log(chosenSource)
        if (chosenSource.hasOwnProperty('events')) {
            chosenSource.events.push(event)
        } else {
            chosenSource.events = [event]
        }
        
        sources = sources.filter((source) => chosenSource.id !== source.id)
        sources.push(chosenSource)

        try {
            await calendarRef.set(sources)
            enqueueSnackbar('Evento adicionado!', {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
            
            handleRandomKey();
        } catch (error) {
            enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        }
        setLoaderPop(false)
        
        
        handleClose()
    }
    
    

    return ( 
        <Fragment>
            <Popover
                id={id}
                open={openPop}
                anchorEl={anchorElEventCreate}
                onClose={handleClose}
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
                            {eventsSources.length === 0 ? 'Crie um calendário' : 'Adicionar evento'}
                        </Typography>
                        
                        
                    </Grid>
                </Grid>
                </DialogTitle>
                {(eventsSources.length === 0 && !isFromClassCode) && (
                    <DialogContent>
                        
                        <IconButton onClick={handleOpenNewCalendarDialog}><Add /></IconButton>Novo calendário
                        <br />
                        <Typography variant="p">Parece que você não criou nenhum calendário ainda.</Typography>
                        <br />
                        <Typography variant="p">Para começar a marcar os eventos, crie um calendário.</Typography>
                    </DialogContent>
                
                )}
                {eventsSources.length > 0 && (
                <form id="eventAdd" autoComplete="off" onSubmit={handleEventSave}>
                <DialogContent>
                    
                {!isFromClassCode && 
                <><IconButton onClick={handleOpenNewCalendarDialog}><Add /></IconButton>Novo calendário</>}
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
                          {eventsSources.length > 0 && eventsSources.map((source, i) => (
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
                        <FormControl className={classes.fields}> 
                            <TextField name="corDoEvento" style={{width: '219px',}} InputLabelProps={{shrink: true,}}  id="corDoEvento" required autoComplete="off" defaultValue={color}  type="color" label="Cor do evento" onChange={(e) => setColor(e.target.value)} value={color}/>
                            
                        </FormControl>
                        <FormControl className={classes.fields}> 
                            <TextField name="corDoEvento" style={{width: '219px',}} InputLabelProps={{shrink: true,}}  id="corDoTextoDoEvento" required autoComplete="off" defaultValue={textColor} disabled={!allDay} type="color" label="Cor do texto do evento" onChange={(e) => setTextColor(e.target.value)} value={textColor}/>
                            
                        </FormControl>
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
                    <Button size='small' onClick={handleClose}>Fechar</Button>
                </DialogActions>
                </form>
                
                )}
                

            </Popover>
        </Fragment>
    );
}
 
export default CreateEventPopover;