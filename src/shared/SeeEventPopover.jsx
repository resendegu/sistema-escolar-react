import { DialogActions, DialogContent, DialogTitle, Grid, IconButton, Popover, Tooltip, Typography } from "@material-ui/core";
import { Close, Delete, Edit, Event } from "@material-ui/icons";
import { useEffect } from "react";
import { Fragment } from "react";

import { calendarRef } from "../services/databaseRefs";
import { daysOfWeek } from "./LocaleDaysOfWeek";
import { useConfirmation } from "../contexts/ConfirmContext";

const SeeEventPopover = (props) => {

    const { anchorElEventInfo, handleClose, event, api } = props;

    const confirm = useConfirmation();
    

    const openEventInfo = Boolean(anchorElEventInfo);
    const id = openEventInfo ? 'simple-popover' : undefined;
    const recurrence = (event && event._def.recurringDef !== null) && event._def.recurringDef.typeData
    const sourceId = (event && event.source.id)
    const eventId = (event && event.id)

    

    const handleDeleteEvent = async () => {
        try {
            await confirm({
                variant: "danger",
                catchOnCancel: true,
                title: "Confirmação",
                description: "Você deseja deletar este evento? Este evento e todas as suas ocorrências serão apagadas."
            })
            handleClose();
            
            
            const eventApi = api.getEventById(eventId)
            eventApi.remove()
            api.refetchEvents();
            const eventsSources = api.getEventSources();
            let rawSources = eventsSources.map((eventSource) => eventSource.internalEventSource._raw)
            console.log(rawSources)
            let thisSource = rawSources.filter(eventSource => eventSource.id === sourceId)
            
            console.log(thisSource)
            rawSources = rawSources.filter(eventSource => eventSource.id !== sourceId)
            console.log(rawSources)
            let thisEvents = thisSource[0].events
            let updatedEvents = thisEvents.filter(aEvent => aEvent.id !== eventId)
            console.log(updatedEvents)
            thisSource[0].events = updatedEvents
            rawSources.push(thisSource[0])
            console.log(rawSources)
            await calendarRef.set(rawSources);
        } catch (error) {
            console.log(error)
        }
        
    }
    

    return (
        <Fragment>
            <Popover
                id={id}
                open={openEventInfo}
                anchorEl={anchorElEventInfo}
                onClose={handleClose}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
                transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                style={{maxWidth: '70vw',}}
                
            >
                <DialogTitle>
                    <Grid
                        justifyContent='space-between'
                        container 
                        spacing={24}
                        alignItems="center"
                    >
                        <Grid item>
                        <Tooltip title={'Editar evento'}>
                            <IconButton variant='outlined' edge="end" color="inherit"><Edit /></IconButton>
                        </Tooltip>
                        <Tooltip title={'Deletar evento'}>
                            <IconButton variant='outlined' edge="end" color="inherit" onClick={handleDeleteEvent}><Delete /></IconButton>
                        </Tooltip>
                        
                            
                            
                            
                            
                        </Grid>
                        <Grid item>
                            <Tooltip 
                                title={'Fechar'}
                            >
                                <IconButton
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleClose}
                                    color="inherit"
                                    edge="end"
                                    
                                    //style={{maxWidth: '34px'}}
                                >
                                    <Close />
                                </IconButton>
                            </Tooltip>
                            
                           
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    {event && (
                        <>
                        <Typography variant="h5">{event.title}</Typography>
                        <Typography variant="p" component={'p'}>
                            
                            <Typography variant="label">{daysOfWeek[event.start.getDay()]}, {event.start.toLocaleDateString()}</Typography>
                            <Typography variant="span"> ⋅ </Typography>
                            <Typography variant="label">{event.allDay ? 'O dia inteiro' : event.start.toLocaleTimeString() + ' - ' +  event.end.toLocaleTimeString()}</Typography>
                        </Typography>
                        
                        </>
                    )}

                    {recurrence && (
                        <Typography variant="p">{recurrence.daysOfWeek && ' Repete ' + recurrence.daysOfWeek.map((day) => ' ' + daysOfWeek[day])} {recurrence.daysOfWeek && recurrence.endRecur ? 'e termina em ' + recurrence.endRecur.toLocaleDateString() : ', e nunca termina' }</Typography>
                    )}
                    
                </DialogContent>
                <DialogActions></DialogActions>

            {/*  */}
            </Popover>
        </Fragment>
    );
}
 
export default SeeEventPopover;