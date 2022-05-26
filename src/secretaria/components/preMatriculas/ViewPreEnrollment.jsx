import { Avatar, Backdrop, Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, List, ListItem, ListItemText, makeStyles, MenuItem, Select, Typography } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { AccountBox, Assignment, Assistant, AttachFile, Check, CheckCircle, ChromeReaderMode, Description, DoneAll, Edit, NotInterested, Person, Print, School, SupervisedUserCircle, TransferWithinAStation } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { preEnrollmentsRef } from "../../../services/databaseRefs";
import BaseDocument from "../../../shared/BaseDocument";
import EditStudentData from "../../../shared/EditStudentData";
import StudentContracts from "../../../shared/StudentContracts";
import StudentDataCard from "../../../shared/StudentDataCard";
import StudentFiles from "../../../shared/StudentFiles";
import ViewParentsInfo from "../../../shared/ViewParentsInfo";



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

const ViewPreEnrollment = ({ studentInfo, changeTab }) => {

    const classes = useStyles();

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

    useEffect(() => {
      
      getData();
      
    }, [classCode, studentId])

    const getData = async () => {
      try {
        
        let studentData = (await preEnrollmentsRef.child(studentId).once('value')).val()
    
        console.log(studentData);
        studentData && setStudentData(studentData)
    
      } catch (error) {
        console.log(error)
      }
      
    }


    const handleOpenParentsDialog = () => {
    setOpenParentsDialog(true);
    }

    const handleOpenEditStudentInfo = () => {
    setOpenEditStudentsInfo(true)
    }

    const handleOpenContractsDialog = () => {
    setOpenContractsDialog(true);
    }

    const handleOpenStudentPDF = () => {
      window.location.hash = `preMatricula?${studentId}`
      setOpenStudentPDF(true);
    }

    const handleEnrollStudent = async () => {
      sessionStorage.setItem(0, JSON.stringify(studentData))
      sessionStorage.setItem(2, JSON.stringify(studentData))
      changeTab('', 3)
      enqueueSnackbar("Dados da pré matrícula carregados. Prossiga com a matrícula.", {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
    }

    return ( 
        <Fragment>
              {openStudentPDF && <BaseDocument open={openStudentPDF} onClose={setOpenStudentPDF} />}
              {openContractsDialog && <StudentContracts studentId={studentId} isDisabled={disabledStudent} isOpen={openContractsDialog} onClose={() => {
                  setOpenContractsDialog(false);
              }}/>}

              <ViewParentsInfo studentId={studentId} isDisabled={disabledStudent} preEnrollment isOpen={openParentsDialog} onClose={() => {
                  setOpenParentsDialog(false);
              }}/>

              <EditStudentData studentId={studentId} isOpen={openEditStudentsInfo} preEnrollment onClose={() => setOpenEditStudentsInfo(false)} />
              
              
              <Backdrop open={loading} className={classes.backdrop}><CircularProgress color="inherit" /></Backdrop>
              <div className={classes.container}>
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
                    
                      <Box  m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Edit />} onClick={handleOpenEditStudentInfo}>Editar dados</Button>
                      </Box>
                      
                      
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" onClick={handleOpenStudentPDF} startIcon={<Print />}>Ficha de Matrícula</Button>
                      </Box>
                      
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<SupervisedUserCircle />} onClick={handleOpenParentsDialog}>Responsáveis</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" onClick={handleEnrollStudent} startIcon={<CheckCircle />}>Efetivar matrícula</Button>
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
                      
                        <StudentFiles studentId={studentId} disabledStudent={disabledStudent} preEnrollment />
                        
                      </CardContent>
                      <CardActions>
                        <Button size="small"></Button>
                      </CardActions>
                    </Card>
                  

                  
                  
                
              
             </div>
         
            
          
          
            
            
            
        </Fragment>
     );
}
 
export default ViewPreEnrollment;