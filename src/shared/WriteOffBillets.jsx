import { Avatar, Backdrop, Box, Button, Card, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, Input, InputAdornment, InputLabel, List, ListItem, ListItemText, makeStyles, TextareaAutosize, TextField, Tooltip, Typography } from "@material-ui/core";
import { Fragment, useEffect, useState } from "react";
import { billetsDocsRef, schoolInfoRef, studentsRef } from "../services/databaseRefs";
import { functions } from "../services/firebase";
import { useSnackbar } from "notistack";
import { AccountBox, AccountCircle, Assistant, Attachment, AttachMoney, CallToActionSharp, Cancel, ConfirmationNumber, DateRange, Event, FileCopy, Gavel, History, Info, Money, Pageview, Print, RemoveCircle, ReportProblem } from "@material-ui/icons";
import StudentDataCard from "./StudentDataCard";
import { createBilletView } from "./FunctionsUse";
import { useAuth } from "../hooks/useAuth"
import { billetColors, billetStatus, billetStatusExplanations } from "./BilletStatus";
import { useConfirmation } from "../contexts/ConfirmContext";
import BilletAttachments from "./BilletAttachments";


const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.modal + 1,
      color: '#fff',
    },
    container: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
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
        overflow: 'auto'
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
      billet: {
          width: '21cm'
      },
  }));

