import { Button, Container, Grid, TextField, Typography } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useRef } from "react";

import { Fragment } from "react";
import useStyles from "../hooks/useStyles";
import { calendarRef } from "../services/databaseRefs";
import FullScreenDialog from './FullscreenDialog'



const CreateCalendar = (props) => {
    const { open, handleClose } = props;


    const {enqueueSnackbar, closeSnackbar} = useSnackbar()


    const classes = useStyles()

    const form = useRef();

    const handleCreateCalendar = async (e) => {
        e.preventDefault()
        console.log(e)
        const formData = new FormData(e.target)
        const source = Object.fromEntries(formData.entries());
        await calendarRef.transaction((sources) => {
            if (sources) {
                sources.push(source)
            } else {
                sources = [source]
            }
            return sources;
        }, (error) => {
            if (error) {
                enqueueSnackbar(error.message, {title: 'Error', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
            }
        });
        enqueueSnackbar('Calendário criado com sucesso!', {title: 'success', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        handleClose();
        
    }

    return (
        <Fragment>
            
            <FullScreenDialog 
                isOpen={open} 
                onClose={() => handleClose()} 
                onSave={() => form.current.requestSubmit()}
                title={'Criar calendário'}
                saveButton={'Criar'}
                saveButtonDisabled={false}
            >
                <Container>
                    <Typography variant="h6">
                        Dados do novo calendário
                    </Typography>
                    <Typography variant="p" component={'p'}>
                        Crie quantos calendários precisar. Os calendários servem para organizar os eventos da agenda da sua escola de uma maneira melhor.
                    </Typography>
                    <Typography variant="p" component={'p'}>
                        Importante saber: sempre que uma sala é aberta no sistema, é criado para ela um calendário separado contendo os dias de aula, após a turma ser fechada, o calendário é apagado automaticamente
                    </Typography>
                    <form onSubmit={handleCreateCalendar} ref={form}>
                        <Grid
                            justify="space-around" // Add it here :)
                            container 
                            spacing={24}
                            alignItems="center"
                        >
                            <Grid item>
                                <TextField
                                    className={classes.fieldsSize} 
                                    label={'Identificação do calendário (ID)'}
                                    helperText={'Dê um nome único ao calendário.'}
                                    required
                                    name="id"
                                    id="id"
                                />
                            </Grid>
                            <Grid item>
                                <TextField 
                                    className={classes.fieldsSize} 
                                    label={'Cor padrão dos eventos'}
                                    helperText={'Defina a cor padrão dos eventos.'}
                                    defaultValue={'#3F51B5'}
                                    type="color"
                                    required
                                    name="color"
                                    id="color"
                                />
                            </Grid>
                            <Grid item>
                                <TextField 
                                    className={classes.fieldsSize} 
                                    label={'Cor de texto padrão dos eventos'}
                                    helperText={'Defina a cor de texto padrão dos eventos.'}
                                    defaultValue={'#FFFFFF'}
                                    type="color"
                                    required
                                    name="textColor"
                                    id="textColor"
                                />
                            </Grid>
                            <Grid item>
                                <TextField 
                                    className={classes.fieldsSize} 
                                    label={'Cor de borda padrão dos eventos'}
                                    helperText={'Defina a cor de borda padrão dos eventos.'}
                                    defaultValue={'#3F51B5'}
                                    type="color"
                                    required
                                    name="borderColor"
                                    id="borderColor"
                                />
                            </Grid>
                        </Grid>
                    </form>
                    
                   
                </Container>
                
            </FullScreenDialog>
        </Fragment>
    );
}
 
export default CreateCalendar;