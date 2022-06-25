import { Button, Checkbox, createTheme, darken, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, lighten, makeStyles } from "@material-ui/core";
import { Assignment, CheckBox, PlusOneRounded, Refresh } from "@material-ui/icons";
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { classesRef, disabledStudentsRef, studentsRef, usersRef } from "../../../services/databaseRefs";
import { functions } from "../../../services/firebase";
import { LocaleText } from "../../../shared/DataGridLocaleText";
import FollowUp from "../../../shared/FollowUp";
import FullScreenDialog from "../../../shared/FullscreenDialog";
import { handleEnableDisableStudents } from "../../../shared/FunctionsUse";
import StudentInfo from "../../../shared/ViewStudentInfo";

// TODO v5: remove
function getThemePaletteMode(palette) {
    return palette.type || palette.mode;
  }
  
  const defaultTheme = createTheme();
  const useStyles = makeStyles(
    (theme) => {
      const getBackgroundColor = (color) =>
        getThemePaletteMode(theme.palette) === 'dark'
          ? darken(color, 0.6)
          : lighten(color, 0.6);
  
      const getHoverBackgroundColor = (color) =>
        getThemePaletteMode(theme.palette) === 'dark'
          ? darken(color, 0.5)
          : lighten(color, 0.5);
  
      return {
        root: {
          '& .super-app-theme--Open': {
            backgroundColor: getBackgroundColor(theme.palette.info.main),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor(theme.palette.info.main),
            },
          },
          '& .super-app-theme--Filled': {
            backgroundColor: getBackgroundColor(theme.palette.success.main),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor(theme.palette.success.main),
            },
          },
          '& .super-app-theme--PartiallyFilled': {
            backgroundColor: getBackgroundColor(theme.palette.warning.main),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor(theme.palette.warning.main),
            },
          },
          '& .super-app-theme--true': {
            backgroundColor: getBackgroundColor(theme.palette.error.main),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor(theme.palette.error.main),
            },
          },
        },
      };
    },
    { defaultTheme },
  );

