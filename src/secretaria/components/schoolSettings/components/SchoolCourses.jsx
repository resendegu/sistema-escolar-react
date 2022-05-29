import { Button, Grid } from "@material-ui/core";
import { PlusOneRounded } from "@material-ui/icons";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { Fragment, useEffect, useState } from "react";
import { coursesRef } from "../../../../services/databaseRefs";
import { LocaleText } from "../../../../shared/DataGridLocaleText";

const SchoolCourses = () => {

    const [ loading, setLoading ] = useState(false);

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarExport csvOptions={{fileName: 'Tabela de cursos cadastrados'}} />
          </GridToolbarContainer>
        );
      }

    const [ rows, setRows ] = useState([]);
    const [ selectedRows, setSelectedRows ] = useState([]);

    useEffect(() => {
        async function getAdditionalFields() {
            setLoading(true)
            let snapshot = await coursesRef.once('value');
            setLoading(false)
            let additionalFields = snapshot.exists() ? snapshot.val() : []
            console.log(additionalFields)
            setRows(additionalFields)
        }
        getAdditionalFields()
        
    }, [])
    
    const handleAddRow = () => {
        let rowsArray = JSON.parse(JSON.stringify(rows))
        rowsArray.push({id: rowsArray.length, codSistema: rowsArray.length, codCurso: 'Digite um código...', nomeCurso: 'Digite...'})
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
        let rowsArray = JSON.parse(JSON.stringify(rows));
        let updatedRows = rowsArray.filter(row => selectedRows.indexOf(row.id) === -1);
        console.log(updatedRows);
        
        try {
            await coursesRef.set(updatedRows);
            setRows(updatedRows);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
            throw new Error(error.message);
        }
    }

    return (
        <Fragment>
            
            <Grid
            justifyContent="flex-start"   
            container
            direction="row"
            spacing={2}
            >
                
                <Grid item>
                    <h3>Cursos cadastrados</h3>
                </Grid>
                
                <Grid item xs={12}>
                    <div style={{ height: 300, width: '100%' }}>
                        <DataGrid 
                            rows={rows} 
                            columns={
                                [
                                    {field: 'codSistema', headerName: 'ID', description: "Código apenas para identificação interna no sistema. Não aparecerá em outros documentos do sistema.", width: 92, editable: false},
                                    {field: 'codCurso', headerName: 'Código', description: "O código do curso será utilizado para formar o código automático da turma.", width: 130, editable: true},
                                    {field: 'nomeCurso', headerName: 'Nome do Curso', description: "Este será o nome que aparecerá nos boletins.", width: 300, editable: true},
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
                        />
                    </div>
                   
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => {handleAddRow()}}><PlusOneRounded />Novo curso</Button>
                    
                </Grid>
                <Grid item>
                    {selectedRows.length > 0 && (<Button variant="contained" color="secondary" onClick={() => {handleDeleteRows()}}>Excluir cursos</Button>)}
                </Grid>
            </Grid>
        </Fragment>
        
    );
}
 
export default SchoolCourses;