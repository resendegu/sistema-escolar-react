import { Avatar, Backdrop, Button, Card, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, List, ListItem, ListItemText, makeStyles, TextField, Typography } from "@material-ui/core";

import { AccountBox } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
    root: {
      width: "100%",
      maxWidth: "70vw",
      minWidth: 350,
      
      height: "85vh",
    },
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      padding: "10px",
      flexWrap: "wrap",
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    smallCards: {
      minWidth: 275,
      maxWidth: 350,
      height: "84vh",
      marginLeft: "10px",
      width: "fit-content",
      marginBottom: "10px",
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    grades: {
      marginBottom: 3,
    },
    grid: {
      marginTop: 10,
      width: "100%",
    },
    list: {
      fontSize: 10,
    },
    avatar: {
      backgroundColor: '#3f51b5',
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));

const StudentDataCard = ({studentData}) => {
    const classes = useStyles()

    return (
        <>
        {studentData && <Card className={classes.smallCards} variant="outlined" >
                        <CardContent>
                        <Grid 
                            justifyContent="flex-start"
                            direction="row"
                            container
                            spacing={1}
                            >
                            <Grid item>
                                <Avatar className={classes.orange}>
                                <AccountBox />
                                </Avatar>
                            </Grid>

                            <Grid item>
                                <Typography variant="h5" component="h2">
                                Dados do Aluno
                                </Typography>
                                
                                
                            </Grid>
                            </Grid>
                            <hr />
                            <Typography className={classes.title} color="textPrimary" gutterBottom>
                            {studentData.nomeAluno}
                            </Typography>
                            <Grid 
                            justifyContent="flex-start"
                            direction="row"
                            container
                            spacing={1}
                            >
                            <Grid item>
                                <Avatar alt={studentData.nomeAluno} variant="rounded" src={studentData.fotoAluno} style={{width: '3cm', height: '4cm',}} className={classes.orange} />
                            </Grid>

                            <Grid item>
                                <Typography className={classes.pos} color="textSecondary">
                                Matrícula: {studentData.matriculaAluno}
                                </Typography>
                                <Typography className={classes.pos} color="textSecondary">
                                Nascimento: {studentData.hasOwnProperty('dataNascimentoAluno') && studentData.dataNascimentoAluno.split('-').reverse().join('/')}
                                </Typography>
                                <Typography className={classes.pos} color="textSecondary">
                                CPF: {studentData.cpfAluno}
                                </Typography>
                                <Typography className={classes.pos} color="textSecondary">
                                RG: {studentData.rgAluno}
                                </Typography>
                                
                            </Grid>
                            </Grid>
                            
                    
                            <List component="nav" aria-label="informações adicionais do aluno">
                            <ListItem>
                                <ListItemText className={classes.list}>Email: {studentData.emailAluno} </ListItemText>
                            </ListItem>
                            <Divider />
                            <ListItem divider>
                                <ListItemText>Telefone: {studentData.telefoneAluno}</ListItemText>
                            </ListItem>
                            <ListItem>
                                <ListItemText>Celular: {studentData.celularAluno}</ListItemText>
                            </ListItem>
                            <Divider light />
                            <ListItem>
                                <ListItemText> Endereço: {studentData.enderecoAluno}, {studentData.numeroAluno}, {studentData.bairroAluno}, {studentData.cidadeAluno}, {studentData.estadoAluno}, CEP: {studentData.cepAluno} </ListItemText>
                            </ListItem>
                            </List>

                            
                        </CardContent>
                    
                    </Card>}
        </>
    );
}
 
export default StudentDataCard;