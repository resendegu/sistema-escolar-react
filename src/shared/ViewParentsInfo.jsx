import { Avatar, Box, Button, Card, CardContent, Checkbox, Fab, FormControl, FormControlLabel, Grid, IconButton, InputLabel, makeStyles, Select, TextField, Tooltip, Typography } from "@material-ui/core";
import { Add, Delete, Save, SupervisedUserCircle } from "@material-ui/icons";
import { useEffect, useState, useRef } from "react";
import { Fragment } from "react";
import { disabledStudentsRef, preEnrollmentsRef, studentsRef } from "../services/databaseRefs";
import { useSnackbar } from "notistack";
import { getDateMeta } from "@fullcalendar/react";
import FullScreenDialog from "./FullscreenDialog";
import { useConfirmation } from "../contexts/ConfirmContext";

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


const ViewParentsInfo = ({studentId, isOpen, onClose, isDisabled, preEnrollment}) => {

    const classes = useStyles();

    const confirm = useConfirmation();

    const [parents, setParents] = useState({});
    const [ edit, setEdit ] = useState(false);
    const [mouseOver, setMouseOver] = useState();

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    
    const form = useRef();

    const getData = async () => {
        if (preEnrollment) {
            const snapshot = await preEnrollmentsRef.child(studentId).child('responsaveis').once("value")
            const parentsArray = snapshot.exists() ? snapshot.val() : [];
            console.log(parentsArray);
            setParents(parentsArray);
        } else {
            const snapshot = !isDisabled ? (await studentsRef.child(studentId).child('responsaveis').once("value")) : (await disabledStudentsRef.child(studentId + '/dadosAluno').child('responsaveis').once('value'));
            const parentsArray = snapshot.exists() ? snapshot.val() : [];
            console.log(parentsArray);
            setParents(parentsArray);
        }
        
    }

    useEffect(() => {
        getData();
    }, [studentId])

    

    const handleSaveData = async (e) => {
        e.preventDefault();
        try {
            if (edit && Object.keys(parents).length > 0) {
                form.current.requestSubmit();
                preEnrollment ? await preEnrollmentsRef.child(studentId).child('responsaveis').set(parents) : await studentsRef.child(studentId).child('responsaveis').set(parents);
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
        let parentsCopy = parents;
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
        setParents(parentsCopy)
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
                const key = Object.keys(parents)[i]
                preEnrollment ? await preEnrollmentsRef.child(studentId).child('responsaveis').child(key).remove() : await studentsRef.child(studentId).child('responsaveis').child(key).remove()
                enqueueSnackbar("Responsável excluído com sucesso.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                getData()
            } catch (error) {
                console.log(error)
                error && enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            }
        else
            enqueueSnackbar('Não é possível apagar enquanto o aluno está desativado', {title: 'Erro', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        
    }

    

    const ParentsCards = ({parentsCopy}) => {

        useEffect(() => {}, [parentsCopy])
        
        const BuiltCards = Object.keys(parentsCopy).map((key, i) => {
            let par = parentsCopy[key];
            
            return (
                <Card className={classes.smallCards} variant="outlined">
                    <CardContent>
                        <Grid
                            justifyContent="flex-start"
                            direction="row"
                            container
                            spacing={1}
                        >
                            <Grid item >
                            <div onMouseEnter={() => setMouseOver(i)} onMouseLeave={() => setMouseOver(false)}>
                                {mouseOver === i ? (
                                    <IconButton color="primary"  disabled={Object.keys(parents).length === 1} aria-label="delete parent" component="span" onClick={() => handleDeleteParent(i)}>
                                        <Delete />
                                    </IconButton>
                                ) : ( 
                                <Avatar className={classes.avatar}>
                                    
                                    <SupervisedUserCircle  />
                                </Avatar>)}
                            </div>
                                
                            </Grid>

                            <Grid item>
                                <Typography variant="h5" component="h2">
                                Responsável {i + 1}
                                </Typography>
                        
                        
                            </Grid>
                        </Grid>
                        <hr />
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"Nome"}
                                defaultValue={par.nome}
                                onChange={(e) => {
                                    parentsCopy[key].nome = e.target.value
                                    setParents(parentsCopy)
                                }}
                                fullWidth
                                type="text"
                                size="small"
                                required
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"CPF"}
                                defaultValue={par.cpf}
                                onChange={(e) => {
                                    parentsCopy[key].cpf = e.target.value
                                    setParents(parentsCopy)
                                }}
                                fullWidth
                                type="number"
                                size="small"
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"RG"}
                                defaultValue={par.rg}
                                onChange={(e) => {
                                    parentsCopy[key].rg = e.target.value
                                    setParents(parentsCopy)
                                }}
                                fullWidth
                                type="text"
                                size="small"
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"E-mail"}
                                defaultValue={par.email}
                                onChange={(e) => {
                                    parentsCopy[key].email = e.target.value
                                    setParents(parentsCopy)
                                }}
                                fullWidth
                                type="email"
                                size="small"
                            />
                        </Box>
                        <Box m={1}>
                            <TextField 
                                disabled={!edit}
                                label={"Celular"}
                                defaultValue={par.celular}
                                onChange={(e) => {
                                    parentsCopy[key].celular = e.target.value
                                    setParents(parentsCopy)
                                }}
                                fullWidth
                                type="number"
                                size="small"
                            />
                        </Box>
                        <Box m={1}>
                            <FormControl fullWidth size="small" variant="filled">
                                <InputLabel htmlFor="relacao" style={{marginTop: '16px',}} required shrink={true}>Relação</InputLabel>
                                <Select
                                    disabled={!edit}
                                    fullWidth
                                    style={{marginTop: '16px',}}
                                    native
                                    // value={state.value}
                                    // onChange={handleChangeDay}
                                    inputProps={{
                                        name: 'relacao',
                                        id: 'relacao',
                                    }}
                                    defaultValue={par.relacao}
                                    onChange={(e) => {
                                        parentsCopy[key].relacao = e.target.value
                                        setParents(parentsCopy)
                                    }}
                                    size="small"
                                    required
                                >
                                    <option hidden>Escolha...</option>
                                    <option value="Mãe">Mãe</option>
                                    <option value="Pai">Pai</option>
                                    <option value="Tio">Tio</option>
                                    <option value="Tia">Tia</option>
                                    <option value="Avô">Avô</option>
                                    <option value="Avó">Avó</option>
                                    <option value="Responsável">Responsável</option>
                                    
                                </Select>
                                
                            </FormControl>
                        </Box>

                        <Box m={1}>
                            <FormControl className={classes.fields} size="small">
                            <FormControlLabel
                                defaultValue={par.pedagogico}
                                control={<Checkbox id="pedagogico" defaultChecked={par.pedagogico} onChange={(e) => {
                                    parentsCopy[key].pedagogico = e.target.checked
                                    setParents(parentsCopy)
                                }} name="pedagogico" color="primary" size="small" />}
                                label="Responsável Pedagógico"
                                labelPlacement="end"
                                disabled={!edit}
                            />
                            </FormControl>
                        </Box>

                        <Box m={1}>
                            <FormControl className={classes.fields} size="small">
                            <FormControlLabel
                                defaultValue={par.financeiro}
                                control={<Checkbox id="financeiro" size="small"  defaultChecked={par.financeiro} onChange={(e) => {
                                    parentsCopy[key].financeiro = e.target.value
                                    setParents(parentsCopy)
                                }} name="financeiro" color="primary" />}
                                label="Responsável Financeiro"
                                labelPlacement="end"
                                disabled={!edit}
                                
                            />
                            </FormControl>
                        </Box>

                
                        
                        
                        
                    </CardContent>
                        
                </Card>
            
            
        )})

        return BuiltCards;
    }



    return (
        <Fragment>
            <FullScreenDialog
                isOpen={isOpen}
                onClose={onClose}
                
                onSave={() => {
                    if (!isDisabled)
                        edit ? form.current.requestSubmit() : setEdit(true)
                    else
                        enqueueSnackbar('Não é possível editar enquanto o aluno está desativado', {title: 'Erro', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                }}
                title={"Ver/Editar responsáveis"}
                saveButton={edit ? "Salvar" : "Editar"}
                
              >
                <form ref={form} onSubmit={handleSaveData} className={classes.container}>
                        
                        <ParentsCards parentsCopy={parents} />
                    
                    

                    <Card className={classes.smallCards} variant="outlined">
                        <CardContent>
                            <Grid
                                justifyContent="flex-start"
                                direction="row"
                                container
                                spacing={1}
                            >
                                <Grid item>
                                    <Avatar className={classes.avatar}>
                                        <Add  />
                                    </Avatar>
                                </Grid>

                                <Grid item>
                                    <Typography variant="h5" component="h2">
                                    Novo Responsável 
                                    </Typography>
                            
                            
                                </Grid>
                            </Grid>
                            <hr />
                            <div className={classes.center}>
                                <Tooltip title="Adicionar responsável">
                                    {isDisabled ? (<p>Reative o estudante para adicionar responsáveis</p>) :( 
                                    <IconButton color="primary" disabled={edit} aria-label="upload picture" component="span" onClick={handleAddParent}>
                                        <Add fontSize="large" />
                                    </IconButton>)}
                                </Tooltip>
                                
                            </div>
                            
                            

                    
                            
                            
                            
                        </CardContent>
                            
                    </Card>

                </form>
              </FullScreenDialog>
            
            

        </Fragment>
    );
}
 
export default ViewParentsInfo;