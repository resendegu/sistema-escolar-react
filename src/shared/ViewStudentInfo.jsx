import { Avatar, Backdrop, Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, Grid, IconButton, List, ListItem, ListItemText, makeStyles, MenuItem, Select, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { AccountBox, Assignment, Assistant, AttachFile, Check, ChromeReaderMode, Close, Description, DoneAll, Edit, NotInterested, Person, Print, Refresh, School, Speed, Star, SupervisedUserCircle, TransferWithinAStation } from "@material-ui/icons";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";

import { classesRef, disabledStudentsRef, studentsRef } from '../services/databaseRefs'
import BaseDocument from "./BaseDocument";
import EditStudentData from "./EditStudentData";
import FollowUp from "./FollowUp";
import FullScreenDialog from "./FullscreenDialog";
import { handleEnableDisableStudents, handleTransferStudents } from "./FunctionsUse";
import ReleaseGrades from "./ReleaseGrades";
import ReleasePerformance from "./ReleasePerformance";
import StudentContracts from "./StudentContracts";
import StudentDataCard from "./StudentDataCard";
import StudentFiles from "./StudentFiles";
import ViewParentsInfo from "./ViewParentsInfo";
import ViewStudentHistory from "./ViewStudentHistory";

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
      zIndex: theme.zIndex.drawer + 2,
      color: '#fff',
    },
    rootSpeedDial: {
      height: 380,
      transform: 'translateZ(0px)',
      flexGrow: 1,
      
    },
    speedDial: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
      
    },
    actionButtons: {
      zIndex: 99999999999999999,
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
      zIndex: theme.zIndex.drawer + 1,
    },
  }));

