import { Avatar, DialogActions, DialogContent, DialogTitle, Fab, Grid, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Popover, Tooltip, Typography } from "@material-ui/core";
import { Close, Delete, Edit, Event, PersonOutline } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { Fragment } from "react";

import { calendarRef, classesRef, studentsRef } from "../services/databaseRefs";
import { daysOfWeek } from "./LocaleDaysOfWeek";
import { useConfirmation } from "../contexts/ConfirmContext";


const SeeEventPopover = ({ anchorElEventInfo, handleClose, event, api, isFromClassCode, handleFault }) => {

    

    const confirm = useConfirmation();
    

    const openEventInfo = Boolean(anchorElEventInfo);
    const id = openEventInfo ? 'simple-popover' : undefined;
    const recurrence = (event && event._def.recurringDef !== null) && event._def.recurringDef.typeData
    const sourceId = (event && event.source.id)
    const eventId = (event && event.id)
    const [faults, setFaults] = useState([]);

    useEffect(() => {
        if (isFromClassCode) {
            classesRef.child(eventId).child("frequencia").child(event.startStr).on('value', async faultsSnap => {
                if (faultsSnap.exists()) {
                    let faultStudentsIds = faultsSnap.val()
                    let faultsArray = []
                    for (const id in faultStudentsIds) {
                        if (Object.hasOwnProperty.call(faultStudentsIds, id)) {
                            const studentSnap = await studentsRef.child(id).once("value")
                            const name = studentSnap.child('nomeAluno').val()
                            const avatar = studentSnap.child('fotoAluno').val()
                            faultsArray.push({name: name, avatar: avatar, id: id})
                            setFaults([...faultsArray])
                        }
                    }
                } else {
                    setFaults([])
                }
            })

            return () => {
                classesRef.off('value');
            }
        }
    }, [])

    const getClassFaults = async () => {
        const faultsSnap = await classesRef.child(eventId).child("frequencia").child(event.startStr).once('value')
        

    }

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
            //const eventsSources = api.getEventSources();
            let rawSources = (await calendarRef.once('value')).val();
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

    const handleReleaseFault = async () => {
        handleFault(event)
    }

    const handleRemoveFault = async (fault) => {
        // true means tha it will remove a fault
        handleFault({eventStr: event.startStr, classCode: eventId, studentId: fault.id, studentName: fault.name}, true)
        
        
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
                        {!isFromClassCode && (<><Tooltip title={'Editar evento'}>
                            <IconButton variant='outlined' edge="end" color="inherit"><Edit /></IconButton>
                        </Tooltip>
                        <Tooltip title={'Deletar evento'}>
                            
                            <IconButton variant='outlined' edge="end" color="inherit" onClick={handleDeleteEvent}><Delete /></IconButton>
                        
                            
                        </Tooltip></>)}
                        {isFromClassCode && (
                            <Tooltip title={'Lançar faltas para os alunos selecionados'}>
                                <Fab variant="extended" onClick={handleReleaseFault} size="medium" >
                                    <PersonOutline />
                                    Lançar faltas
                                </Fab>
                            </Tooltip>
                        )}
                        
                            
                            
                            
                            
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
                {isFromClassCode && <DialogTitle>Faltas</DialogTitle>}
                {isFromClassCode && <DialogContent>
                <div>
                    <List>
                    {faults.map((fault, i) => (
                        <ListItem>
                            <ListItemAvatar>
                            <Tooltip 
                                title={fault.id}
                            >
                                <Avatar>
                                    {fault.avatar ? (<img src={fault.avatar} style={{width: "40px", height: "40px", borderRadius: '50%',}} alt=""/>) : <Avatar />}
                                </Avatar>
                            </Tooltip>
                            </ListItemAvatar>
                            <ListItemText
                                primary={fault.name}
                                
                            />
                            <ListItemSecondaryAction>
                                <Tooltip 
                                    title={'Remover falta'}
                                >
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFault(fault)}>
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    {faults.length === 0 && 'Não há faltas registradas para este dia'}
                        
                    
                    </List>
                </div>
                </DialogContent>}

            {/*  */}
            </Popover>
        </Fragment>
    );
}
 
export default SeeEventPopover;