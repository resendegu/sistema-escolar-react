import { Avatar, Box, Button, Card, CardContent, Checkbox, Fab, FormControl, FormControlLabel, Grid, IconButton, InputLabel, makeStyles, Select, TextField, Tooltip, Typography } from "@material-ui/core";
import { Add, Delete, Save, SupervisedUserCircle } from "@material-ui/icons";
import { useEffect, useState, useRef } from "react";
import { Fragment } from "react";
import { disabledStudentsRef, preEnrollmentsRef, studentsRef } from "../services/databaseRefs";
import { useSnackbar } from "notistack";
import { getDateMeta } from "@fullcalendar/react";
import FullScreenDialog from "./FullscreenDialog";
import { useConfirmation } from "../contexts/ConfirmContext";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { LocaleText } from "./DataGridLocaleText";
import BaseDocument from "./BaseDocument";

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
          },
          position: "absolute"
    },
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      padding: "3px",
      flexWrap: "wrap",
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    smallCards: {
      minWidth: 295,
      minHeight: "50vh",
      maxWidth: 350,
      height: "fit-content",
      marginLeft: "10px",
      width: "fit-content",
      marginBottom: "5px",
      overflow: "auto"
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
     center: {
        width: "100%",
        height: "100%",
        lineHeight: "200px",
        
        textAlign: "center",
      },
      extendedIcon: {
        marginRight: theme.spacing(1),
      },
  }));