const WriteOffBillets = ({docId}) => {
    const classes = useStyles();
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const [doc, setDoc] = useState();
    const [docKeyPath, setDocKeyPath] = useState();
    const [localDocId, setLocalDocId] = useState(docId);
    const [localDocIdTemp, setLocalDocIdTemp] = useState(docId);
    const [dialog, setDialog] = useState(false);
    const [infoSchool, setInfoSchool] = useState();
    const [studentData, setStudentData] = useState();
    const [loading, setLoading] = useState(false);
    const [paymentDay, setPaymentDay] = useState();
    const [paidValue, setPaidValue] = useState();
    const [billetHistory, setBilletHistory] = useState();
    const [billetView, setBilletView] = useState(false);
    const [ openAttachments, setOpenAttachments ] = useState(false);

    const confirm = useConfirmation();
    const { user } = useAuth();
    useEffect(() => {
        if (localDocId) {
            let localDoc
            const billetRef = billetsDocsRef.orderByChild('numeroDoc').equalTo(localDocId)
            billetRef.on('value', async (snapshot) => {
                setLoading(true)
                const localInfoSchool = (await schoolInfoRef.once('value')).val()
                setInfoSchool(localInfoSchool);
                if (snapshot.exists()) {
                    for (const docKey in snapshot.val()) {
                        if (Object.hasOwnProperty.call(snapshot.val(), docKey)) {
                            localDoc = snapshot.val()[docKey];
                            if (!localDoc.hasOwnProperty('status')) {
                                localDoc.status = 0
                            }
                            setDoc(localDoc)
                            setDocKeyPath(docKey)
                            localDoc.hasOwnProperty('historico') ? setBilletHistory(localDoc.historico) : setBilletHistory()
                        }
                    }
                    console.log(localDoc)
                    const studentInfo = (await studentsRef.child(localDoc.matricula).once('value')).val()
                    setStudentData(studentInfo)
                    setPaidValue(localDoc.totalCobrado)
                    const timestampFunc = functions.httpsCallable('timestamp');
                    const result = await timestampFunc();
                    console.log(result)
                    const timestamp = result.data.timestamp
                    const now = new Date(timestamp._seconds * 1000)
                    let localDate = now.toLocaleDateString()
                    localDate = localDate.split('/').reverse().join('-')
                    setPaymentDay(localDate)
                    
                } else {
                    setDialog(true)
                    enqueueSnackbar('Boleto não encontrado no banco de dados.', {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
                }
                setLoading(false)
            }, (error) => {
                enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
                console.log(error)
            })
        
        
            return () => {
                billetRef.off('value');
            }
        } else {
            setDialog(true)
        }
    }, [docId, localDocId])

    

    const handleShowBilletView = async () => {
        setLoading(true)
        setBilletView(true)
        setTimeout(async () => {
            try {
                await createBilletView(doc.parcelaAtual, doc.numDeParcelas, doc.vencimento, doc.numeroDoc, doc.valorDoc, doc.descontos, doc.acrescimos, doc.totalCobrado, doc.dataProcessamento, doc.informacoes, studentData, infoSchool, document.getElementById('boletos'))
            } catch (error) {
                enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
                console.log(error)
            }
            setLoading(false)
        }, 800);
        

    }


    const handleChangeDocId = (e, localDocId) => {
        e.preventDefault()
        setLocalDocId(localDocId)
        setDialog(false)
    }
    
    const handleWriteOff = async () => {
        /**
         * For the WriteOff, 0 = Pending, 1 = Waiting approval, 2 = Written Off, 3 = Challenge, 4 = Canceled
         * 0 means that the billet has not been paid or has not received a write off. In other words, is pending a write off.
         * 1 means that some user with less privilegies in the system changed the status of the billet, then it needs to be approved by one that has the required privilegies
         * 2 means that the billet have been paid, and the Write Off is approved and effective.
         * 3 means that some user has encountered some inconsistency related to that billet and needs review.
         * 4 means that this billet has been canceled for some reason and will not be charged.
         */
         const text = await confirm({
            variant: "danger",
            catchOnCancel: true,
            title: "Confirmação",
            description: "Você deseja dar baixa neste boleto? (Após dar baixa, pode ser que o status do boleto não mude de imediato. Fique tranquilo, o sistema está processando a baixa em background, você não precisa esperar.)",
            promptText: true,
            promptLabel: 'Alguma observação... (opcional)'
        });

        const dueDate = doc.vencimento.split('/').reverse().join('-')
        console.log(`${dueDate} < ${paymentDay}`)
        if (dueDate < paymentDay) {
            // If the billet has passed the dueDate
            enqueueSnackbar('Boleto vencido.', {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        } else {
            // If the billet has not passed the dueDate
            await billetsDocsRef.child(docKeyPath).child('historico').push({status: 2, paidValue: paidValue, paymentDay: paymentDay, userCreator: user.id, motivo: text === undefined ? '0' : text})
            enqueueSnackbar('Baixa solicitada. O sistema processará o pedido em background.', {title: 'Sucesso', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        }
    }

    const handleChallenge = async () => {
        const text = await confirm({
            variant: "danger",
            catchOnCancel: true,
            title: "Confirmação",
            description: "Você deseja contestar este boleto? Se sim, digite abaixo o motivo e clique em 'Sim'. Sua decisão pode estar sujeita a aprovação.",
            promptText: true,
            promptLabel: 'Motivo da contestação'
        });
        
        await billetsDocsRef.child(docKeyPath).child('historico').push({status: 3, motivo: text, userCreator: user.id})
        enqueueSnackbar('Contestação solicitada. O sistema processará o pedido em background.', {title: 'Sucesso', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
    }

    const handleUnChallenge = async () => {
        const text = await confirm({
            variant: "danger",
            catchOnCancel: true,
            title: "Confirmação",
            description: "Você deseja retirar a contestação deste boleto? Se sim, digite abaixo o motivo e clique em 'Sim'. Sua decisão pode estar sujeita a aprovação.",
            promptText: true,
            promptLabel: 'Motivo da remoção do contestamento'
        });
        
        await billetsDocsRef.child(docKeyPath).child('historico').push({status: 0, motivo: text, userCreator: user.id})
        enqueueSnackbar('Remoção de contestação solicitada. O sistema processará o pedido em background.', {title: 'Sucesso', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
    }

    const handleCancel = async () => {
        const text = await confirm({
            variant: "danger",
            catchOnCancel: true,
            title: "Confirmação",
            description: "Você deseja cancelar este boleto? Entenda que após o cancelamento, o boleto será desconsiderado e não terá mais valor. Estará no sistema apenas para fins de consulta e não poderá voltar a ter valor. Se tem certeza da sua decisão e quer continuar, digite abaixo um motivo e clique em 'Sim'. Sua decisão pode estar sujeita a aprovação.",
            promptText: true,
            promptLabel: 'Motivo do cancelamento'
        });

        await billetsDocsRef.child(docKeyPath).child('historico').push({status: 4, motivo: text, userCreator: user.id})
        enqueueSnackbar('Cancelamento solicitado. O sistema processará o pedido em background.', {title: 'Sucesso', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
    }

    const handleShowHistory = async () => {
        console.log(billetHistory)
        enqueueSnackbar('O histórico está em desenvolvimento :)', {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
    }

    const handleShowAttachments = () => {
        setOpenAttachments(true);
    }

    return (
        <Fragment>
            <BilletAttachments docKeyPath={docKeyPath} open={openAttachments} setOpen={setOpenAttachments} />
            <Backdrop className={classes.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
                <Dialog open={dialog} onClose={() => setDialog(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Digite o número do documento do boleto</DialogTitle>
                    <form onSubmit={(e) => handleChangeDocId(e, localDocIdTemp)} id={'formSearchBillet'}>
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
                            value={localDocIdTemp}
                            onChange={(e) => setLocalDocIdTemp(Number(e.target.value))}
                            autoComplete={false}
                            
                        />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => setDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button  type='submit' color="primary">
                        Procurar
                    </Button>
                    </DialogActions>
                    </form>
                </Dialog>
                <Container>
                    <Typography variant="h6" component={"h6"}>
                        Dados do documento
                        <Button endIcon={<Pageview />} size="small" style={{float: 'right'}} onClick={() => setDialog(true)}>Procurar boleto</Button>
                    </Typography>
                    
                    <Dialog open={billetView} maxWidth="md" onClose={() => setBilletView(false)}>
                        <DialogContent>
                        <div id="boletos" className={classes.billet}>

                        </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setBilletView(false)}>Fechar</Button>
                        </DialogActions>
                    </Dialog>
                    
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
                                <Avatar className={classes.orange} style={{backgroundColor: billetColors[doc.status]}}>
                                <ConfirmationNumber />
                                </Avatar>
                            </Grid>

                            <Grid item>
                                <Typography variant="h5" component="h2">
                                Boleto
                                </Typography>
                                
                                
                            </Grid>
                            </Grid>
                            <hr />
                            
                            <Box m={1}>
                            <Typography variant="subtitle1" component={'label'}>Status: <label style={{color: billetColors[doc.status]}}>{billetStatus[doc.status]}</label></Typography>
                            <Tooltip title={billetStatusExplanations[doc.status]}>
                                <Info fontSize="small" style={{color: billetColors[doc.status]}}/>
                            </Tooltip>
                            
                                <TextField 
                                    size="small"
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
                                    size="small"
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
                                    size="small"
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
                                    size="small"
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
                            
                            
                            
                        </CardContent>
                    
                    </Card>}

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
                                <Assistant />
                                </Avatar>
                            </Grid>

                            <Grid item>
                                <Typography variant="h5" component="h2">
                                Ações
                                </Typography>
                                
                                
                            </Grid>
                            </Grid>
                            <hr />
                            
                            <Box m={1}>
                                <InputLabel>Data de pagamento</InputLabel>
                                <Input
                                    className={classes.margin}
                                    label="Data de pagamento"
                                    fullWidth
                                    value={paymentDay}
                                    onChange={(e) => setPaymentDay(e.target.value)}
                                    type="date"
                                    required
                                    
                                />
                            </Box>
                            <Box m={1}>
                            <TextField
                                className={classes.margin}
                                label="Valor Pago"
                                fullWidth
                                value={paidValue}
                                onChange={(e) => setPaidValue(e.target.value)}
                                type="number"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Money />
                                        </InputAdornment>
                                    ),
                                
                                }}
                            />
                            </Box>
                            <Box m={1}>
                                <Button variant="contained" color="primary" fullWidth onClick={handleWriteOff} startIcon={<Gavel />} style={{backgroundColor: doc.status !== 0 ? '' : billetColors[2]}} disabled={doc.status !== 0}>Efetuar baixa</Button>
                            </Box>
                            <hr />
                            <Box m={1}>
                                <Button variant="contained" color="secondary" fullWidth onClick={handleChallenge} startIcon={<ReportProblem />} style={{backgroundColor: billetColors[3]}} disabled={doc.status === 4 || doc.status === 3}>Contestar boleto</Button>
                            </Box>
                            <Box m={1}>
                                <Button variant="contained" color="secondary" fullWidth onClick={handleUnChallenge} startIcon={<RemoveCircle />} style={{backgroundColor: billetColors[0]}} disabled={doc.status !== 3}>Retirar contestação</Button>
                            </Box>
                            <Box m={1}>
                                <Button variant="contained" color="secondary" fullWidth onClick={handleCancel} startIcon={<Cancel />} style={{backgroundColor: billetColors[4]}} disabled={doc.status === 4}>Cancelar boleto</Button>
                            </Box>
                            <hr />
                            <Box m={1}>
                                <Button variant="contained" color="primary" fullWidth onClick={handleShowBilletView} startIcon={<Print />}>Visualizar boleto</Button>
                            </Box>
                            <Box m={1}>
                                <Button variant="contained" color="primary" fullWidth onClick={handleShowHistory} startIcon={<History />}>Visualizar histórico</Button>
                            </Box>
                            <Box m={1}>
                                <Button variant="contained" color="primary" fullWidth onClick={handleShowAttachments} startIcon={<Attachment />}>Anexos</Button>
                            </Box>
                            
                            
                        </CardContent>
                    
                    </Card>}
                    
                    </div>
                    
                </Container>
                
        </Fragment>
    );
}
 
export default WriteOffBillets;