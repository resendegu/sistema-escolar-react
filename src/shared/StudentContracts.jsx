import { Avatar, Backdrop, Box, Button, Card, CardContent, Checkbox, CircularProgress, Fab, FormControl, FormControlLabel, Grid, IconButton, InputLabel, Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, makeStyles, Select, TextField, Tooltip, Typography, MenuItem } from "@material-ui/core";
import { Add, Delete, Receipt, Refresh, Save, SupervisedUserCircle } from "@material-ui/icons";
import { useEffect, useState, useRef } from "react";
import { Fragment } from "react";
import { classesRef, contractRef, coursesRef, disabledStudentsRef, studentsRef } from "../services/databaseRefs";
import { useSnackbar } from "notistack";
import { getDateMeta } from "@fullcalendar/react";
import FullScreenDialog from "./FullscreenDialog";
import { useConfirmation } from "../contexts/ConfirmContext";
import { generateBillets } from "./FunctionsUse";
import PrintBillets from "./PrintBillets";
import { ContractConfigure } from "./StudentFields";


const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
          },
          position: "absolute"
    },
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      padding: "3px",
      flexWrap: "wrap",
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    smallCards: {
      minWidth: 295,
      minHeight: "50vh",
      maxWidth: 350,
      height: "fit-content",
      marginLeft: "10px",
      width: "fit-content",
      marginBottom: "5px",
      overflow: "auto"
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
     center: {
        width: "100%",
        height: "100%",
        lineHeight: "200px",
        
        textAlign: "center",
      },
      extendedIcon: {
        marginRight: theme.spacing(1),
      },
      button: {
          marginBottom: 5,
      }
  }));


