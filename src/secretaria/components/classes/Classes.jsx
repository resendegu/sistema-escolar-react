import { Button, Dialog, Grid } from "@material-ui/core";
import { PlusOneRounded, Refresh } from "@material-ui/icons";
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { Fragment, useEffect, useState } from "react";
import { classesRef } from "../../../services/databaseRefs";
import { LocaleText } from "../../../shared/DataGridLocaleText";
import FullScreenDialog from "../../../shared/FullscreenDialog";
import ClassInfo from "../../../shared/ViewClassInfo";
import StudentInfo from "../../../shared/ViewStudentInfo";

const Classes = () => {


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
        let snapshot = await classesRef.once('value');
        
        let classes = snapshot.exists() ? snapshot.val() : []
        let classesArray = []
        for (const id in classes) {
            if (Object.hasOwnProperty.call(classes, id)) {
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
                theClass.status = theClass.hasOwnProperty('status') ? theClass.status.turma : '(Sem dados)'

      
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
                <ClassInfo classDataRows={classData} />
            </FullScreenDialog>
            <Grid
            justifyContent="flex-start"   
            container
            direction="row"
            spacing={2}
            >
                
                
                <Grid item xs={12}>
                    <div style={{ height: "59vh", width: '100%' }}>
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