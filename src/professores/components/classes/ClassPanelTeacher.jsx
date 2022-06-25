import FullCalendar from "@fullcalendar/react";
import { Calendar,  } from "@fullcalendar/core";
import { render } from "@fullcalendar/react";
import { Avatar, Backdrop, Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, MenuItem, Select, Tooltip, Typography, TextField, FormControl, FormHelperText, Paper, Fab } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { AccountBox, Add, Assignment, Assistant, AttachFile, ChromeReaderMode, Clear, DeleteForever, Description, DoneAll, Edit, Grade, Lock, LockOpen, Person, Print, School, SupervisedUserCircle, TransferWithinAStation, Refresh, Event, MeetingRoom, NoMeetingRoom, Speed, CalendarToday } from "@material-ui/icons";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";

import { basicDataRef, classesRef, coursesRef, schoolInfoRef, teachersListRef } from '../../../services/databaseRefs'
import { LocaleText } from "../../../shared/DataGridLocaleText";
import FullScreenDialog from "../../../shared/FullscreenDialog";
import { handleEnableDisableStudents, handleTransferStudents, handleAddTeacher, handleDeleteClass, handleRemoveTeacher, handleClassOpen, handleCloseClass, releaseFaults, removeFaults } from "../../../shared/FunctionsUse";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import brLocale from '@fullcalendar/core/locales/pt-br';
import interactionPlugin from '@fullcalendar/interaction';
import { useRef } from "react";
import CalendarComponent from "../../../muiDashboard/Calendar";
import { useConfirmation } from "../../../contexts/ConfirmContext";
import AddClass from "../../../secretaria/components/addClass/AddClass";
import ClassReportOLD from "../../../shared/ClassReportOLD";
import StudentPanelTeacher from "../students/StudentPanelTeacher";
import ReleaseGrades from "../../../shared/ReleaseGrades";
import GradeDefinition from "../../../shared/GradeDefinition";
import ReleasePerformance from "../../../shared/ReleasePerformance";
import StudentInfo from "../../../shared/ViewStudentInfo";

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
      maxWidth: "70vw",
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

