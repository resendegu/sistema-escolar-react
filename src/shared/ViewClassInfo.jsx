import { Avatar, Backdrop, Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, MenuItem, Select, Tooltip, Typography } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { AccountBox, Add, Assignment, Assistant, AttachFile, ChromeReaderMode, Clear, DeleteForever, Description, DoneAll, Edit, Grade, Lock, LockOpen, Person, Print, School, SupervisedUserCircle, TransferWithinAStation } from "@material-ui/icons";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";

import { classesRef, coursesRef, teachersListRef } from '../services/databaseRefs'
import { LocaleText } from "./DataGridLocaleText";
import FullScreenDialog from "./FullscreenDialog";
import { handleEnableDisableStudents, handleTransferStudents, handleAddTeacher } from "./FunctionsUse";
import StudentFiles from "./StudentFiles";
import StudentInfo from "./ViewStudentInfo";

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
    bigCards: {
      minWidth: 275,
      maxWidth: 600,
      height: "84vh",
      marginLeft: "10px",
      width: "100%",
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

const ClassInfo = (props) => {

    const { classDataRows } = props;
    const classes = useStyles();
    const classCode = classDataRows.id
    const classRef = classesRef.child(classCode)

    const [classData, setClassData] = useState({});
    const [courseData, setCourseData] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [teachers, setTeachers] = useState([])
    const [students, setStudents] = useState([]);
    const [studentInfo, setStudentInfo] = useState({});
    const [loader, setLoader] = useState(true);
    const [open, setOpen] = useState(false);
    const [filterModel, setFilterModel] = useState({
      items: [],
  });
    const [classesCodes, setClassesCodes] = useState([]);
    const [classCodeTransfer, setClassCodeTransfer] = useState('');
    const [ openDialog, setOpenDialog ] = useState(false);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const [desablingStudent, setDesablingStudent] = useState(false);
    const [addingTeacher, setAddingTeacher] = useState(false);
    const [teachersList, setTeachersList] = useState([]);
    const [chosenTeacher, setChosenTeacher] = useState('');

    
    useEffect(() => {
      
      getData();
      
    }, [])

    const getData = async () => {
      setLoader(true)
      try {
        let classes = (await (classesRef.once('value'))).val()
          let classesArray = Object.keys(classes)
          setClassesCodes(classesArray.filter(classroomCode => classroomCode !== classCode))
          setClassCodeTransfer(classesArray[0])
        let data = (await classRef.once('value')).val();
        let courseData = (await coursesRef.child(data.curso).once('value')).val();
        let teachers = (await teachersListRef.once('value')).val();
        let teachersArray = []
        for (const uid in teachers) {
          if (Object.hasOwnProperty.call(teachers, uid)) {
            const teacher = teachers[uid];
            teachersArray.push({email: teacher.email, nome: teacher.nome})
          }
        }
        setTeachersList(teachersArray);
        console.log(data)
        if (data && courseData) {
          setClassData(data);
          if (data.hasOwnProperty('professor')) {
            setTeachers(data.professor)
          }
          setCourseData(courseData);
          let students = data.alunos
          let studentsArray = []
          for (const id in students) {
            if (Object.hasOwnProperty.call(students, id)) {
              let student = students[id];
              student.id = id
              studentsArray.push(student)
            }
          }
          setStudents(studentsArray)
        }
        setLoader(false);

      } catch (error) {
        console.log(error)
      }
      
    }
    
    const handleAddRow = () => {
      // let rowsArray = JSON.parse(JSON.stringify(rows))
      // rowsArray.push({id: rowsArray.length, label: 'Digite um nome...', placeholder: 'Digite...', required: false})
      // setRows(rowsArray)
      // console.log(rowsArray)
  }

  const handleRowEdit = async (editedRow) => {
      // setLoading(true);
      // console.log(editedRow);
      // let rowsArray = JSON.parse(JSON.stringify(rows))
      // let rowIndex = rowsArray.findIndex(row => row.id === editedRow.id);
      // rowsArray[rowIndex][editedRow.field] = editedRow.value;
      // setRows(rowsArray);
      // console.log(rowsArray)
      // try {
      //     await additionalFieldsRef.set(rowsArray)
      //     setLoading(false)
      // } catch (error) {
      //     console.log(error)
      //     setLoading(false);
      //     throw new Error(error.message)
      // }
      
  }

  const handleRowSelection = (selectedRows) => {
      console.log(selectedRows)
      setSelectedRows(selectedRows)
  }

  const handleDeleteRows = async () => {
      // setLoading(true)
      // let rowsArray = JSON.parse(JSON.stringify(rows));
      // let updatedRows = rowsArray.filter(row => selectedRows.indexOf(row.id) === -1);
      // console.log(updatedRows);
      
      // // try {
      // //     await additionalFieldsRef.set(updatedRows);
      // //     setRows(updatedRows);
      // //     setLoading(false);
      // // } catch (error) {
      // //     console.log(error);
      // //     setLoading(false);
      // //     throw new Error(error.message);
      // // }
  }

  const handleRowClick = (e) => {
    console.log(e)
    setStudentInfo({id: e.id, classCode: classCode})
    setOpen(true);
  }

  const handleTeacherClick = (e) => {
    console.log(e)
  }

  const handleDeleteTeacher = (e) => {
    console.log(e)
    // TODO
  }


  const handleConfirmTransfer = () => {
    setAddingTeacher(false)
    setDesablingStudent(false)
    setOpenDialog(true)
  }

  const handleTransfer = async () => {
    setOpenDialog(false)
    setLoader(true)
    try {
        let message = await handleTransferStudents(classCode, classCodeTransfer, selectedRows)
        getData()
        enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        setLoader(false)
    } catch (error) {
        getData()
        enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        setLoader(false)
    }
  }

  const handleConfirmDisable = () => {
    setAddingTeacher(false)
    setDesablingStudent(true)
    setOpenDialog(true) 
  }

const handleDisableStudents = async () => {
    setAddingTeacher(false)
    setOpenDialog(false)
    setLoader(true)
    try {
        let message = await handleEnableDisableStudents(selectedRows)
        getData()
        enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        setLoader(false)
    } catch (error) {
        getData()
        enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        setLoader(false)
    }
}

  const handleConfirmAddTeacher = () => {
    setAddingTeacher(true)
    setDesablingStudent(false)
    setOpenDialog(true)
  }

  const handleTeacherAdding = async () => {
    setOpenDialog(false)
    setLoader(true)
    try {
        let message = await handleAddTeacher(chosenTeacher, classCode);
        getData()
        enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        setLoader(false)
    } catch (error) {
        getData()
        enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        setLoader(false)
    }
  }

    return ( 
        <Fragment>
          <Dialog 
                 aria-labelledby="confirmation-dialog-title"
                 open={openDialog}
                 onClose={() => setOpenDialog(false)}
              >
                <DialogTitle id="confirmation-dialog-title">Você confirma esta ação?</DialogTitle>
                <DialogContent>
                    <DialogContentText>{addingTeacher ? 'Você está adicionando um(a) professor(a) á esta turma. Escolha o(a) professor(a):' : (desablingStudent ? `Você está desativando ${selectedRows.length} alunos.` : `Você está transferindo ${selectedRows.length} alunos. Escolha a turma de destino:`)}</DialogContentText>
                    
                    {(!desablingStudent || addingTeacher) &&
                      <Select 
                        autoFocus
                        fullWidth
                        required
                        onChange={(e) => addingTeacher ? setChosenTeacher(e.target.value) : setClassCodeTransfer(e.target.value)}
                        value={addingTeacher ? chosenTeacher : classCodeTransfer}
                      >
                      
                      {addingTeacher ? (teachersList.map((teacher, i) => <MenuItem value={teacher.email}>{teacher.nome} ({teacher.email})</MenuItem>)) : (classesCodes.map((id, i) => <MenuItem value={id}>{id}</MenuItem>))}
                      </Select>}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={addingTeacher ? handleTeacherAdding : (desablingStudent ? handleDisableStudents : handleTransfer)} variant="contained" color="primary" autoFocus>
                        Sim, continuar
                    </Button>
                </DialogActions>
            </Dialog>
            <Backdrop open={loader} className={classes.backdrop}><CircularProgress color="inherit" /></Backdrop>
          <FullScreenDialog 
                isOpen={open}
                onClose={() => {
                    setOpen(false);
                }}
                hideSaveButton
                onSave={() => {
                    alert('Save clicked')
                }}
                title={"Informações do aluno"}
                saveButton={"Salvar"}
                saveButtonDisabled={true}
            > 
                <StudentInfo studentInfo={studentInfo} />
          </FullScreenDialog>
            <div style={{position: 'absolute'}}>
              <Backdrop className={classes.backdrop} open={loader}>
                <CircularProgress color="inherit" />
              </Backdrop>
            </div>
              <div className={classes.container}>
                <Card className={classes.smallCards} variant="outlined" >
                  <CardContent>
                  <Grid 
                      justifyContent="flex-start"
                      direction="row"
                      container
                      spacing={1}
                    >
                      <Grid item>
                        <Tooltip title={(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? 'Turma aberta' : 'Turma Fechada'}>
                          <Avatar className={classes.avatar} style={{backgroundColor: `${(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? '#38a800' : 'red'}`}}>
                            {(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? <LockOpen /> : <Lock />}
                          </Avatar>
                        </Tooltip>
                      </Grid>

                      <Grid item>
                        <Typography variant="h5" component="h2">
                          Dados da turma
                        </Typography>
                        
                        
                      </Grid>
                    </Grid>
                    <hr />
                    <Typography className={classes.title} color="textPrimary" gutterBottom>
                      Código da Turma: {classData.codigoSala}
                    </Typography>
                    <Grid 
                      justifyContent="flex-start"
                      direction="row"
                      container
                      spacing={1}
                    >
                     

                      <Grid item>
                        
                        <Typography className={classes.pos} color="textSecondary">
                          Curso: {courseData.nomeCurso}
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">
                          Horário de Aula: {classData.hasOwnProperty('hora') && (classData.hora.indexOf('_') === -1 ? classData.hora + ':00' : classData.hora.split('_').join(':'))} {(classData.horarioTerminoTurma !== '' && classData.horarioTerminoTurma !== undefined) && ('ás ' + classData.horarioTerminoTurma)}h
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">

                        </Typography>
                        
                      </Grid>
                    </Grid>
                    
                    <Typography className={classes.title} color="textPrimary" gutterBottom>
                      Lista de professores
                    </Typography>
                    <List component="nav" aria-label="professores cadastrados">
                      {teachers.map((teacher, i) => (
                        <ListItem divider button onClick={handleTeacherClick}>
                          <ListItemText className={classes.list}>{teacher.nome} ({teacher.email}) </ListItemText>
                          <ListItemSecondaryAction onClick={handleDeleteTeacher}>
                            <IconButton edge="end" aria-label="delete">
                              <Clear />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      
                      
                      
                    </List>

                    
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
                        <Avatar className={classes.orange} className={classes.avatar}>
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
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Add />} onClick={handleConfirmAddTeacher}> Add professores</Button>
                      </Box>
                      <Box  m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Edit />}>Editar dados</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<DeleteForever />}>Excluir turma</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Grade />}>Distribuir notas</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Print />}>Diário de classe</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? <Lock /> : <LockOpen />}>{(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? 'Fechar ' : 'Abrir '}turma</Button>
                      </Box>
                      {/* <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Lock />}disabled={(!classData.hasOwnProperty('status') || classData.status.turma === 'fechada')}>Fechar turma</Button>
                      </Box> */}
                      
                      
                      </CardContent>
                      
                    </Card>
                  

                  
                    <Card className={classes.bigCards} variant="outlined">
                      <CardContent>
                      <Grid 
                        justifyContent="flex-start"
                        direction="row"
                        container
                        spacing={1}
                      >
                        <Grid item>
                          <Avatar className={classes.orange} className={classes.avatar}>
                            <School />
                          </Avatar>
                        </Grid>

                        <Grid item>
                          <Typography variant="h5" component="h2">
                            Alunos da turma
                          </Typography>
                          
                          
                        </Grid>
                      </Grid>
                      <hr />
                      <div style={{ height: "62vh", width: '100%' }}>
                        <DataGrid 
                          filterModel={filterModel}
                          onFilterModelChange={(model) => setFilterModel(model)}
                          rows={students} 
                          columns={
                              [
                                  {field: 'nome', headerName: 'Nome', width: 200},
                                  {field: 'id', headerName: 'Matrícula', width: 140},
                                  
                              ]
                          } 
                          disableSelectionOnClick 
                          checkboxSelection
                          components={{
                              Toolbar: GridToolbar

                          }}
                          onCellEditCommit={handleRowEdit}
                          loading={loader}
                          localeText={LocaleText}
                          onSelectionModelChange={handleRowSelection}
                          onRowClick={handleRowClick}
                        />
                        {selectedRows.length > 0 && 
                          <div className={classes.container}>
                            <Button size="medium" variant="contained" color="primary" startIcon={<TransferWithinAStation />} onClick={handleConfirmTransfer}>Transferir</Button>
                            <Button size="medium" variant="contained" color="secondary" startIcon={<Clear />} onClick={handleConfirmDisable}>Desativar</Button>
                          </div>
                        }
                        
                      </div>
                      
                        </CardContent>
                    </Card>
                  
                  
                  
                    
                  

                  
                  
                
              
             </div>
         
            
          
          
            
            
            
        </Fragment>
     );
}
 
export default ClassInfo;