const StudentInfo = ({ studentInfo, teacherView=false }) => {

    
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const classCode = studentInfo.classCode
    const studentId = studentInfo.id
    const disabledStudent = studentInfo.disabled

    const [ openDialog, setOpenDialog ] = useState(false);
    const [ openParentsDialog, setOpenParentsDialog ] = useState(false);
    const [ openEditStudentsInfo, setOpenEditStudentsInfo ] = useState(false);
    const [ openFollowUp, setOpenFollowUp ] = useState(false);
    const [ openContractsDialog, setOpenContractsDialog ] = useState(false);
  
    const [ loading, setLoading ] = useState(false);

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const [studentData, setStudentData] = useState({});
    const [academicData, setAcademicData] = useState({});
    const [currentGrade, setCurrentGrade] = useState('Notas não lançadas');
    const [classesCodes, setClassesCodes] = useState([]);
    const [classCodeEnable, setClassCodeEnable] = useState('');
    const [desablingStudent, setDesablingStudent] = useState(false);
    const [classCodeTransfer, setClassCodeTransfer] = useState('');
    const [openStudentPDF, setOpenStudentPDF] = useState(false);
    const [openStudentHistory, setOpenStudentHistory] = useState(false);
    const [openReleaseGrades, setOpenReleaseGrades] = useState(false);
    const [openReleasePerformanceGrades, setOpenReleasePerformanceGrades] = useState(false);
    const [actions, setActions] = useState([]);
    const [hiddenSpeedDial, setHiddenSpeedDial] = useState(false);
    const [openSpeedDial, setOpenSpeedDial] = useState(false);
    const [openFilesDialog, setOpenFilesDialog] = useState(false);

    useEffect(() => {
      
      getData();
      
    }, [classCode, studentId, openEditStudentsInfo])

    

    const getData = async () => {
      setLoading(true)
      try {
        if (disabledStudent || !desablingStudent) {
          let classes = (await (classesRef.once('value'))).val()
          let classesArray = Object.keys(classes)
          setClassesCodes(classesArray)
          setClassCodeEnable(classesArray[0])
        }
        console.log(disabledStudent)
        let data = await classesRef.child(classCode).child('alunos').child(studentId).once('value');
        let studentData = !disabledStudent ? (await studentsRef.child(studentId).once('value')).val() : (await disabledStudentsRef.child(studentId + '/dadosAluno').once('value')).val()
    
        console.log(studentData);
        studentData && setStudentData(studentData)
        data.exists() && setAcademicData(data.val());
        data.exists() && calculateGrade(data.val().notas);
        console.log(data.val())
        // Filtering action buttons
        let actionButtons = []
        if (teacherView) {
          actionButtons.push({ icon: <Star />, name: 'Notas', onClick: handleOpenReleaseGrades, })
          actionButtons.push({ icon: <Speed />, name: 'Desempenho', onClick: handleOpenReleasePerformanceGrades, })
        } else {
          actionButtons.push({ icon: <TransferWithinAStation />, name: 'Transferir', onClick: handleConfirmTransfer, disabled: disabledStudent, })
          actionButtons.push({ icon: <Edit />, name: 'Editar dados', onClick: handleOpenEditStudentInfo, })
          actionButtons.push({ icon: <DoneAll />, name: 'Checklist', onClick: handleOpenChecklist, disabled: disabledStudent,})
          actionButtons.push({ icon: <Description />, name: 'Contratos', onClick: handleOpenContractsDialog, })
          actionButtons.push({ icon: <Print />, name: 'Ficha de Matrícula', onClick: handleOpenStudentPDF, })
          actionButtons.push({ icon: disabledStudent ? <Check /> : <NotInterested />, name: disabledStudent ? 'Reativar' : 'Desativar', onClick: disabledStudent ? handleConfirmEnable : handleConfirmDisable, })
        }
        actionButtons.push({ icon: <Assignment />, name: 'Follow Up', onClick: handleOpenFollowUp, })
        actionButtons.push({ icon: <SupervisedUserCircle />, name: 'Responsáveis', onClick: handleOpenParentsDialog, })
        actionButtons.push({ icon: <Refresh />, name: 'Atualizar dados', onClick: getData, })

        setActions(actionButtons)
        // setActions([
        //   { icon: <TransferWithinAStation />, name: 'Transferir', onClick: handleConfirmTransfer, disabled: disabledStudent, },
        //   { icon: <Edit />, name: 'Editar dados', onClick: handleOpenEditStudentInfo, },
        //   { icon: <DoneAll />, name: 'Checklist', onClick: handleOpenChecklist, disabled: disabledStudent,},
        //   { icon: <Description />, name: 'Contratos', onClick: handleOpenContractsDialog, },
        //   { icon: <Print />, name: 'Ficha de Matrícula', onClick: handleOpenStudentPDF, },
        //   { icon: <Assignment />, name: 'Follow Up', onClick: handleOpenFollowUp, },
        //   { icon: <SupervisedUserCircle />, name: 'Responsáveis', onClick: handleOpenParentsDialog, },
        //   { icon: disabledStudent ? <Check /> : <NotInterested />, name: disabledStudent ? 'Reativar' : 'Desativar', onClick: disabledStudent ? handleConfirmEnable : handleConfirmDisable, },
        //   { icon: <Star />, name: 'Notas', onClick: handleOpenReleaseGrades, },
        //   { icon: <Speed />, name: 'Desempenho', onClick: handleOpenReleasePerformanceGrades, },
        //   { icon: <Refresh />, name: 'Atualizar dados', onClick: getData, },
        // ])
      } catch (error) {
        console.log(error)
      }
      setLoading(false)
    }

    const calculateGrade = (grades) => {
      let finalGrade = 0;
      for (const name in grades) {
        if (Object.hasOwnProperty.call(grades, name)) {
          const grade = grades[name];
          finalGrade += Number(grade);
        }
      }
      setCurrentGrade(finalGrade);
    }

    const handleConfirmDisable = () => {
      setDesablingStudent(true)
      setOpenDialog(true)
    }

  const handleDisableStudent = async () => {
      setOpenDialog(false)
      setLoading(true)
      try {
          let message = await handleEnableDisableStudents(studentId)
          
          enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
          setLoading(false)
      } catch (error) {
          
          enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
          setLoading(false)
      }
  }

  const handleConfirmEnable = () => {
    setDesablingStudent(true)
    setOpenDialog(true)
  }

  const handleEnableStudent = async () => {
    setOpenDialog(false)
    setLoading(true)
    try {
        let message = await handleEnableDisableStudents(studentId, classCodeEnable, 'ativa')
        
        enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        setLoading(false)
    } catch (error) {
        
        enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        setLoading(false)
    }
}
    
const handleConfirmTransfer = () => {
  setDesablingStudent(false)
  setOpenDialog(true)
}

const handleTransfer = async () => {
  setOpenDialog(false)
  setLoading(true)
  try {
      let message = await handleTransferStudents(classCode, classCodeTransfer, studentId)
      getData()
      enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
      setLoading(false)
  } catch (error) {
      getData()
      enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
      setLoading(false)
  }
}

const handleOpenParentsDialog = () => {
  setOpenParentsDialog(true);
}

const handleOpenEditStudentInfo = () => {
  setOpenEditStudentsInfo(true)
}

const handleOpenFollowUp = () => {
  setOpenFollowUp(true)
  //enqueueSnackbar('O FollowUp está em fase de desenvolvimento 😊', {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
}

const handleOpenContractsDialog = () => {
  setOpenContractsDialog(true);
}

const handleOpenStudentPDF = () => {
  window.location.hash = `fichaCadastral?${studentId}`
  setOpenStudentPDF(true);
}

const handleOpenStudentHistory = () => {
  setOpenStudentHistory(true)
}

const handleOpenChecklist = () => {
  enqueueSnackbar('O Checklist está em fase de desenvolvimento 😊', {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
}

const handleOpenReleaseGrades = () => {
  setOpenReleaseGrades(true)
}
const handleOpenReleasePerformanceGrades = () => {
  setOpenReleasePerformanceGrades(true)
}

const handleVisibilitySpeedDial = () => {
  setHiddenSpeedDial((prevHidden) => !prevHidden);
};

const handleOpenSpeedDial = () => {
  setOpenSpeedDial(true);
};

const handleCloseSpeedDial = () => {
  setOpenSpeedDial(false);
};

const handleOpenFilesDialog = () => {
  setOpenFilesDialog(true)
}

const handleCloseFilesDialog = () => {
  setOpenFilesDialog(false)
}

    return ( 
        <Fragment>
              {!disabledStudent && <ReleasePerformance classCode={classCode} studentsIds={[studentId]} onClose={setOpenReleasePerformanceGrades} open={openReleasePerformanceGrades} refresh={getData} />}
              {!disabledStudent && <ReleaseGrades classCode={classCode} studentsIds={[studentId]} onClose={setOpenReleaseGrades} open={openReleaseGrades} refresh={getData} />}

              {openStudentPDF && <BaseDocument open={openStudentPDF} onClose={setOpenStudentPDF}  />}

              <ViewStudentHistory isDisabled={false} studentId={studentId} isOpen={openStudentHistory} onClose={setOpenStudentHistory} />

              <StudentContracts studentId={studentId} isDisabled={disabledStudent} isOpen={openContractsDialog} onClose={() => {
                  setOpenContractsDialog(false);
              }}/>

              <ViewParentsInfo studentId={studentId} isDisabled={disabledStudent} isOpen={openParentsDialog} onClose={() => {
                  setOpenParentsDialog(false);
              }}/>

              <EditStudentData studentId={studentId} isOpen={openEditStudentsInfo} onClose={() => setOpenEditStudentsInfo(false)} />

              <FollowUp isOpen={openFollowUp} onClose={() => setOpenFollowUp(false)} studentId={studentId} />

              {!teacherView && <Fab variant="extended" color="primary" onClick={handleOpenFilesDialog} className={classes.fab}>
                <AttachFile className={classes.extendedIcon} />
                Arquivos
              </Fab>}

              <Dialog
                fullScreen={fullScreen}
                open={openFilesDialog}
                onClose={handleCloseFilesDialog}
                aria-labelledby="responsive-dialog-title"
              >
                <DialogTitle id="responsive-dialog-title">Arquivos <IconButton style={{float: 'right'}} onClick={handleCloseFilesDialog}><Close /></IconButton></DialogTitle>
                <DialogContent>
              
                  
                    <StudentFiles studentId={studentId} disabledStudent={disabledStudent} />
                    
                 
                </DialogContent>
                <DialogActions>
                  <Button autoFocus onClick={handleCloseFilesDialog} color="primary">
                    Fechar
                  </Button>
                  
                </DialogActions>
              </Dialog>
              
              <Dialog 
                 aria-labelledby="confirmation-dialog-title"
                 open={openDialog}
                 onClose={() => setOpenDialog(false)}
              >
                <DialogTitle id="confirmation-dialog-title">Você confirma esta ação?</DialogTitle>
                <DialogContent>
                    <DialogContentText>{desablingStudent ? `Você está ${disabledStudent ? 'ativando' : 'desativando'} este aluno.` : `Você está transferindo este aluno. Escolha a turma de destino:`}</DialogContentText>
                    {(disabledStudent || !desablingStudent) && 
                    <Select 
                      autoFocus
                      fullWidth
                      required
                      onChange={!desablingStudent ? (e) => setClassCodeTransfer(e.target.value) : (e) => setClassCodeEnable(e.target.value)}
                      value={!desablingStudent ? classCodeTransfer : classCodeEnable}
                    >
                      
                      {classesCodes.map((id, i) => <MenuItem value={id}>{id}</MenuItem>)}
                      </Select>}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={desablingStudent ? (disabledStudent ? handleEnableStudent : handleDisableStudent) : handleTransfer } variant="contained" color="primary" autoFocus>
                        Sim, continuar
                    </Button>
                </DialogActions>
            </Dialog>
              <Backdrop open={loading} className={classes.backdrop}><CircularProgress color="inherit" /></Backdrop>

              <div className={classes.rootSpeedDial}>
                {/* <Button onClick={handleVisibilitySpeedDial}>Toggle Speed Dial</Button> */}
                {/* <Backdrop open={openSpeedDial} className={classes.backdrop} />
                <SpeedDial
                  ariaLabel="Ações"
                  className={classes.speedDial}
                  hidden={hiddenSpeedDial}
                  icon={<Assistant />}
                  onClose={handleCloseSpeedDial}
                  onOpen={handleOpenSpeedDial}
                  open={openSpeedDial}
                  direction="left"
                  
                >
                  {actions.map((action) => (
                    <SpeedDialAction
                      key={action.name}
                      icon={action.icon}
                      tooltipTitle={action.name}
                      tooltipPlacement="top"
                      
                      className={classes.actionButtons}
                      onClick={() => {handleCloseSpeedDial(); action.onClick()}}
                    />
                  ))}
                </SpeedDial> */}

                <div className={classes.container} id="noprint">
                  <StudentDataCard studentData={studentData} />
              
                  
                    
                      <Card className={classes.smallCards} variant="outlined">
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
                        {!teacherView && <Box  m={1}>
                          <Button fullWidth size="large" variant="contained" color="primary" startIcon={<TransferWithinAStation />} disabled={disabledStudent} onClick={handleConfirmTransfer}>Transferir</Button>
                        </Box>}
                        {!teacherView && <Box  m={1}>
                          <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Edit />} onClick={handleOpenEditStudentInfo}>Editar dados</Button>
                        </Box>}
                        {!teacherView && <Box m={1}>
                          <Button fullWidth size="large" variant="contained" color="primary" startIcon={<DoneAll />} disabled={disabledStudent} onClick={handleOpenChecklist}>Checklist</Button>
                        </Box>}
                        {!teacherView && <Box m={1}>
                          <Button fullWidth size="large" variant="contained" color="primary" onClick={handleOpenContractsDialog} startIcon={<Description />}>Contratos</Button>
                        </Box>}
                        {!teacherView && <Box m={1}>
                          <Button fullWidth size="large" variant="contained" color="primary" onClick={handleOpenStudentPDF} startIcon={<Print />}>Ficha de Matrícula</Button>
                        </Box>}
                        <Box m={1}>
                          <Button fullWidth size="large" variant="contained" color="primary" onClick={handleOpenFollowUp} startIcon={<Assignment />}>Follow Up</Button>
                        </Box>
                        <Box m={1}>
                          <Button fullWidth size="large" variant="contained" color="primary" startIcon={<SupervisedUserCircle />} onClick={handleOpenParentsDialog}>Responsáveis</Button>
                        </Box>
                        {!teacherView && <Box m={1}>
                          <Button fullWidth size="small" variant="contained" color={"secondary"} startIcon={disabledStudent ? <Check /> :<NotInterested />} onClick={disabledStudent ? handleConfirmEnable : handleConfirmDisable}>{disabledStudent ? 'Reativar' : 'Desativar'}</Button>
                        </Box>}
                        {teacherView && <Box m={1}>
                          <Button fullWidth size="small" variant="contained" color={"secondary"} startIcon={<Star />} onClick={handleOpenReleaseGrades}>Notas</Button>
                        </Box>}
                        {teacherView && <Box m={1}>
                          <Button fullWidth size="small" variant="contained" color={"secondary"} startIcon={<Speed />} onClick={handleOpenReleasePerformanceGrades}>Desempenho</Button>
                        </Box>}
                        <Box m={1}>

                          <Button fullWidth size="small" variant="outlined" color={"primary"} startIcon={<Refresh />} onClick={getData}>Atualizar dados</Button>
                        </Box>
                        
                        </CardContent>
                        
                      </Card>
                    

                    
                      <Card className={classes.smallCards} variant="outlined">
                        <CardContent>
                        <Grid 
                          justifyContent="flex-start"
                          direction="row"
                          container
                          spacing={1}
                        >
                          <Grid item>
                            <Avatar className={classes.orange}>
                              <School />
                            </Avatar>
                          </Grid>

                          <Grid item>
                            <Typography variant="h5" component="h2">
                              Dados acadêmicos
                            </Typography>
                            
                            
                          </Grid>
                        </Grid>
                        <hr />
                          
                          
                          <Typography className={classes.pos} color="textSecondary">
                            Turma atual: {classCode}
                          </Typography>
                          
                          <Typography variant="h6" component="h6">
                              Notas de Desempenho
                          </Typography>
                          {academicData.hasOwnProperty('desempenho') ? Object.keys(academicData.desempenho).map((name, i) => (
                            <Typography className={classes.grades} color="textSecondary">
                              {name}: {academicData.desempenho[name]}
                            </Typography>
                          )) : 'Notas não lançadas'}
                          <Typography variant="h6" component="h6">
                              Somatório Geral
                          </Typography>
                          <Typography className={classes.grades} color="textSecondary">
                              Nota final: {currentGrade}
                          </Typography>
                          <Typography variant="h6" component="h6">
                              Faltas Registradas
                          </Typography>
                          {academicData.hasOwnProperty('frequencia') ? Object.keys(academicData.frequencia).map((name, i) => {
                            let date = new Date(name)
                            let dateConverted = date.toISOString().substring(0, 10).split('-').reverse().join('/')
                            return (
                            <Typography className={classes.grades} color="textSecondary">
                              {i + 1}: {dateConverted}
                            </Typography>
                          )}) : 'Não há registro de faltas'}
                        </CardContent>
                        <CardActions>
                          <Button size="small" variant='outlined' color="primary" onClick={handleOpenStudentHistory} fullWidth startIcon={<ChromeReaderMode />}>Acessar histórico escolar</Button>
                        </CardActions>
                      </Card>
                    
                    
                    
                      {/* {!teacherView && <Card className={classes.smallCards} variant="outlined">
                        <CardContent>
                        <Grid 
                          justifyContent="flex-start"
                          direction="row"
                          container
                          spacing={1}
                        >
                          <Grid item>
                            <Avatar className={classes.avatar}>
                              <AttachFile />
                            </Avatar>
                          </Grid>

                          <Grid item>
                            <Typography variant="h5" component="h2">
                              Arquivos
                            </Typography>
                            
                            
                          </Grid>
                        </Grid>
                        <hr />
                        
                          <StudentFiles studentId={studentId} disabledStudent={disabledStudent} />
                          
                        </CardContent>
                        <CardActions>
                          <Button size="small"></Button>
                        </CardActions>
                      </Card>} */}
                    

                    
                    
                  
                
              </div>
              </div>
              
         
            
          
          
            
            
            
        </Fragment>
     );
}
 
export default StudentInfo;