const ViewStudentHistory = ({studentId, isOpen, onClose, isDisabled}) => {

    const classes = useStyles();

    const confirm = useConfirmation();

    const [history, setHistory] = useState({});
    const [ edit, setEdit ] = useState(false);
    const [mouseOver, setMouseOver] = useState();
    const [filterModel, setFilterModel] = useState({
        items: [],
    });
    const [openResult, setOpenResult] = useState(false)

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    
    const form = useRef();

    const getData = async () => {
        let histArray = []
        const snapshot = !isDisabled ? (await studentsRef.child(studentId).child('historicoEscolar').once("value")) : (await disabledStudentsRef.child(studentId + '/dadosAluno').child('historicoEscolar').once('value'));
        const historyObj = snapshot.exists() ? snapshot.val() : [];
        
        for (const id in historyObj) {
            if (Object.hasOwnProperty.call(historyObj, id)) {
                let hist = historyObj[id];
                hist.id = id
                hist.nomePeriodo = hist.infoAluno.nomePeriodo
                let grade = hist.infoAluno.notas
                let somatorio = 0
                for (const gradeName in grade) {
                    if (Object.hasOwnProperty.call(grade, gradeName)) {
                        const value = grade[gradeName];
                        somatorio += value
                    }
                }
                hist.somatorio = somatorio
                let now = new Date(hist.timestamp._seconds * 1000)
                hist.fechamento = now
                histArray.push(hist)
            }
        }

        setHistory(histArray);
        
        
    }

    useEffect(() => {
        getData();
    }, [studentId])

    

    const handleSaveData = async (e) => {
        e.preventDefault();
        try {
            if (edit && Object.keys(history).length > 0) {
                form.current.requestSubmit();
                await studentsRef.child(studentId).child('responsaveis').set(history);
                enqueueSnackbar("Responsáveis atualizados com sucesso.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                setEdit(false)
            }
            
        } catch (error) {
            console.log(error);
            enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        }
        

    }


    const handleAddParent = async () => {
        const key = studentsRef.child(studentId).child('responsaveis').push().key
        console.log(key)
        let parentsCopy = history;
        parentsCopy[key] = {
            celular: "",
            cpf: "",
            email: "",
            financeiro: false,
            nome: "",
            pedagogico: false,
            relacao: "",
            rg: ""
        }
        console.log(parentsCopy)
        setHistory(parentsCopy)
        setEdit(true)
    }

    const handleDeleteParent = async (i) => {
        if (!isDisabled)
            try {
                await confirm({
                    variant: "danger",
                    catchOnCancel: true,
                    title: "Confirmação",
                    description: "Você deseja excluir este responsável? Esta ação não pode ser revertida."
                })
                const key = Object.keys(history)[i]
                await studentsRef.child(studentId).child('responsaveis').child(key).remove()
                enqueueSnackbar("Responsável excluído com sucesso.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                getData()
            } catch (error) {
                console.log(error)
                error && enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            }
        else
            enqueueSnackbar('Não é possível apagar enquanto o aluno está desativado', {title: 'Erro', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        
    }

    

    // const HistoryCards = ({historyCopy}) => {

    //     useEffect(() => {}, [historyCopy])
        
    //     const BuiltCards = Object.keys(historyCopy).map((key, i) => {
    //         let par = historyCopy[key];
            
    //         return (
    //             <Card className={classes.smallCards} variant="outlined">
    //                 <CardContent>
    //                     <Grid
    //                         justifyContent="flex-start"
    //                         direction="row"
    //                         container
    //                         spacing={1}
    //                     >
    //                         <Grid item >
    //                         <div onMouseEnter={() => setMouseOver(i)} onMouseLeave={() => setMouseOver(false)}>
    //                             {mouseOver === i ? (
    //                                 <IconButton color="primary"  disabled={Object.keys(parents).length === 1} aria-label="delete parent" component="span" onClick={() => handleDeleteParent(i)}>
    //                                     <Delete />
    //                                 </IconButton>
    //                             ) : ( 
    //                             <Avatar className={classes.avatar}>
                                    
    //                                 <SupervisedUserCircle  />
    //                             </Avatar>)}
    //                         </div>
                                
    //                         </Grid>

    //                         <Grid item>
    //                             <Typography variant="h5" component="h2">
    //                             Responsável {i + 1}
    //                             </Typography>
                        
                        
    //                         </Grid>
    //                     </Grid>
    //                     <hr />
    //                     <Box m={1}>
    //                         <TextField 
    //                             disabled={!edit}
    //                             label={"Nome"}
    //                             defaultValue={par.nome}
    //                             onChange={(e) => {
    //                                 historyCopy[key].nome = e.target.value
    //                                 setParents(historyCopy)
    //                             }}
    //                             fullWidth
    //                             type="text"
    //                             size="small"
    //                             required
    //                         />
    //                     </Box>
    //                     <Box m={1}>
    //                         <TextField 
    //                             disabled={!edit}
    //                             label={"CPF"}
    //                             defaultValue={par.cpf}
    //                             onChange={(e) => {
    //                                 historyCopy[key].cpf = e.target.value
    //                                 setParents(historyCopy)
    //                             }}
    //                             fullWidth
    //                             type="number"
    //                             size="small"
    //                         />
    //                     </Box>
    //                     <Box m={1}>
    //                         <TextField 
    //                             disabled={!edit}
    //                             label={"RG"}
    //                             defaultValue={par.rg}
    //                             onChange={(e) => {
    //                                 historyCopy[key].rg = e.target.value
    //                                 setParents(historyCopy)
    //                             }}
    //                             fullWidth
    //                             type="text"
    //                             size="small"
    //                         />
    //                     </Box>
    //                     <Box m={1}>
    //                         <TextField 
    //                             disabled={!edit}
    //                             label={"E-mail"}
    //                             defaultValue={par.email}
    //                             onChange={(e) => {
    //                                 historyCopy[key].email = e.target.value
    //                                 setParents(historyCopy)
    //                             }}
    //                             fullWidth
    //                             type="email"
    //                             size="small"
    //                         />
    //                     </Box>
    //                     <Box m={1}>
    //                         <TextField 
    //                             disabled={!edit}
    //                             label={"Celular"}
    //                             defaultValue={par.celular}
    //                             onChange={(e) => {
    //                                 historyCopy[key].celular = e.target.value
    //                                 setParents(historyCopy)
    //                             }}
    //                             fullWidth
    //                             type="number"
    //                             size="small"
    //                         />
    //                     </Box>
    //                     <Box m={1}>
    //                         <FormControl fullWidth size="small" variant="filled">
    //                             <InputLabel htmlFor="relacao" style={{marginTop: '16px',}} required shrink={true}>Relação</InputLabel>
    //                             <Select
    //                                 disabled={!edit}
    //                                 fullWidth
    //                                 style={{marginTop: '16px',}}
    //                                 native
    //                                 // value={state.value}
    //                                 // onChange={handleChangeDay}
    //                                 inputProps={{
    //                                     name: 'relacao',
    //                                     id: 'relacao',
    //                                 }}
    //                                 defaultValue={par.relacao}
    //                                 onChange={(e) => {
    //                                     historyCopy[key].relacao = e.target.value
    //                                     setParents(historyCopy)
    //                                 }}
    //                                 size="small"
    //                                 required
    //                             >
    //                                 <option hidden>Escolha...</option>
    //                                 <option value="Mãe">Mãe</option>
    //                                 <option value="Pai">Pai</option>
    //                                 <option value="Tio">Tio</option>
    //                                 <option value="Tia">Tia</option>
    //                                 <option value="Avô">Avô</option>
    //                                 <option value="Avó">Avó</option>
    //                                 <option value="Responsável">Responsável</option>
                                    
    //                             </Select>
                                
    //                         </FormControl>
    //                     </Box>

    //                     <Box m={1}>
    //                         <FormControl className={classes.fields} size="small">
    //                         <FormControlLabel
    //                             defaultValue={par.pedagogico}
    //                             control={<Checkbox id="pedagogico" defaultChecked={par.pedagogico} onChange={(e) => {
    //                                 historyCopy[key].pedagogico = e.target.checked
    //                                 setParents(historyCopy)
    //                             }} name="pedagogico" color="primary" size="small" />}
    //                             label="Responsável Pedagógico"
    //                             labelPlacement="end"
    //                             disabled={!edit}
    //                         />
    //                         </FormControl>
    //                     </Box>

    //                     <Box m={1}>
    //                         <FormControl className={classes.fields} size="small">
    //                         <FormControlLabel
    //                             defaultValue={par.financeiro}
    //                             control={<Checkbox id="financeiro" size="small"  defaultChecked={par.financeiro} onChange={(e) => {
    //                                 historyCopy[key].financeiro = e.target.value
    //                                 setParents(historyCopy)
    //                             }} name="financeiro" color="primary" />}
    //                             label="Responsável Financeiro"
    //                             labelPlacement="end"
    //                             disabled={!edit}
                                
    //                         />
    //                         </FormControl>
    //                     </Box>

                
                        
                        
                        
    //                 </CardContent>
                        
    //             </Card>
            
            
    //     )})

    //     return BuiltCards;
    // }

    const handlePrintResult = (histId) => {
        console.log(histId)
        window.location.hash = 'boletim?' + studentId + '?' + histId
        setOpenResult(true)
    }

    return (
        <Fragment>
            {openResult && <BaseDocument open={openResult} onClose={setOpenResult}/>}
            <FullScreenDialog
                isOpen={isOpen}
                onClose={onClose}
                
                onSave={() => {
                    if (!isDisabled)
                        edit ? form.current.requestSubmit() : setEdit(true)
                    else
                        enqueueSnackbar('Não é possível editar enquanto o aluno está desativado', {title: 'Erro', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                }}
                title={"Histórico do aluno"}
                saveButton={edit ? "Salvar" : "Editar"}
                hideSaveButton
                saveButtonDisabled
                
              >
                <DataGrid 
                    filterModel={filterModel}
                    onFilterModelChange={(model) => setFilterModel(model)}
                    rows={history} 
                    columns={
                        [
                            {field: 'turma', headerName: 'Turma', width: 200},
                            {field: 'nomePeriodo', headerName: 'Período', width: 200},
                            {field: 'somatorio', headerName: 'Nota', width: 120},
                            {field: 'fechamento', headerName: 'Fechamento', type: 'dateTime', width: 210},
                            {
                                field: 'id',
                                headerName: 'Ações',
                                minWidth: 150,
                                flex: 1,
                                renderCell: (params) => (
                                  <strong>
                                    
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      size="small"
                                      style={{ marginLeft: 16 }}
                                      onClick={() => handlePrintResult(params.value) }
                                    >
                                      Boletim
                                    </Button>
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
                    //onCellEditCommit={handleRowEdit}
                    //loading={loader}
                    localeText={LocaleText}
                    //onSelectionModelChange={handleRowSelection}
                    //onRowClick={handleRowClick}
                />
              </FullScreenDialog>
            
            

        </Fragment>
    );
}
 
export default ViewStudentHistory;