const StudentContracts = ({studentId, isOpen, onClose, isDisabled}) => {

    const classes = useStyles();

    const confirm = useConfirmation();

    const [contracts, setContracts] = useState([]);
    const [ systemContracts, setSystemContracts ] = useState([]);
    const [ edit, setEdit ] = useState(false);
    const [mouseOver, setMouseOver] = useState();
    const [loading, setLoading] = useState(false);
    const [contractSelected, setContractSelected] = useState('');
    const [showBillets, setShowBillets] = useState(false);
    const [courseChosen, setCourseChosen] = useState();
    const [schoolCourses, setSchoolCourses] = useState();
    const [openDialog, setOpenDialog] = useState(false);
    const [newContract, setNewContract] = useState(false);

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    
    const form = useRef();

    const getData = async () => {
        setLoading(true);
        const snapshot = !isDisabled ? (await studentsRef.child(studentId).child('contratos').once("value")) : (await disabledStudentsRef.child(studentId + '/dadosAluno').child('contratos').once('value'));
        const contractsArray = snapshot.exists() ? snapshot.val() : [];
        console.log(contractsArray);
        let systemContractsArray = []
        contractsArray.map(async (contractId, i) => {
            let localContract = (await contractRef.child(contractId).once('value')).val()
            systemContractsArray.push(localContract)
            setSystemContracts([...systemContractsArray])
        })
        
        
        console.log(contractsArray);
        setContracts([...contractsArray]);
        
        console.log(systemContractsArray)

        
        const snap = await coursesRef.once('value')
        if (snap.exists()) {
            const localCourses = snap.val()
            
            
            setSchoolCourses([...localCourses]);
        }
        setLoading(false);
    }

    useEffect(() => {
        getData();
    }, [studentId, newContract])

    useEffect(() => {
        sessionStorage.setItem('newContract', courseChosen)
        sessionStorage.removeItem('codContrato')
        sessionStorage.removeItem('contratoConfigurado')
        sessionStorage.removeItem('planoOriginal')
    }, [courseChosen])

    useEffect(() => {
        let contractCode = sessionStorage.getItem('codContrato');
        let configuredContract = JSON.parse(sessionStorage.getItem('contratoConfigurado'));
        let originalPlan = JSON.parse(sessionStorage.getItem('planoOriginal'))
        console.log(contractCode);
        if (contractCode && configuredContract && originalPlan) {
           
            contractRef.child(contractCode).set({codContrato: contractCode, contratoConfigurado: configuredContract, matricula: studentId, planoOriginal: originalPlan, status: "Vigente"}).then(() => {
                setLoading(true)
                enqueueSnackbar('Contrato criado com sucesso! Aguarde um pouco, e clique em atualizar.', {title: 'Sucesso', variant: 'success', key:"0", persist: true, action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                setLoading(false)
                getData()
            }).catch(error => {
                enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                console.log(error)
                setLoading(false)
            })
            
            
        } else {
            //setContractState(null);
            console.log('test')
        }
    }, [newContract])

    

    const handleSaveData = async (e) => {
        e.preventDefault();
        // try {
        //     if (edit && Object.keys(contracts).length > 0) {
        //         form.current.requestSubmit();
        //         await studentsRef.child(studentId).child('contratos').set(contracts);
        //         enqueueSnackbar("Responsáveis atualizados com sucesso.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        //         setEdit(false)
        //     }
            
        // } catch (error) {
        //     console.log(error);
        //     enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        // }
        getData()

    }


    const handleAdd = async () => {
        setNewContract(true)
        setOpenDialog(false)
    }

    const handleDeleteContract = async (i) => {
        if (!isDisabled)
            try {
                console.log(i)
                await confirm({
                    variant: "danger",
                    catchOnCancel: true,
                    title: "Confirmação",
                    description: "Você deseja deletar e cancelar este contrato. Ao deletar este contrato ele automaticamente será cancelado, e se houver boletos com status 'Pendente' os mesmos serão mudados para o status cancelado."
                })
                // const key = Object.keys(contracts)[i]
                
                await studentsRef.child(studentId).child('contratos').child(i).remove()
                
                enqueueSnackbar("Exclusão de contrato solicitada. O sistema está cancelando e deletando o contrato em background.", {title: 'Sucesso', variant: 'info', persist: true, key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                getData()
            } catch (error) {
                console.log(error)
                error && enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            }
        else
            enqueueSnackbar('Não é possível deletar enquanto o aluno está desativado', {title: 'Erro', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        
    }

    const handleGenerateBillets = async (contractId) => {
        try {
            await confirm({
                variant: "danger",
                catchOnCancel: true,
                title: "Confirmação",
                description: "Você deseja gerar débitos/boletos para este aluno?"
            })
            let localContract = systemContracts.filter(contract => contract.codContrato === contractId)
            
            setContractSelected(contractId);
            localContract[0].hasOwnProperty('docsBoletos') && await confirm({
                    variant: "danger",
                    catchOnCancel: true,
                    title: "Confirmação",
                    description: "Já existem boletos gerados para este contrato, se quiser vê-los, cancele esta ação e clique na opção de Segunda Via. Se continuar, serão gerados novos débitos/boletos para este contrato. Deseja continuar?"
                })
            
            setLoading(true)
            const result = await generateBillets(studentId, contractId);
            console.log(result)
            setShowBillets(true)
            getData()
            enqueueSnackbar("Boletos gerados com sucesso.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        } catch (error) {
            console.log(error)
            error && enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        }
        setLoading(false)
    }

    const handleOnlyShowBillets = (contractId) => {
        setContractSelected(contractId);
        let localContract = systemContracts.filter(contract => contract.codContrato === contractId)
        if (localContract[0].hasOwnProperty('docsBoletos')) {
            setShowBillets(true)
        } else {
            enqueueSnackbar('Não existem boletos para este contrato. Clique em "Gerar Boletos".', {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        }
        
        
    }

    

    const ContractsCards = ({contractsCopy}) => {

        useEffect(() => {console.log(contractsCopy)}, [contractsCopy])
        
        const BuiltCards = contractsCopy.map((contract, i) => {
            
            return (
                <Card className={classes.smallCards} variant="outlined">
                    <CardContent>
                        <Grid
                            justifyContent="space-between"
                            direction="row"
                            container
                            spacing={1}
                        >
                            <Grid item>
                            <div>
                                
                                <Avatar className={classes.avatar}>
                                    
                                    <Receipt />
                                </Avatar>
                            </div>
                                
                            </Grid>

                            <Grid item>
                                <Typography variant="h5" component="h2">
                                    Contrato {i + 1}
                                    
                                </Typography>
                        
                                
                            </Grid>
                            <Grid item>
                                <IconButton color="secondary" style={{float: 'right'}}  disabled={Object.keys(contracts).length === 1} aria-label="delete contract" component="div" onClick={() => handleDeleteContract(i)}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Grid>
                        </Grid>
                        
                        
                        <hr />
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"Plano"}
                                defaultValue={contract.planoOriginal.nomePlano}
                                fullWidth
                                type="text"
                                size="small"
                                required
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"Curso"}
                                defaultValue={contract.planoOriginal.nomeCursoAdd}
                                fullWidth
                                type="text"
                                size="small"
                                required
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"Valor do Curso"}
                                defaultValue={contract.planoOriginal.valorCurso}
                                fullWidth
                                type="text"
                                size="small"
                                required
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"Valor total a ser pago"}
                                defaultValue={contract.planoOriginal.valorFinal}
                                fullWidth
                                type="text"
                                size="small"
                                required
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"Pagamentos iniciados em"}
                                defaultValue={contract.contratoConfigurado['ano-mes']}
                                fullWidth
                                type="text"
                                size="small"
                                required
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"Dia do vencimento"}
                                defaultValue={contract.contratoConfigurado.diasDeVencimento}
                                fullWidth
                                type="text"
                                size="small"
                                required
                            />
                        </Box>
                        <Button fullWidth variant="contained" className={classes.button} color="primary" onClick={() => handleGenerateBillets(contract.codContrato)}>Gerar Boletos</Button>
                        <Button fullWidth variant="contained" color="primary" onClick={() => handleOnlyShowBillets(contract.codContrato)}>Segunda via dos boletos</Button>
                    </CardContent>
                        
                </Card>
            
            
        )})

        return BuiltCards;
    }

    const fabStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    };

    return (
        <Fragment>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Escolha um curso</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Selecione o curso que o aluno irá fazer:
                </DialogContentText>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Curso</InputLabel>
                    <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={courseChosen}
                    onChange={(e) => setCourseChosen(e.target.value)}
                    fullWidth
                    >
                        {schoolCourses && schoolCourses.map((localCourse, i) => <MenuItem value={JSON.stringify({dadosTurma: {courseId: localCourse.id}})}>{localCourse.nomeCurso}</MenuItem>)}
                    </Select>
                </FormControl>
                </DialogContent>
                <DialogActions>
                <Button color="primary" onClick={() => setOpenDialog(false)}>
                    Fechar
                </Button>
                <Button onClick={handleAdd} disabled={courseChosen === undefined} color="primary">
                    Continuar
                </Button>
                </DialogActions>
            </Dialog>
            {showBillets && <PrintBillets open={showBillets} onClose={setShowBillets} studentId={studentId} contractId={contractSelected}/>}
            {newContract && <ContractConfigure activeStep={'newContract'} isOpen={newContract} setOpenDialog={setNewContract} />}
            <FullScreenDialog
                isOpen={isOpen}
                onClose={onClose}
                
                
                title={"Contratos"}
                hideSaveButton
              >
                <Backdrop className={classes.backdrop} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <form ref={form} onSubmit={handleSaveData} className={classes.container}>
                        
                        <ContractsCards contractsCopy={systemContracts} />
                    
                    

                    <Card className={classes.smallCards} variant="outlined">
                        <CardContent>
                            <Grid
                                justifyContent="flex-start"
                                direction="row"
                                container
                                spacing={1}
                            >
                                <Grid item>
                                    <Avatar className={classes.avatar}>
                                        <Add  />
                                    </Avatar>
                                </Grid>

                                <Grid item>
                                    <Typography variant="h5" component="h2">
                                        Novo Contrato
                                    </Typography>
                            
                            
                                </Grid>
                            </Grid>
                            <hr />
                            <div className={classes.center}>
                                <Tooltip title="Novo contrato">
                                    {isDisabled ? (<p>Reative o estudante para criar contratos</p>) :( 
                                    <IconButton color="primary" disabled={edit} aria-label="upload picture" component="span" onClick={() => setOpenDialog(true)}>
                                        <Add fontSize="large" />
                                    </IconButton>)}
                                </Tooltip>
                                
                            </div>
                            
                        </CardContent>
                            
                    </Card>

                </form>
                <div>
                    <Fab onClick={() => getData()} style={fabStyle} variant="extended" color='primary'>
                    <Refresh className={classes.extendedIcon} />
                        Atualizar
                    </Fab>
                </div>
              </FullScreenDialog>
            
            

        </Fragment>
    );
}
 
export default StudentContracts;