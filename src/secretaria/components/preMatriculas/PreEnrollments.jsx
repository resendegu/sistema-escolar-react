import { Button, Checkbox, createTheme, darken, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, lighten, makeStyles } from "@material-ui/core";
import { CheckBox, DeleteForever, PlusOneRounded, Refresh } from "@material-ui/icons";
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { useConfirmation } from "../../../contexts/ConfirmContext";
import { preEnrollmentsRef } from "../../../services/databaseRefs";
import { LocaleText } from "../../../shared/DataGridLocaleText";
import FullScreenDialog from "../../../shared/FullscreenDialog";
import { handleEnableDisableStudents } from "../../../shared/FunctionsUse";
import StudentInfo from "../../../shared/ViewStudentInfo";
import ViewPreEnrollment from "./ViewPreEnrollment";

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

const PreEnrollments = ({changeTab}) => {

    const classes = useStyles();

    const confirm = useConfirmation();

    const [ loading, setLoading ] = useState(false);
    const [ open, setOpen ] = useState(false);
    const [ openDialog, setOpenDialog ] = useState(false);

    const [filterModel, setFilterModel] = useState({
        items: [],
    });

    // const [ students, setStudents ] = useState({});  
    const [ rows, setRows ] = useState([]);
    const [ selectedRows, setSelectedRows ] = useState([]);
    const [ studentInfo, setStudentInfo ] = useState({})

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    useEffect(() => {
        
        getData()
        
    }, [])
    
    async function getData() {
        setLoading(true)
        let snapshot = await preEnrollmentsRef.once('value');
        
        let students = snapshot.exists() ? snapshot.val() : []
        let studentsArray = []
        for (const id in students) {
            if (Object.hasOwnProperty.call(students, id)) {
                let student = students[id];
                student.id = id;
                studentsArray.push(student);
            }
        }
        // setStudents(students);
        setRows([...studentsArray]);
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
      try {
        await confirm({
          variant: "danger",
          catchOnCancel: true,
          title: "Confirmação",
          description: `Você deseja deletar os cadastros selecionados? Não é possível reverter esta ação.`,
        });
  
        for (const i in selectedRows) {
          if (Object.hasOwnProperty.call(selectedRows, i)) {
            const row = selectedRows[i];
            
            await preEnrollmentsRef.child(row).remove();
          }
        } 
        enqueueSnackbar('Cadastro deletado com sucesso', {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        getData()
      } catch (error) {
        console.log(error)
        error && enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
      }
      setLoading(false)
    }

    const handleRowClick = (e) => {
        console.log(e)
        setOpen(true);
        setStudentInfo({id: e.id, classCode: e.row.turmaAluno, disabled: e.row.hasOwnProperty('disabled') ? true : false})

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
                <ViewPreEnrollment studentInfo={studentInfo} changeTab={changeTab} />
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
                                    {field: 'nomeAluno', headerName: 'Nome', width: 300},
                                    
                                    {field: 'emailAluno', headerName: 'E-mail', width: 220},
                                    {field: 'celularAluno', headerName: 'Celular', width: 180},
                                    
                                    
                            
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
                
                    
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={() => getData()}><Refresh />Atualizar lista</Button>
                    
                </Grid>
                <Grid item>
                  <Button variant="contained" color="secondary" disabled={selectedRows.length === 0} onClick={handleDeleteRows}><DeleteForever />Deletar cadastro</Button>
                </Grid>
            </Grid>
        </Fragment>
        
    );
}
 
export default PreEnrollments;