const Students = () => {

    const {user} = useAuth();

    const classes = useStyles();

    const defaultShowDisabledStudents = localStorage.getItem('showDisabledStudents') ? true : false;
    const [ loading, setLoading ] = useState(false);
    const [ open, setOpen ] = useState(false);
    const [ openDialog, setOpenDialog ] = useState(false);
    const [ showDisabledStudents, setShowDisabledStudents ] = useState(defaultShowDisabledStudents)

    const [filterModel, setFilterModel] = useState({
        items: [],
    });

    // const [ students, setStudents ] = useState({});  
    const [ rows, setRows ] = useState([]);
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ studentInfo, setStudentInfo ] = useState({});
    const [ openFollowUp, setOpenFollowUp ] = useState(false);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    useEffect(() => {
        
        getData()
        
    }, [showDisabledStudents])
    
    async function getData() {
        setLoading(true)
        let acess
        acess = await functions.httpsCallable("verificadorDeAcesso") 
        console.log(await acess('professor'))
        const localTeacherClasses = (await usersRef.child(user.id).child("professor/turmas").once("value")).val()
        let localTeacherStudents = [];
        for (const id in localTeacherClasses) {
            if (Object.hasOwnProperty.call(localTeacherClasses, id)) {
                let classStudents = (await classesRef.child(id).child('alunos').once("value")).val();
                if (classStudents) {
                    Object.keys(classStudents).map((studentLocalId, i) => {
                        localTeacherStudents.push(studentLocalId);
                    })
                }
                
            }
        }
        console.log(localTeacherStudents)

        //let snapshot = await studentsRef.once('value');
        
        //let students = snapshot.exists() ? snapshot.val() : []
        let studentsArray = []
        for (const i in localTeacherStudents) {
            if (Object.hasOwnProperty.call(localTeacherStudents, i)) {
                const id = localTeacherStudents[i];
                let student = (await studentsRef.child(id).once('value')).val()
                console.log(id)
                student.id = id;
                studentsArray.push(student);
            }
        }
        
        // setStudents(students);
        setRows(studentsArray);
        setLoading(false);
    }

    const handleAddRow = () => {
        let rowsArray = JSON.parse(JSON.stringify(rows))
        rowsArray.push({id: rowsArray.length, label: 'Digite um nome...', placeholder: 'Digite...', required: false})
        setRows(rowsArray)
        console.log(rowsArray)
    }

    const handleRowEdit = async (editedRow) => {
        setLoading(true);
        console.log(editedRow);
        let rowsArray = JSON.parse(JSON.stringify(rows))
        let rowIndex = rowsArray.findIndex(row => row.id === editedRow.id);
        rowsArray[rowIndex][editedRow.field] = editedRow.value;
        setRows(rowsArray);
        console.log(rowsArray)
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
        setLoading(true)
        let rowsArray = JSON.parse(JSON.stringify(rows));
        let updatedRows = rowsArray.filter(row => selectedRows.indexOf(row.id) === -1);
        console.log(updatedRows);
        
        // try {
        //     await additionalFieldsRef.set(updatedRows);
        //     setRows(updatedRows);
        //     setLoading(false);
        // } catch (error) {
        //     console.log(error);
        //     setLoading(false);
        //     throw new Error(error.message);
        // }
    }

    const handleRowClick = (e) => {
        console.log(e)
        setOpen(true);
        setStudentInfo({id: e.id, classCode: e.row.turmaAluno, disabled: e.row.hasOwnProperty('disabled') ? true : false})

    }

    const handleConfirmDisable = () => {
        let disabledStudentsSelected = false
        selectedRows.map((id, i) => {
            let student = rows.filter(row => id === row.id)
            disabledStudentsSelected = student[0].hasOwnProperty('disabled') && true
            return 0;
        })
        
        if (!disabledStudentsSelected) {
            setOpenDialog(true)
        } else {
            enqueueSnackbar('Por favor, selecione apenas alunos ativos para realizar esta ação.', {variant: 'warning', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        }
        
    }

    const handleDisableStudents = async () => {
        setOpenDialog(false)
        setLoading(true)
        try {
            let message = await handleEnableDisableStudents(selectedRows)
            getData()
            enqueueSnackbar(message, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            setLoading(false)
        } catch (error) {
            getData()
            enqueueSnackbar(error.message, {title: 'Sucesso', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
            setLoading(false)
        }
    }

    const handleShowDisabledStudents = (e) => {
        const checked = e.target.checked;
        checked ? localStorage.setItem('showDisabledStudents', 'yes') : localStorage.removeItem('showDisabledStudents');
        setShowDisabledStudents(checked);
    }

    return (
        <Fragment>
            <FollowUp isOpen={openFollowUp} onClose={setOpenFollowUp} />
            <Dialog
                aria-labelledby="confirmation-dialog-title"
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle id="confirmation-dialog-title">Você confirma esta ação?</DialogTitle>
                <DialogContent>
                    <DialogContentText>{selectedRows.length > 1 ? 'Serão' : 'Será'} desativado{selectedRows.length > 1 && 's'} {selectedRows.length} aluno{selectedRows.length > 1 && 's'}.</DialogContentText>
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleDisableStudents} color="primary" autoFocus>
                        Sim
                    </Button>
                </DialogActions>
            </Dialog>
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
            <Grid
            justifyContent="flex-start"   
            container
            direction="row"
            spacing={2}
            >
                
                
                <Grid item xs={12}>
                    <div style={{ height: "59vh", width: '100%' }} className={classes.root}>
                        <DataGrid 
                            key={"15"}
                            filterModel={filterModel}
                            onFilterModelChange={(model) => setFilterModel(model)}
                            rows={rows} 
                            columns={
                                [
                                    {field: 'nomeAluno', headerName: 'Nome', width: 300},
                                    {field: 'matriculaAluno', headerName: 'Matrícula', width: 140},
                                    {field: 'turmaAluno', headerName: 'Turma', width: 180},
                                    {field: 'emailAluno', headerName: 'E-mail', width: 220},
                                    {field: 'celularAluno', headerName: 'Celular', width: 180},
                                    {field: 'turmaAluno', headerName: 'Turma', width: 180},
                                    {field: 'disabled', headerName: 'Desativado?', type: 'boolean', width: 180}
                            
                                ]
                            } 
                            disableSelectionOnClick 
                            checkboxSelection
                            components={{
                                Toolbar: GridToolbar

                            }}
                            onCellEditCommit={handleRowEdit}
                            loading={loading}
                            localeText={LocaleText}
                            onSelectionModelChange={handleRowSelection}
                            onRowClick={handleRowClick}
                            getRowClassName={(params) => {
                                console.log(`super-app-theme--${params.getValue(params.id, 'disabled')}`)
                                return `super-app-theme--${params.getValue(params.id, 'disabled')}`
                            }
                            }

                        />
                    </div>
                   
                </Grid>
                <Grid item>
                {/* <FormControlLabel
                    control={<Checkbox checked={showDisabledStudents} onChange={handleShowDisabledStudents}/>}
                    label="Alunos desativados"
                /> */}
                    
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => getData()}><Refresh />Atualizar lista</Button>
                    
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => setOpenFollowUp(true)}><Assignment />Follow Up's</Button>
                    
                </Grid>
                <Grid item>
                    {selectedRows.length > 0 && (<Button variant="contained" color="secondary" onClick={() => {handleConfirmDisable()}}>Desativar selecionado{selectedRows.length > 1 && 's'}</Button>)}
                </Grid>
            </Grid>
        </Fragment>
        
    );
}
 
export default Students;