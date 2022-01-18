import { DialogActions, DialogContent, DialogTitle, Grid, IconButton, Popover, Tooltip, Typography } from "@material-ui/core";
import { Close, Delete, Edit, Event } from "@material-ui/icons";
import { useEffect } from "react";
import { Fragment } from "react";
import { calendarRef } from "../services/databaseRefs";
import { daysOfWeek } from "./LocaleDaysOfWeek";

const SeeEventPopover = (props) => {

    const { anchorElEventInfo, handleClose, event } = props;

    


    

    const openEventInfo = Boolean(anchorElEventInfo);
    const id = openEventInfo ? 'simple-popover' : undefined;
    const recurrence = (event && event._def.recurringDef !== null) && event._def.recurringDef.typeData


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
                            <IconButton variant='outlined' edge="end" color="inherit"><Delete /></IconButton>
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