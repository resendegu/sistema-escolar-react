import { Container, Grid, makeStyles } from "@material-ui/core";
import { ArrowForward } from "@material-ui/icons";
import { useState } from "react";
import CalendarComponent from "../../muiDashboard/Calendar";
import FullScreenDialog from "../../shared/FullscreenDialog";
import SimpleCard from "../../shared/SimpleCard";

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));

const StudentDashboard = () => {
    const classes = useStyles();

    const [openCalendar, setOpenCalendar] = useState(false);

    const nextEvents = (
        <>

        </>
    )

    const handleOpenFullCalendar = () => {
        setOpenCalendar(true);
    }
    
    return ( 
        <div className={classes.root}>
            <FullScreenDialog
                isOpen={openCalendar}
                onClose={() => setOpenCalendar(false)}
                hideSaveButton
                saveButtonDisabled
                title={'Calendário Escolar'}
            >
                <CalendarComponent isForStudent />
            </FullScreenDialog>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} spacing={3}>
                    <SimpleCard 
                        title={'Eventos/Aulas da semana'}
                        buttonText={'Ver calendário'}
                        buttonStartIcon={<ArrowForward />}
                        buttonAction={handleOpenFullCalendar}
                        body={(
                            <CalendarComponent isForStudent/>
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6} spacing={3}>
                    <SimpleCard 
                        title={'Próximos eventos/aulas'}
                        buttonText={'Ver calendário'}
                        
                    />
                </Grid>
                <Grid item xs={12} sm={6} spacing={3}>
                    <SimpleCard 
                        title={'Próximos eventos/aulas'}
                        buttonText={'Ver calendário'}
                        
                    />
                </Grid>
            </Grid>
        </div>
    );
}
 
export default StudentDashboard;