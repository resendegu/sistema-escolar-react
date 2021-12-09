import { Avatar, Backdrop, Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Divider, Grid, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, Typography } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { AccountBox, Add, Assignment, Assistant, AttachFile, ChromeReaderMode, Clear, DeleteForever, Description, DoneAll, Edit, Grade, Lock, LockOpen, Person, Print, School, SupervisedUserCircle, TransferWithinAStation } from "@material-ui/icons";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Fragment, useEffect, useState } from "react";

import { classesRef, coursesRef } from '../services/databaseRefs'
import { LocaleText } from "./DataGridLocaleText";
import FullScreenDialog from "./FullscreenDialog";
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

    
    useEffect(() => {
      const getData = async () => {
        setLoader(true)
        try {
          let data = (await classesRef.child(classCode).once('value')).val();
          let courseData = (await coursesRef.child(data.curso).once('value')).val();
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
      getData();
      
    }, [])

    
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
  }


    return ( 
        <Fragment>
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
                        <Avatar className={classes.orange} className={classes.avatar}>
                          <AccountBox />
                        </Avatar>
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
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Add />}>Add professores</Button>
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
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<LockOpen />}>Abrir turma</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Lock />}>Fechar turma</Button>
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
                            <Button size="medium" variant="contained" color="primary" startIcon={<TransferWithinAStation />}>Transferir</Button>
                            <Button size="medium" variant="contained" color="secondary" startIcon={<Clear />}>Desativar</Button>
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