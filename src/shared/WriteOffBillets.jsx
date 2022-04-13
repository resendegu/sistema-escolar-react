import { Avatar, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, Input, InputAdornment, InputLabel, List, ListItem, ListItemText, makeStyles, TextareaAutosize, TextField, Typography } from "@material-ui/core";
import { Fragment, useEffect, useState } from "react";
import { billetsDocsRef, schoolInfoRef, studentsRef } from "../services/databaseRefs";
import { useSnackbar } from "notistack";
import { AccountBox, AccountCircle, AttachMoney, ConfirmationNumber, DateRange, Event, FileCopy, Gavel, Money, Pageview } from "@material-ui/icons";
import StudentDataCard from "./StudentDataCard";
import { createBilletView } from "./FunctionsUse";

const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    container: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        padding: "10px",
        flexWrap: "wrap",
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
  }));

const WriteOffBillets = ({docId}) => {
    const classes = useStyles();
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const [doc, setDoc] = useState();
    const [localDocId, setLocalDocId] = useState(docId);
    const [dialog, setDialog] = useState(false);
    const [infoSchool, setInfoSchool] = useState();
    const [studentData, setStudentData] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (localDocId) {
            getData(docId)
        } else {
            setDialog(true)
        }
    }, [docId])

    const getData = async () => {
        setLoading(true)
        const localInfoSchool = (await schoolInfoRef.once('value')).val()
        setInfoSchool(localInfoSchool);

        
        let localDoc
        const snapshot = await billetsDocsRef.orderByChild('numeroDoc').equalTo(localDocId).once('value')
        if (snapshot.exists()) {
            for (const docKey in snapshot.val()) {
                if (Object.hasOwnProperty.call(snapshot.val(), docKey)) {
                    localDoc = snapshot.val()[docKey];
                    setDoc(localDoc)
                }
            }
            console.log(localDoc)
            const studentInfo = (await studentsRef.child(localDoc.matricula).once('value')).val()
            setStudentData(studentInfo)

            await createBilletView(localDoc.parcelaAtual, localDoc.numDeParcelas, localDoc.vencimento, localDoc.numeroDoc, localDoc.valorDoc, localDoc.descontos, localDoc.acrescimos, localDoc.totalCobrado, localDoc.dataProcessamento, localDoc.informacoes, studentInfo, localInfoSchool, document.getElementById('boletos'))
        } else {
            setDialog(true)
            enqueueSnackbar('Boleto não encontrado no banco de dados.', {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        }
        
        setLoading(false)
        
    }


    const handleChangeDocId = (e) => {
        
        getData()
        setDialog(false)
    } 

    return (
        <Fragment>
            <Backdrop className={classes.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
                <Dialog open={dialog} onClose={() => setDialog(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Digite o número do documento do boleto</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Digite o número do Documento que se encontra em cada parcela para que o sistema encontre o débito no banco de dados
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Número do Documento"
                        type="number"
                        fullWidth
                        value={localDocId}
                        onChange={(e) => setLocalDocId(Number(e.target.value))}
                        autoComplete={false}
                        
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => setDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleChangeDocId} color="primary">
                        Procurar
                    </Button>
                    </DialogActions>
                </Dialog>
                <Container>
                    <Typography variant="h6" component={"h6"}>Confira os dados do documento</Typography>
                    <div id="boletos">

                    </div>
                    <div className={classes.container}>
                        <StudentDataCard studentData={studentData} />
                        {doc && <Card className={classes.smallCards} variant="outlined" >
                        <CardContent>
                        <Grid 
                            justifyContent="flex-start"
                            direction="row"
                            container
                            spacing={1}
                            >
                            <Grid item>
                                <Avatar className={classes.orange}>
                                <ConfirmationNumber />
                                </Avatar>
                            </Grid>

                            <Grid item>
                                <Typography variant="h5" component="h2">
                                Baixa de pagamento
                                </Typography>
                                
                                
                            </Grid>
                            </Grid>
                            <hr />
                            <Box m={1}>
                                <TextField 
                                    
                                    label="Número do Documento"
                                    value={doc.numeroDoc}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Pageview />
                                            </InputAdornment>
                                        ),
                                        readOnly: true,
                                        }}
                                />
                            </Box>

                            <Box m={1}>
                                <TextField 
                                    variant="outlined"
                                    label="Valor Cobrado"
                                    value={doc.totalCobrado}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                R$
                                            </InputAdornment>
                                        ),
                                        readOnly: true,
                                        }}
                                />
                            </Box>
                            
                            <Box m={1}>
                                <TextField
                                    variant="outlined"
                                    className={classes.margin}
                                    label="Sacado"
                                    fullWidth
                                    value={studentData && studentData.nomeAluno}
                                    defaultValue={'Sacado não encontrado'}
                                    InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle />
                                        </InputAdornment>
                                    ),
                                    readOnly: true,
                                    }}
                                />
                            </Box>
                            
                            <Box m={1}>
                                <TextField
                                    variant="outlined"
                                    className={classes.margin}
                                    label="Vencimento"
                                    fullWidth
                                    value={doc.vencimento}
                                    InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRange />
                                        </InputAdornment>
                                    ),
                                    readOnly: true,
                                    }}
                                />
                            </Box>

                            
                            <Box m={1}>
                                <TextareaAutosize
                                wrap
                                    
                                    maxRows={3}
                                    maxLength={20}
                                    aria-label="maximum height"
                                    placeholder="Informações"
                                    defaultValue={doc.informacoes}
                                    value={doc.informacoes}
                                    readOnly
                                    style={{width: "100%", maxWidth: "100%"}}
                                />
                            </Box>
                            <Box m={1}>
                                <InputLabel>Data de pagamento</InputLabel>
                                <Input
                                    className={classes.margin}
                                    label="Data de pagamento"
                                    fullWidth
                                    
                                    type="date"
                                    required
                                    
                                />
                            </Box>
                            <Box m={1}>
                            <TextField
                                className={classes.margin}
                                label="Valor Pago"
                                fullWidth
                                value={doc.vencimento}
                                InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Money />
                                    </InputAdornment>
                                ),
                                readOnly: true,
                                }}
                            />
                            </Box>
                            <Box m={1}>
                                <Button variant="contained" color="primary" fullWidth startIcon={<Gavel />}>Efetuar baixa</Button>
                            </Box>
                            
                            
                            
                        </CardContent>
                    
                    </Card>}
                    </div>
                    
                </Container>
                
        </Fragment>
    );
}
 
export default WriteOffBillets;