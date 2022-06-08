import { Button, createTheme, darken, Dialog, Grid, lighten, makeStyles } from "@material-ui/core";
import { PlusOneRounded, Refresh } from "@material-ui/icons";
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { Fragment, useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { classesRef, usersRef } from "../../../services/databaseRefs";
import { LocaleText } from "../../../shared/DataGridLocaleText";
import FullScreenDialog from "../../../shared/FullscreenDialog";
import { capitalizeFirstLetter } from "../../../shared/FunctionsUse";
import ClassPanelTeacher from "./ClassPanelTeacher";

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
          '& .super-app-theme--Aberta': {
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
          '& .super-app-theme--Fechada': {
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

const Classes = () => {

    const classes = useStyles();
    const {user} = useAuth();
    const [ loading, setLoading ] = useState(false);
    const [ open, setOpen ] = useState(false)

    const [filterModel, setFilterModel] = useState({
        items: [],
    });

    // const [ students, setStudents ] = useState({});  
    const [ rows, setRows ] = useState([]);
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ classData, setClassData ] = useState({})

    useEffect(() => {
        
        getData()
        
    }, [])

    async function getData() {
        setLoading(true)    
        
        const localTeacherClasses = (await usersRef.child(user.id).child("professor/turmas").once("value")).val()

        let snapshot = await classesRef.once('value');
        
        let classes = snapshot.exists() ? snapshot.val() : []
        let classesArray = []
        for (const id in localTeacherClasses) {
            if (Object.hasOwnProperty.call(localTeacherClasses, id)) {
                let theClass = classes[id];
                
                theClass.id = id;
                
                if (theClass.hasOwnProperty('professor')) {
                    theClass.professor = theClass.professor[0].nome
                } else {
                    theClass.professor = 'Professor(a) não encontrado(a)'
                }
                theClass.hora = theClass.hora.indexOf('_') === -1 ? theClass.hora + ':00' : theClass.hora.split('_').join(':')
                let timestamp = new Date(theClass.timestamp._seconds * 1000)
                theClass.timestamp = timestamp.toLocaleDateString() + ' ás ' + timestamp.toLocaleTimeString()

                theClass.modalidade = theClass.modalidade === 'ead' ? 'Ensino a Distância' : 'Presencial'

                theClass.currentPeriod = theClass.hasOwnProperty('status') ? theClass.status.nomePeriodo : ''
                theClass.status = theClass.hasOwnProperty('status') ? capitalizeFirstLetter(theClass.status.turma) : 'Sem dados'

      
                classesArray.push(theClass);
            }
        }
        // setStudents(students);
        setRows(classesArray);
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
        setClassData(e.row)
        console.log(e.row)
        setOpen(true);
        

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
                title={"Informações da turma"}
                saveButton={"Salvar"}
                saveButtonDisabled={true}
            > 
                <ClassPanelTeacher classDataRows={classData} onClose={() => setOpen(false)}/>
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
                            filterModel={filterModel}
                            onFilterModelChange={(model) => setFilterModel(model)}
                            rows={rows} 
                            columns={
                                [
                                    {field: 'codigoSala', headerName: 'Turma', width: 200},
                                    {field: 'hora', headerName: 'Hr. Início', width: 140},
                                    {field: 'horarioTerminoTurma', headerName: 'Hr. Fim', width: 140},
                                    {field: 'professor', headerName: 'Prof. Referência', width: 220},
                                    {field: 'modalidade', headerName: 'Modalidade', width: 180},
                                    {field: 'status', headerName: 'Status', width: 180},
                                    {field: 'currentPeriod', headerName: 'Período', width: 180},
                                    {field: 'timestamp', headerName: 'Data/Hora Criação', width: 200},
                                    
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
                                console.log(`super-app-theme--${params.getValue(params.id, 'status')}`)
                                return `super-app-theme--${params.getValue(params.id, 'status')}`
                            }
                            }
                        />
                    </div>
                   
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => {getData()}}><Refresh />Atualizar lista</Button>
                    
                </Grid>
                <Grid item>
                    {selectedRows.length > 0 && (<Button variant="contained" color="secondary" onClick={() => {handleDeleteRows()}}>Botão de ações</Button>)}
                </Grid>
            </Grid>
        </Fragment>
        
    );
}
 
export default Classes;