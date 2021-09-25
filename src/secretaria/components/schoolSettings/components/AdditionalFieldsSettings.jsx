import { Button, Grid } from "@material-ui/core";
import { PlusOneRounded } from "@material-ui/icons";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { Fragment, useEffect, useState } from "react";
import { additionalFieldsRef } from "../../../../services/databaseRefs";

const AdditionalFieldsSetting = () => {

    const [ loading, setLoading ] = useState(false);

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
            <GridToolbarExport csvOptions={{fileName: 'Tabela de campos adicionais'}} />
          </GridToolbarContainer>
        );
      }

    const [ rows, setRows ] = useState([]);
    const [ selectedRows, setSelectedRows ] = useState([]);

    useEffect(() => {
        async function getAdditionalFields() {
            setLoading(true)
            let snapshot = await additionalFieldsRef.once('value');
            setLoading(false)
            let additionalFields = snapshot.exists() ? snapshot.val() : []
            console.log(additionalFields)
            setRows(additionalFields)
        }
        getAdditionalFields()
        
    }, [])
    
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
        try {
            await additionalFieldsRef.set(rowsArray)
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
            await additionalFieldsRef.set(updatedRows);
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
            <h3>Campos adicionais personalizados que aparecerão no cadastro de alunos</h3>
            <Grid
            justifyContent="flex-start"   
            container
            direction="row"
            spacing={2}
            >
                
                
                <Grid item xs={12}>
                    <div style={{ height: 300, width: '100%' }}>
                        <DataGrid 
                            rows={rows} 
                            columns={
                                [
                                    {field: 'label', headerName: 'Nome', width: 250, editable: true},
                                    {field: 'placeholder', headerName: 'Texto de ajuda', width: 180, editable: true},
                                    {
                                        field: 'required', 
                                        headerName: 'Obrigatório',
                                        type: 'boolean', 
                                        width: 180, 
                                        editable: true,
                                        
                                    },
                            
                                ]
                            } 
                            disableSelectionOnClick 
                            checkboxSelection
                            components={{
                                Toolbar: CustomToolbar

                            }}
                            onCellEditCommit={handleRowEdit}
                            loading={loading}
                            localeText={{
                                noRowsLabel: 'Você não adicionou nenhum campo. Clique em NOVO CAMPO.',
                                errorOverlayDefaultLabel: 'Ocorreu um erro',
                                toolbarExportCSV: 'Baixar como CSV',
                                
                            }}
                            onSelectionModelChange={handleRowSelection}
                        />
                    </div>
                   
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => {handleAddRow()}}><PlusOneRounded />Novo campo</Button>
                    
                </Grid>
                <Grid item>
                    {selectedRows.length > 0 && (<Button variant="contained" color="secondary" onClick={() => {handleDeleteRows()}}>Excluir Campos</Button>)}
                </Grid>
            </Grid>
        </Fragment>
        
    );
}

export default AdditionalFieldsSetting;