import FullCalendar from "@fullcalendar/react";
import { Calendar,  } from "@fullcalendar/core";
import { render } from "@fullcalendar/react";
import { Avatar, Backdrop, Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, MenuItem, Select, Tooltip, Typography, TextField, FormControl, FormHelperText, Paper } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { AccountBox, Add, Assignment, Assistant, AttachFile, ChromeReaderMode, Clear, DeleteForever, Description, DoneAll, Edit, Grade, Lock, LockOpen, Person, Print, School, SupervisedUserCircle, TransferWithinAStation, Refresh, Event, MeetingRoom, NoMeetingRoom } from "@material-ui/icons";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";

import { classesRef, coursesRef, teachersListRef } from '../services/databaseRefs'
import { LocaleText } from "./DataGridLocaleText";
import FullScreenDialog from "./FullscreenDialog";
import { handleEnableDisableStudents, handleTransferStudents, handleAddTeacher, handleDeleteClass, handleRemoveTeacher, handleClassOpen, handleCloseClass } from "./FunctionsUse";
import StudentFiles from "./StudentFiles";
import StudentInfo from "./ViewStudentInfo";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import brLocale from '@fullcalendar/core/locales/pt-br';
import interactionPlugin from '@fullcalendar/interaction';
import { useRef } from "react";
import CalendarComponent from "../muiDashboard/Calendar";
import { useConfirmation } from "../contexts/ConfirmContext";
import AddClass from "../secretaria/components/addClass/AddClass";
import GradeDefinition from "./GradeDefinition";
import ClassReport from "./ClassReport";
import ClassReportOLD from "./ClassReportOLD";

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
    textField: {
      minWidth: '99.8px',
      width: 'min-content'
    },
    fieldsContainer: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: '10px',
      flexWrap: "wrap",
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
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
  }));