const ClassPanelTeacher = ({classDataRows, onClose}) => {

    

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
    const [startEndClasses, setStartEndClasses] = useState({start: '', end: ''});
    const [classEndTime, setClassEndTime] = useState(classData.hasOwnProperty('horarioTerminoTurma') && classData.horarioTerminoTurma);
    const [eventColor, setEventColor] = useState('#001EFF');
    const [eventTextColor, setEventTextColor] = useState('#FFFFFF');
    const [periodName, setPeriodName] = useState('');
    const [numberOfClasses, setNumberOfClasses] = useState('');
    const [gradeRelease, setGradeRelease] = useState(false);
    const [performanceRelease, setPerformanceRelease] = useState(false);
    const [classReport, setClassReport] = useState(false);
    const [canDefineGrades, setCanDefineGrades] = useState(false);
    const [gradeDefinition, setGradeDefinition] = useState(false);

    
    useEffect(() => {
      
      getData();
      
    }, [])

    useEffect(() => {
      handleRerenderCalendar()
    }, [eventColor, eventTextColor])

    useEffect(() => {
        
        basicDataRef.child('permitirDistribuiNotas').on('value', (snapshot) => {
            const value = snapshot.val()
          
            if (snapshot.exists()) {
                setCanDefineGrades(value)
            } else {
                setCanDefineGrades(false)
            }
            
            
        }, (error) => {
            enqueueSnackbar(error.message, {title: 'Error', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        })
      
      
      
      return () => {
          basicDataRef.child('permitirDistribuiNotas').off('value');
      }
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
              student.actions = id
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
    //setStudentInfo({id: e.id, classCode: classCode})
    // setOpen(true);
  }

  const handleOpenStudent = (id) => {
    setStudentInfo({id: id, classCode: classCode})
    setOpen(true);
  }

  const handleTeacherClick = (e) => {
    console.log(e)
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

  const handleReleaseGrades = (single) => {
    console.log(single)
    if (single) {
      setSelectedRows([single])
    }
    setGradeRelease(true);
  }

  const handleReleasePerformance = (single) => {
    if (single) {
      setSelectedRows([single])
    }
    setPerformanceRelease(true)
  }

  const handleFault = async (event, remove=false) => {
    if (remove) {
      // in case of remove === true, "event" will be like {eventStr: event.startStr, classCode: eventId, studentId: fault.id, studentName: fault.name}
      try {
        console.log(event)
        await confirm({
          variant: "danger",
          catchOnCancel: true,
          title: "Confirmação",
          description: `Você deseja remover a falta do aluno ${event.studentId}: ${event.studentName}?`
        })
        setLoader(true)
        
        const message = await removeFaults(event.eventStr, event.classCode, event.studentId)
        enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
      } catch (error) {
        if (error)
          enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
      }
      setLoader(false)
    } else {
      console.log(event)
      if (selectedRows.length > 0) {
        try {
          let selectedStudents = ""
          if (selectedRows.length === 1) {
            selectedStudents = selectedRows[0]
          } else {
            for (const i in selectedRows) {
              if (Object.hasOwnProperty.call(selectedRows, i)) {
                const id = selectedRows[i];
                console.log((selectedRows.length - 1), Number(i))
                selectedStudents += (selectedRows.length - 1) === Number(i) ? `${id}` : `${id}, `
              }
            }
          }
          await confirm({
            variant: "danger",
            catchOnCancel: true,
            title: "Confirmação",
            description: "Após lançar uma falta, você não poderá lançar outras para o mesmo dia. Poderá lançar novamente, somente depois que remover as faltas já lançadas. Você deseja lançar faltas para os alunos selecionados? Alunos: " + selectedStudents
          })
          setLoader(true)
          const message = await releaseFaults(event.startStr, classCode, selectedRows)
          enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        } catch (error) {
          if (error)
            enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        }
      } else {
        enqueueSnackbar("Para lançar faltas, selecione os alunos na tabela acima.", {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
      }
      setLoader(false)
    }
    
    
  }

    return ( 
        <Fragment>
          {classReport && <ClassReportOLD open={classReport} onClose={setClassReport} classCode={classCode}/>}
          <ReleaseGrades open={gradeRelease} onClose={setGradeRelease} classCode={classCode} studentsIds={selectedRows} refresh={getData}/>
          <ReleasePerformance open={performanceRelease} onClose={setPerformanceRelease} classCode={classCode} studentsIds={selectedRows} refresh={getData}/>
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
              <CalendarComponent sourceId={classCode} isFromClassCode />
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
                <StudentInfo studentInfo={studentInfo} teacherView />
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
                    {canDefineGrades && 
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Grade />} onClick={handleGradeDefinition}>Distribuir notas</Button>
                      </Box>}
                      
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" disabled={classData.hasOwnProperty('status') ? classData.status.turma !== 'aberta' : true} color="primary" startIcon={<Print />}onClick={handleClassReport}>Diário de classe</Button>
                      </Box>
                      {/* <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" onClick={(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? handleConfirmCloseClass : handleConfirmOpenClass} startIcon={(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? <NoMeetingRoom /> : <MeetingRoom />}>{(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') ? 'Fechar ' : 'Abrir '}turma</Button>
                      </Box> */}
                     {/* {(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') && 
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" onClick={handleOpenCalendar} startIcon={<Event />}>Calendário da turma</Button>
                      </Box>} */}
                      {/* <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Lock />}disabled={(!classData.hasOwnProperty('status') || classData.status.turma === 'fechada')}>Fechar turma</Button>
                      </Box> */}
                      <Box m={1}>
                        <Button fullWidth size="small" variant="outlined" color="primary" onClick={getData} startIcon={<Refresh />}>Atualizar dados</Button>
                      </Box>
                    {/* <Typography className={classes.title} color="textPrimary" gutterBottom>
                      Lista de professores
                    </Typography>
                    <List component="nav" aria-label="professores cadastrados">
                      {teachers.map((teacher, i) => (
                        <ListItem divider button onClick={handleTeacherClick}>
                          <ListItemText className={classes.list}>{teacher.nome} ({teacher.email}) </ListItemText>
                          
                        </ListItem>
                      ))}
                      
                      
                      
                    </List> */}

                    
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
                                  {field: 'nome', flex: 1, headerName: 'Nome', width: 200},
                                  {field: 'id', headerName: 'Matrícula', width: 140},
                                  {field: 'gradeSum', headerName: 'Nota atual', width: 145},
                                  {
                                    field: 'actions',
                                    headerName: 'Ações',
                                    minWidth: 150,
                                    flex: 1,
                                    renderCell: (params) => (
                                      <strong>
                                        <Tooltip title="Notas">
                                          <IconButton onClick={() => handleReleaseGrades(params.value)} disabled={!(classData.hasOwnProperty('status') && classData.status.turma === 'aberta')}>
                                            <Grade />
                                          </IconButton> 
                                        </Tooltip>

                                        <Tooltip title="Desempenho">
                                          <IconButton onClick={() => handleReleasePerformance(params.value)} disabled={!(classData.hasOwnProperty('status') && classData.status.turma === 'aberta')}>
                                            <Speed />
                                          </IconButton> 
                                        </Tooltip>
                                        
                                        <Tooltip title="Ver aluno">
                                          <IconButton onClick={() => handleOpenStudent(params.value)}>
                                            <Person />
                                          </IconButton> 
                                        </Tooltip>
                                      </strong>
                                    ),
                                  },
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
                            <Button size="medium" variant="contained" color="primary" disabled={!(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') || selectedRows.length === 0} startIcon={<Grade />} onClick={() => handleReleaseGrades()}>Lançar notas</Button>
                            <Button size="medium" variant="contained" color="secondary" startIcon={<Speed />} disabled={!(classData.hasOwnProperty('status') && classData.status.turma === 'aberta') || selectedRows.length === 0} onClick={() => handleReleasePerformance()}>Lançar desempenho</Button>
                          </div>
                        
                        
                      </div>
                      
                        </CardContent>
                    </Card>
                  
                  
                    <Card className={classes.bigCards} style={{height: "100vh"}} variant="outlined">
                      <CardContent>
                      <Grid 
                        justifyContent="flex-start"
                        direction="row"
                        container
                        spacing={1}
                      >
                        <Grid item>
                          <Avatar className={classes.avatar}>
                            <CalendarToday />
                          </Avatar>
                        </Grid>

                        <Grid item>
                          <Typography variant="h5" component="h2">
                            Calendário da turma
                          </Typography>
                          
                          
                        </Grid>
                      </Grid>
                      <hr />
                      <div style={{ height: "20vh", width: '100%' }}>
                        
                          <CalendarComponent sourceId={classCode} isFromClassCode handleFault={handleFault} />
                        
                      </div>
                      
                        
                        
                        
                      
                      
                        </CardContent>
                    </Card>
                    
                  

                  
                  
                
              
             </div>
         
            
          
          
            
            
            
        </Fragment>
     );
}
 
export default ClassPanelTeacher;