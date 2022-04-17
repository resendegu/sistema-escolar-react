import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select } from "@material-ui/core";
import { PlusOneRounded } from "@material-ui/icons";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { set } from "date-fns/esm";
import { Fragment, useEffect, useState } from "react";
import { coursesRef } from "../../../../services/databaseRefs";
import { LocaleText } from "../../../../shared/DataGridLocaleText";
import PlanEditor from "../PlanEditor";

const SchoolPlans = () => {

    const [ loading, setLoading ] = useState(false);
    const [ planEditor, setPlanEditor ] = useState(false);

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarExport csvOptions={{fileName: 'Planos cadastrados'}} />
          </GridToolbarContainer>
        );
      }

    const [ rows, setRows ] = useState([]);
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ plan, setPlan ] = useState();
    const [ course, setCourse ] = useState();
    const [ courses, setCourses ] = useState([]);
    const [dialog, setDialog] = useState(false);

    useEffect(() => {
        
        getAdditionalFields()
        
    }, [])

    useEffect(() => {
        
        console.log(course)
        
    }, [course])

    async function getAdditionalFields() {
        let localPlans = []
        setLoading(true)
        let snapshot = await coursesRef.once('value');
        setLoading(false)
        
        let localCourses = snapshot.exists() ? snapshot.val() : []
        setCourses(localCourses)
       
        localCourses.map((course, i) => {
            if (course.hasOwnProperty('planos')) {
                Object.keys(course.planos).map((key, i) => {
                    let plan = course.planos[key];
                    plan.id = key + ',' + course.codSistema;
                    localPlans.push(plan)
                })
            }
        })
        
        console.log(localCourses)
        console.log(localPlans)
        setRows(localPlans)
    }
    
    const handleAddRow = () => {
        // let rowsArray = JSON.parse(JSON.stringify(rows))
        // rowsArray.push({id: rowsArray.length, codSistema: rowsArray.length, codCurso: 'Digite um código...', nomeCurso: 'Digite...'})
        // setRows(rowsArray)
        // console.log(rowsArray)
        let planId = coursesRef.push().key
        
        setPlan(planId)
        setDialog(false)
        setPlanEditor(true)
    }

    const handleRowEdit = async (editedRow) => {
        setLoading(true);
        console.log(editedRow);
        let rowsArray = JSON.parse(JSON.stringify(rows))
        let rowIndex = rowsArray.findIndex(row => row.id === editedRow.id);
        rowsArray[rowIndex][editedRow.field] = editedRow.value;
        setRows(rowsArray);
        console.log(rowsArray)
        try {
            await coursesRef.set(rowsArray)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false);
            throw new Error(error.message)
        }
        
    }

    const handleRowSelection = (selectedRows) => {
        console.log(selectedRows)
        setSelectedRows(selectedRows)
    }

    const handleDeleteRows = async () => {
        setLoading(true)
        
        try {
            selectedRows.map(async (row, i) => {
                let planId = row.split(',')[0]
                let courseId = row.split(',')[1] 
                await coursesRef.child(courseId).child('planos').child(planId).remove();
            })
            
            getAdditionalFields();
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
            throw new Error(error.message);
        }
    }

    const handleRowClick = async (e) => {
        console.log(e)
        let planId = e.id.split(',')[0]
        let courseId = e.row.codCurso
        setCourse(courseId)
        setPlan(planId)
        
        setPlanEditor(true)
    }

    return (
        <Fragment>
            {planEditor && <PlanEditor isOpen={planEditor} setOpenDialog={setPlanEditor} courseId={course} planId={plan} />}

            
            <Grid
            justifyContent="flex-start"   
            container
            direction="row"
            spacing={2}
            >
                <Dialog open={dialog} onClose={() => setDialog(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Qual curso deseja atrelar o plano?</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Selecione um curso para criar o novo plano
                    </DialogContentText>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Curso</InputLabel>
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        fullWidth
                        >
                            {courses.map((localCourse, i) => <MenuItem value={localCourse.codSistema}>{localCourse.nomeCurso}</MenuItem>)}
                        </Select>
                    </FormControl>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => setDialog(false)} color="primary">
                        Fechar
                    </Button>
                    <Button onClick={handleAddRow} disabled={course === undefined} color="primary">
                        Continuar
                    </Button>
                    </DialogActions>
                </Dialog>
                <Grid item>
                    <h3>Planos Cadastrados</h3>
                </Grid>
                
                <Grid item xs={12}>
                    <div style={{ height: 300, width: '100%' }}>
                        <DataGrid 
                            rows={rows} 
                            columns={
                                [
                                    {field: 'nomePlano', headerName: 'Plano', width: 300, editable: false},
                                    {field: 'nomeCursoAdd', headerName: 'Curso', width: 300, editable: false},
                                    {field: 'valorCurso', headerName: 'Valor do Curso', width: 175, editable: false},
                                    {field: 'valorFinal', headerName: 'Valor Final', width: 150, editable: false},
                                ]
                            } 
                            disableSelectionOnClick 
                            checkboxSelection
                            components={{
                                Toolbar: CustomToolbar

                            }}
                            onCellEditCommit={handleRowEdit}
                            loading={loading}
                            localeText={LocaleText}
                            onSelectionModelChange={handleRowSelection}
                            onRowClick={(e) => handleRowClick(e)}
                        />
                    </div>
                   
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => {
                        setCourse();
                        setDialog(true)

                        }}><PlusOneRounded />Novo plano</Button>
                    
                </Grid>
                <Grid item>
                    <Button variant="contained" color="secondary" disabled={selectedRows.length === 0} onClick={() => {handleDeleteRows()}}>Excluir planos</Button>
                </Grid>
            </Grid>
        </Fragment>
        
    );
}
 
export default SchoolPlans;