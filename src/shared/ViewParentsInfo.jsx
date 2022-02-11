import { Avatar, Box, Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, makeStyles, Select, TextField, Typography } from "@material-ui/core";
import { SupervisedUserCircle } from "@material-ui/icons";
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
      padding: "10px",
      flexWrap: "wrap",
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    smallCards: {
      minWidth: 295,
      maxWidth: 350,
      height: "84vh",
      marginLeft: "10px",
      width: "fit-content",
      marginBottom: "10px",
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
  }));


const ViewParentsInfo = ({studentId}) => {

    const classes = useStyles();

    const [parents, setParents] = useState([]);
    const [edit, setEdit] = useState(false);

    useEffect(() => {
        getData();
    }, [studentId])

    const getData = async () => {
        const snapshot = await studentsRef.child(studentId).child('responsaveis').once("value");
        const parentsArray = snapshot.exists() ? snapshot.val() : [];
        console.log(parentsArray);
        setParents(parentsArray);
    }

    return (
        <Fragment>
            <div className={classes.container}>
                {Object.keys(parents).map((key, i) => {
                    const par = parents[key];
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
                                    <Avatar className={classes.orange} className={classes.avatar}>
                                        <SupervisedUserCircle />
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
                                <FormControl fullWidth size="small">
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
                                    control={<Checkbox id="financeiro" size="small" checked={par.pedagogico} name="financeiro" color="primary" />}
                                    label="Responsável Financeiro"
                                    labelPlacement="end"
                                    disabled={!edit}
                                    
                                />
                                </FormControl>
                            </Box>

                            <Box m={1}>
                                <Button variant="contained" fullWidth size="small" color="primary">Salvar</Button>
                            </Box>
                            
                            
                            
                        </CardContent>
                            
                    </Card>
                )})}
                
            </div>
            

        </Fragment>
    );
}
 
export default ViewParentsInfo;