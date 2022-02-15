import { Avatar, Box, Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, Grid, IconButton, InputLabel, makeStyles, Select, TextField, Tooltip, Typography } from "@material-ui/core";
import { Add, SupervisedUserCircle } from "@material-ui/icons";
import { useEffect, useState } from "react";
import { Fragment } from "react";
import { studentsRef } from "../services/databaseRefs";

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
      }
  }));


const ViewParentsInfo = ({studentId, setEdit, edit}) => {

    const classes = useStyles();

    const [parents, setParents] = useState({});
    

    useEffect(() => {
        getData();
    }, [studentId])

    useEffect(() => {
        if(!edit && parents.length > 0) {
            console.log(parents)
            handleSaveData()
            
        }
    }, [edit])

    useEffect(() => {
        console.log(parents)
    }, [parents])

    const handleSaveData = async () => {
        try {
            await studentsRef.child(studentId).child('responsaveis').set(parents)
        } catch (error) {
            console.log(error)
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

    const getData = async () => {
        const snapshot = await studentsRef.child(studentId).child('responsaveis').once("value");
        const parentsArray = snapshot.exists() ? snapshot.val() : [];
        console.log(parentsArray);
        setParents(parentsArray);
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
                        <Grid item>
                            <Avatar className={classes.avatar}>
                                <SupervisedUserCircle  />
                            </Avatar>
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
                        />
                    </Box>
                    <Box m={1}>
                        <TextField 
                            disabled={!edit}
                            label={"CPF"}
                            defaultValue={par.cpf}
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
                                size="small"
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
                            control={<Checkbox id="pedagogico" checked={par.pedagogico} name="pedagogico" color="primary" size="small" />}
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
                            control={<Checkbox id="financeiro" size="small" checked={par.financeiro} name="financeiro" color="primary" />}
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
            <div className={classes.container}>

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
                                    <IconButton color="primary" aria-label="upload picture" component="span" onClick={handleAddParent}>
                                        <Add fontSize="large" />
                                    </IconButton>
                                </Tooltip>
                                
                            </div>
                            
                            

                    
                            
                            
                            
                        </CardContent>
                            
                    </Card>
                
            </div>
            

        </Fragment>
    );
}
 
export default ViewParentsInfo;