const ClassInfo = ({classDataRows, onClose}) => {

    

    const confirm = useConfirmation();

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
    const [openCalendar, setOpenCalendar] = useState(false);
    const [openClassEditing, setOpenClassEditing] = useState(false);
    const [dataForEditing, setDataForEditing] = useState({
      codTurmaAtual: "",
      codigoSala: "",
      curso: "",
      diasDaSemana: [],
      hora: "",
      horarioTerminoTurma: "",
      livros: [],
      modalidade: "",
      professor: '',
  })
    const [filterModel, setFilterModel] = useState({
      items: [],
  });
    const [classesCodes, setClassesCodes] = useState([]);
    const [classCodeTransfer, setClassCodeTransfer] = useState('');
    const [ openDialog, setOpenDialog ] = useState(false);
    const [ openDialog2, setOpenDialog2 ] = useState(false);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const [dialogContent, setDialogContent] = useState(<Fragment></Fragment>);
    const [teachersList, setTeachersList] = useState([]);
    const [chosenTeacher, setChosenTeacher] = useState('');
    const [startEndClasses, setStartEndClasses] = useState({start: '', end: ''})
    const [classEndTime, setClassEndTime] = useState(classData.hasOwnProperty('horarioTerminoTurma') && classData.horarioTerminoTurma)
    const [eventColor, setEventColor] = useState('#001EFF')
    const [eventTextColor, setEventTextColor] = useState('#FFFFFF')
    const [periodName, setPeriodName] = useState('');
    const [numberOfClasses, setNumberOfClasses] = useState('');
    const [gradeDefinition, setGradeDefinition] = useState(false);
    const [classReport, setClassReport] = useState(false);

    
    useEffect(() => {
      
      getData();
      
    }, [])

    useEffect(() => {
      handleRerenderCalendar()
    }, [eventColor, eventTextColor])

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
        
        console.log(data)
        if (data && courseData) {
          setClassData(data);
          const dataTemplate = {
            codTurmaAtual: data.codigoSala,
            codigoSala: data.codigoSala,
            curso: data.curso,
            diasDaSemana: data.diasDaSemana,
            hora: data.hora.split('_').join(':'),
            horarioTerminoTurma: data.horarioTerminoTurma,
            livros: data.livros,
            modalidade: data.modalidade,
            professor: '',
          }
          setDataForEditing(dataTemplate)
          if (data.hasOwnProperty('professor')) {
            let classTeachers = data.professor
            setTeachers(classTeachers)
            teachersArray = teachersArray.filter(teacher => !(classTeachers.find(classTeacher => classTeacher.email === teacher.email)))
          }
          setTeachersList(teachersArray);
          setCourseData(courseData);
          let students = data.alunos
          let studentsArray = []
          for (const id in students) {
            if (Object.hasOwnProperty.call(students, id)) {
              let student = students[id];
              student.id = id
              student.gradeSum = 0;
              for (const gradeName in student.notas) {
                if (Object.hasOwnProperty.call(student.notas, gradeName)) {
                  const grade = student.notas[gradeName];
                  student.gradeSum += parseFloat(grade);
                }
              }
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

  const handleConfirmDeleteTeacher = (teacherIndex) => {
    setDialogContent(
      <Fragment>
        <DialogContent>
        <DialogContentText>{'Você está removendo o acesso deste professor á esta turma.'}</DialogContentText>

        </DialogContent>
        
        <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
                Cancelar
            </Button>
            <Button onClick={() => handleDeleteTeacher(teacherIndex)} variant="contained" color="primary" autoFocus>
                Sim, continuar
            </Button>
        </DialogActions>
      </Fragment>
    )
    setOpenDialog(true)
  }

  const handleDeleteTeacher = async (teacherIndex) => {
    setOpenDialog(false)
    setLoader(true)
    
    try {
      const message = await handleRemoveTeacher(classCode, teacherIndex);
      enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
      setLoader(false)
    } catch (error) {
      enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
      setLoader(false)
    }

    getData();
    
  }


  const handleConfirmTransfer = () => {
    setDialogContent((
      <Fragment>
        <DialogContent>
          <DialogContentText>{`Você está transferindo ${selectedRows.length} alunos. Escolha a turma de destino:`}</DialogContentText>
          {
            <Select 
              autoFocus
              fullWidth
              required
              onChange={(e) => setClassCodeTransfer(e.target.value)}
            >
            
            {classesCodes.map((id, i) => <MenuItem value={id}>{id}</MenuItem>)}
            </Select>
          }
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancelar
          </Button>
          <Button onClick={handleTransfer} variant="contained" color="primary" autoFocus>
              Sim, continuar
          </Button>
        </DialogActions>
        
      </Fragment>
    ))
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
    setDialogContent(
      <Fragment>
        <DialogContent>
            

            <DialogContentText>{`Você está desativando ${selectedRows.length} alunos.`}</DialogContentText>
            
        </DialogContent>
        
        <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
                Cancelar
            </Button>
            <Button onClick={handleDisableStudents} variant="contained" color="primary" autoFocus>
                Sim, continuar
            </Button>
        </DialogActions>
        
      </Fragment>
    )

    setOpenDialog(true) 
  }

const handleDisableStudents = async () => {
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
    if (teachersList.length === 0) {
      enqueueSnackbar('Todos os professores cadastrados no sistema já estão conectados nesta turma.', {title: 'Aviso', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
    } else {
      setDialogContent((
        <Fragment>
          <DialogContent>
          <DialogContentText>{'Você está adicionando um(a) professor(a) á esta turma. Escolha o(a) professor(a):'}</DialogContentText>
          
          
            <Select 
              autoFocus
              fullWidth
              required
              onChange={(e) => setChosenTeacher(e.target.value)}
            >
            
            {teachersList.map((teacher, i) => <MenuItem value={teacher.email}>{teacher.nome} ({teacher.email})</MenuItem>)}
            </Select>
          </DialogContent>
          
          <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                  Cancelar
              </Button>
              <Button onClick={handleTeacherAdding} variant="contained" color="primary" autoFocus>
                  Sim, continuar
              </Button>
          </DialogActions>
        </Fragment>
      ))
      setOpenDialog(true)
    }
    
    
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

  const handleDeleteClassConfirm = () => {
    setDialogContent(
      <Fragment>
        <DialogContent>
        <DialogContentText>{'Você está excluindo todos os registros desta turma.'}</DialogContentText>
        
        </DialogContent>
        
        <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
                Cancelar
            </Button>
            <Button onClick={handleClassDelete} variant="contained" color="primary" autoFocus>
                Sim, continuar
            </Button>
        </DialogActions>
      </Fragment>
    )
    setOpenDialog(true)
  }

 const handleClassDelete = async () => {
  setOpenDialog(false)
  setLoader(true)
  try {
      let message = await handleDeleteClass(classCode);
      getData()
      enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
      setLoader(false)
  } catch (error) {
      getData()
      enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
      setLoader(false)
  }
 }

 // Functions for the calendar
 const handleDateClick = (e) => {
  console.log(e)
}

const handleEventClick = (e) => {
  console.log(e)
}

const handleSelection = (e) => {
  console.log(e)
}

const handleViewChange = (e) => {
  console.log(e.view.type)
  //localStorage.setItem('view', e.view.type)
}

const calendarEl = useRef()

const getApi = () => {
  const { current: calendarDom } = calendarEl;
  console.log(calendarEl.current)

  return calendarDom ? calendarDom.getApi() : null;
}

const handleChangeStartEndClasses = (e) => {
  console.log(e.target.value)
  let startAndEnd = startEndClasses
  if (e.target.id === 'start') {
    startAndEnd.start = e.target.value
  } else {
    startAndEnd.end = e.target.value + 'T23:59'
  }
  setStartEndClasses(startAndEnd)
  
  handleRerenderCalendar()
}

const handleRerenderCalendar = () => {
  if (classData.hasOwnProperty('hora')) {
    const API = getApi();
    console.log(API)
    API && API.changeView('dayGridMonth', startEndClasses)
    const event = API && API.getEventById(classCode)
    event && event.remove()
    
    const classTime = classData.hora
    
    const startTime = classTime.indexOf('_') === -1 ? classTime + ':00' : classTime.split('_')[0] + ':' + classTime.split('_')[1]
    API && API.addEvent({title: classCode, startRecur: startEndClasses.start, endRecur: startEndClasses.end, id: classCode, groupId: 'classes', daysOfWeek: classData.diasDaSemana, startTime: startTime, endTime: classEndTime, color: eventColor, textColor: eventTextColor }, true)
  }
  

}

const handleCallClassOpen = async () => {
  const classTime = classData.hora
  const startTime = classTime.indexOf('_') === -1 ? classTime + ':00' : classTime.split('_')[0] + ':' + classTime.split('_')[1]
  const source = {
    color: eventColor,
    id: classCode,
    textColor: eventTextColor,
    events: [
      {
        title: classCode, 
        startRecur: startEndClasses.start, 
        endRecur: startEndClasses.end, 
        id: classCode, 
        groupId: 'classes', 
        daysOfWeek: classData.diasDaSemana, 
        startTime: startTime, 
        endTime: classEndTime, 
        color: eventColor, 
        textColor: eventTextColor 
      }
    ]
  }

  const info = {fim: startEndClasses.end, inicio: startEndClasses.start, horarioTermino: classEndTime, nomePeriodo: periodName, qtdeAulas: numberOfClasses}
  try {
    setLoader(true)
    const message = await handleClassOpen(classCode, source, info)
    getData()
    
    setLoader(false)
    setOpenDialog2(false)
  } catch (error) {
    getData()
    enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
    setLoader(false)
  }
  
}

const handleConfirmOpenClass = () => {
  setOpenDialog2(true)
  
}

const handleConfirmCloseClass = async () => {
  try {
    await confirm({
      variant: "danger",
      catchOnCancel: true,
      title: "Confirmação",
      description: "Você deseja fechar esta turma? Ao fechar, os processos para geração de boletins serão iniciados."
    })
    setLoader(true)
    const message = await handleCloseClass(classCode);
    
    getData()
    enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
    setLoader(false)
  } catch (error) {
    getData()
    setLoader(false)
    if (error)
      enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
    
  }
  
}

  const handleGradeDefinition = () => {
    setGradeDefinition(true);
  }

  const handleClassReport = () => {
    setClassReport(true);  
  }

  const handleOpenCalendar = () => {
    setOpenCalendar(true)
    //enqueueSnackbar('O Calendário da Turma ainda está em desenvolvimento 😊', {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
  }

    return ( 
        <Fragment>
          {classReport && <ClassReportOLD open={classReport} onClose={setClassReport} classCode={classCode}/>}
          <GradeDefinition open={gradeDefinition} onClose={setGradeDefinition} classCode={classCode}/>

          <Dialog 
            aria-labelledby="confirmation-dialog-title"
            open={openDialog}
            onClose={() => setOpenDialog(false)}
          >
            <DialogTitle id="confirmation-dialog-title">Você confirma esta ação?</DialogTitle>
            {dialogContent}
                
          </Dialog>

          <FullScreenDialog
            isOpen={openClassEditing}
            onClose={() => {
                setOpenClassEditing(false);
            }}
            hideSaveButton
            onSave={() => {
                alert('Save clicked')
            }}
            title={"Editar as informações da turma"}
            saveButton={"Salvar"}
            saveButtonDisabled={true}
          >
            <AddClass dataForEditing={dataForEditing} onClose={() => {
              setOpenClassEditing(false)
              onClose()
            }} 
            />
          </FullScreenDialog>

          <FullScreenDialog
            isOpen={openCalendar}
            onClose={() => {
                setOpenCalendar(false);
            }}
            hideSaveButton
            onSave={() => {
                alert('Save clicked')
            }}
            title={"Calendário da turma"}
            saveButton={"Salvar"}
            saveButtonDisabled={true}
          >
            <Container>
              <CalendarComponent sourceId={classCode} />
            </Container>
            
          </FullScreenDialog>

          <Dialog
            aria-labelledby="confirmation-dialog-title"
            open={openDialog2}
            onClose={() => setOpenDialog2(false)}
          >
            <DialogTitle id="confirmation-dialog-title">Você confirma esta ação?</DialogTitle>
            <DialogContent>
            <DialogContentText>{'Você está abrindo a turma. Isso permitirá que os professores façam os lançamentos para o período.'}</DialogContentText>
            <form>
            
            <Typography variant="h6" gutterBottom>
              Dados para abertura:
            </Typography>
              <div className={classes.fieldsContainer}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Nome do período"
                  type="email"
                  style={{width: 'max-content'}}
                  variant="filled"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  required
                />
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Aulas"
                  type="number"
                  className={classes.textField}
                  variant="filled"
                  required
                  value={numberOfClasses}
                  onChange={(e) => setNumberOfClasses(e.target.value)}
                  helperText="Qtde. aulas"
                />
              </div>
            
              <div className={classes.fieldsContainer}>
                <FormControl className={classes.fields}> 
                  <TextField name="dataNascimentoAluno" style={{width: '219px',}} variant="filled" InputLabelProps={{shrink: true,}}  id="start" required  autoComplete="off" type="date" format="dd/MM/yyyy" label="Data de Início" onChange={handleChangeStartEndClasses}/>
                  <FormHelperText>Início das aulas</FormHelperText>
                </FormControl>
                <FormControl className={classes.fields}> 
                  <TextField name="dataNascimentoAluno" style={{width: '219px',}} variant="filled" InputLabelProps={{shrink: true,}}  id="end" required autoComplete="off" type="date" format="dd/MM/yyyy" label="Data do Fim" onChange={handleChangeStartEndClasses}/>
                  <FormHelperText>Fim das aulas</FormHelperText>
                </FormControl>
                <TextField
                  id="horarioTerminoTurma"
                  type="time"
                  label="Hr. Término"
                  value={classEndTime}
                  className={classes.textField}
                  helperText="Cada aula"
                  onChange={(e) => setClassEndTime(e.target.value)}
                  variant="filled"
                  InputLabelProps={{
                      shrink: true,
                  }}
                  
                  required
                />

                          
                                  
              </div>

              <Typography variant="h6" gutterBottom>
                Outras configurações do calendário:
              </Typography>
              <div className={classes.fieldsContainer}>
              <FormControl className={classes.fields}> 
                  <TextField name="corDoEvento" style={{width: '219px',}} variant="filled" InputLabelProps={{shrink: true,}}  id="corDoEvento" required autoComplete="off"  type="color" label="Cor do evento" onBlur={(e) => setEventColor(e.target.value)}/>
                  
              </FormControl>
              <FormControl className={classes.fields}> 
                  <TextField name="corDoEvento" style={{width: '219px',}} variant="filled" InputLabelProps={{shrink: true,}}  id="corDoTextoDoEvento" required autoComplete="off"  type="color" label="Cor do texto do evento" onBlur={(e) => setEventTextColor(e.target.value)}/>
                  
              </FormControl>
              </div>
                {/* <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={handleRerenderCalendar}>Atualizar calendário</Button> */}
              <FullCalendar 
                ref={calendarEl}
                id="calendarEl"
                plugins={[ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin ]}
                
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,listWeek',

                }}
                validRange={startEndClasses}
                // rerenderDelay={100}
                
                locale={brLocale}
                //eventSources={events}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                selectable
                select={handleSelection}
                viewDidMount={handleViewChange}
                editable={true}
              />
              
            </form>
            
            
            </DialogContent>
            
            <DialogActions>
                <Button onClick={() => setOpenDialog2(false)} color="primary">
                    Cancelar
                </Button>
                <Button onClick={handleCallClassOpen} variant="contained" color="primary" autoFocus>
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
                            {(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? <MeetingRoom /> : <NoMeetingRoom />}
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
                          <ListItemSecondaryAction onClick={() => handleConfirmDeleteTeacher(i)}>
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
                        <Avatar className={classes.avatar}>
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
                        <Button fullWidth size="large" variant="contained" color="primary" onClick={() => setOpenClassEditing(true)} startIcon={<Edit />}>Editar dados</Button>
                      </Box>
                      
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Grade />} onClick={handleGradeDefinition}>Distribuir notas</Button>
                      </Box>
                      
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" disabled={classData.hasOwnProperty('status') ? classData.status.turma !== 'aberta' : true} color="primary" startIcon={<Print />}onClick={handleClassReport}>Diário de classe</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" onClick={(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? handleConfirmCloseClass : handleConfirmOpenClass} startIcon={(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? <NoMeetingRoom /> : <MeetingRoom />}>{(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? 'Fechar ' : 'Abrir '}turma</Button>
                      </Box>
                     {(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') && 
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" onClick={handleOpenCalendar} startIcon={<Event />}>Calendário da turma</Button>
                      </Box>}
                      {/* <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Lock />}disabled={(!classData.hasOwnProperty('status') || classData.status.turma === 'fechada')}>Fechar turma</Button>
                      </Box> */}
                      <Box m={1}>
                        <Button fullWidth size="small" variant="contained" style={{backgroundColor: 'red', color: 'white'}} startIcon={<DeleteForever />} onClick={handleDeleteClassConfirm}>Excluir turma</Button>
                      </Box>
                      
                      
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
                          <Avatar className={classes.avatar}>
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
                                  {field: 'gradeSum', headerName: 'Nota atual', width: 145}
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
                        
                          <div className={classes.container}>
                            <Button size="medium" variant="contained" color="primary" disabled={selectedRows.length === 0} startIcon={<TransferWithinAStation />} onClick={handleConfirmTransfer}>Transferir</Button>
                            <Button size="medium" variant="contained" color="secondary" startIcon={<Clear />} disabled={selectedRows.length === 0} onClick={handleConfirmDisable}>Desativar</Button>
                          </div>
                        
                        
                      </div>
                      
                        </CardContent>
                    </Card>
                  
                  
                  
                    
                  

                  
                  
                
              
             </div>
         
            
          
          
            
            
            
        </Fragment>
     );
}
 
export default ClassInfo;