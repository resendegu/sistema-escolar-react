import { Avatar, Backdrop, Box, Card, CardContent, Chip, CircularProgress, Fab, FormControl, Grid, Input, InputLabel, makeStyles, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { Add, Assistant, CloudUpload, EqualizerTwoTone, Label, LibraryBooks } from "@material-ui/icons";
import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { useRef } from "react";
import { Fragment, useEffect, useState } from "react";
import { booksRef, coursesRef, daysCodesRef, teachersListRef } from "../../../services/databaseRefs";
import { LocaleText } from "../../../shared/DataGridLocaleText";
import { generateClassCode, handleSendClassData } from "../../../shared/FunctionsUse";

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
      justifyContent: "space-evenly",
      marginTop: '8px',
      flexWrap: "wrap",
    },
    fieldsContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingRight: "16px",
        flexWrap: "wrap",
      },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    smallCards: {
      minWidth: 350,
      maxWidth: "100vw",
      height: "65vh",
      marginLeft: "10px",
      width: "fit-content",
      marginBottom: "10px",
    },
    bigCards: {
        minWidth: 350,
        maxWidth: "100vw",
        height: "65vh",
        marginLeft: "10px",
        width: "55vw",
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
    textField: {
        minWidth: '99.8px',
    },
    formControl: {
        margin: 1,
        minWidth: 120,
        width: '100%',
        maxWidth: '100%',
      },
      chips: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      chip: {
        margin: 2,
      },
      noLabel: {
        marginTop: 3,
      },
      extendedIcon: {
        marginRight: 5,
      },
      backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
      },
  }));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};


const AddClass = ({dataForEditing, onClose}) => {

    console.log(dataForEditing)
    const tableRef = useRef();

    function CustomToolbar() {
        return (
          <GridToolbarContainer>
              <label>Escolha os livros *</label>
            {/* <GridToolbarExport csvOptions={{fileName: 'Tabela de livros cadastrados'}} /> */}
          </GridToolbarContainer>
        );
      }

    const classes = useStyles();

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [ loader, setLoader ] = useState(false); // Loader state for the class submit
    const [ loading, setLoading ] = useState(false); // Loading state for the data grid of the books
    const [ rows, setRows ] = useState([])
    const [classData, setClassData] = useState({
        codigoSala: "",
        curso: "",
        diasDaSemana: [],
        hora: "",
        horarioTerminoTurma: "",
        livros: [],
        modalidade: "",
        professor: '',
    })

    

    const [courses, setCourses] = useState([])
    const [teachers, setTeachers] = useState([])

    const [ days, setDays ] = useState([])

    const fabStyle = {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    };

    useEffect(() => {
        getCourses()
        getTeachers()
        getDays()
        async function getBooks() {
            setLoading(true)
            let snapshot = await booksRef.once('value');
            setLoading(false)
            let books = snapshot.exists() ? snapshot.val() : []
            console.log(books)

            console.log(tableRef)
            setRows(books)
        }
        getBooks()
    }, [])


    const getDays = async () => {
        const allDays = (await daysCodesRef.once('value')).val()

        setDays(allDays)
        if (dataForEditing) {
            setClassData(dataForEditing)

        }
    }

    const getCourses = async () => {
        const allCourses = (await coursesRef.once('value')).val();
        console.log(allCourses)
        setCourses(allCourses);
    }

    const getTeachers = async () => {
        const allTeachers = (await teachersListRef.once('value')).val();
        let teachersArray = []
        for (const uid in allTeachers) {
            if (Object.hasOwnProperty.call(allTeachers, uid)) {
                const teacher = allTeachers[uid];
                teachersArray.push(teacher)
            }
        }
        allTeachers ? setTeachers([...teachersArray]) : setTeachers()
    }

    const handleFormChange = async (e) => {
        console.log(e)
        const value = e.target.value
        console.log(value)
        const id = e.target.id
        let data = {...classData}
        data[id] = value
        
        if (id !== 'codigoSala') {
            const classCode = await generateClassCode(data)
            data['codigoSala'] = classCode
        }
        
        setClassData(data)
        console.log(data)
    }

    const handleDayPicker = async (e) => {
        console.log(e)
        const value = e.target.value
        console.log(value)
        let data = {...classData}
        data['diasDaSemana'] = value
        // const index = data['diasDaSemana'].indexOf(value)
        // index === -1 ? data['diasDaSemana'].push(value) : data['diasDaSemana'].splice(index, 1)
        const classCode = await generateClassCode(data)
        data['codigoSala'] = classCode
        setClassData(data)
        console.log(data)
    }

    const handleRowSelection = async (selectedRows) => {
        console.log(selectedRows)
        let data = {...classData}
        data['livros'] = selectedRows
        const classCode = await generateClassCode(data)
        data['codigoSala'] = classCode
        setClassData(data)
        console.log(data)
    }

    const handleSubmit = async () => {
        setLoader(true)
        try {
            console.log(classData)
            let message = await handleSendClassData(classData);
            setLoader(false)
            enqueueSnackbar(message.answer, {variant: 'success'})
            if (dataForEditing)
                onClose();
        } catch (error) {
            setLoader(false)
            enqueueSnackbar(error.message, {variant: 'error'})
        }
        

    }

    

    return (
        <Fragment>
            <div style={{position: 'absolute'}}>
                <Backdrop className={classes.backdrop} open={loader}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </div>
            <div className={classes.container}>
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
                                    <Assistant />
                                </Avatar>
                            </Grid>

                            <Grid item>
                                <Typography variant="h5" component="h2">
                                Dados da turma
                                </Typography>
                                
                                
                            </Grid>
                        </Grid>
                        <hr />
                        <form id="formClassData" onChange={handleFormChange} autoComplete="off">
                            <Box m={1} className={classes.fieldsContainer}>
                                <TextField id="codigoSala" label="Código da turma" variant="filled" value={classData.codigoSala} className={classes.textField} required />
                                <TextField
                                    id="hora"
                                    type="time"
                                    label="Hr. Início"
                                    value={classData.hora}
                                    className={classes.textField}
                                    helperText=""
                                    variant="filled"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    
                                    required
                                >
                                </TextField>
                                <TextField
                                    id="horarioTerminoTurma"
                                    type="time"
                                    label="Hr. Término"
                                    value={classData.horarioTerminoTurma}
                                    className={classes.textField}
                                    helperText=""
                                    variant="filled"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    
                                    required
                                >
                            
                                </TextField>
                                
                            
                            </Box>
                            
                            <Box m={1}>
                                {courses ? <TextField
                                    id="curso"
                                    select
                                    label="Curso"
                                    value={classData.curso}
                                    fullWidth
                                    
                                    helperText="Escolha o curso desta turma"
                                    variant="filled"
                                    SelectProps={{
                                        native: true,
                                    }}
                                    required
                                >
                                    <option hidden selected>
                                        Escolha um curso...
                                    </option>
                                    {courses.length > 0 && courses.map((option) => (
                                        <option key={option.codSistema} value={option.codSistema}>
                                        {option.codCurso + ' - ' + option.nomeCurso}
                                        </option>
                                    ))}
                                </TextField> : <label style={{color: 'red'}}>Nenhum curso cadastrado no sistema</label>}
                            </Box>
                            <Box m={1}>
                                {teachers ? <TextField
                                    id="professor"
                                    select
                                    label="Professor(a) Referência"
                                    value={classData.professor}
                                    fullWidth
                                    helperText="Escolha um professor para esta turma"
                                    variant="filled"
                                    SelectProps={{
                                        native: true,
                                    }}
                                    required
                                >
                                    <option hidden selected>
                                        Escolha um(a) professor(a)...
                                    </option>
                                    {teachers.length > 0 && teachers.map((teacher, i) => (
                                        <option key={i} value={teacher.email}>
                                        {`${teacher.nome} (${teacher.email})`}
                                        </option>
                                    ))}
                                </TextField> : <label style={{color: 'red'}}>Nenhum professor cadastrado no sistema</label>}
                            </Box>
                            <Box m={1}>
                                <TextField
                                    id="modalidade"
                                    select
                                    label="Modalidade"
                                    value={classData.modalidade}
                                    fullWidth
                                    helperText="Escolha a modaldiade desta turma"
                                    variant="filled"
                                    SelectProps={{
                                        native: true,
                                    }}
                                    required
                                >
                                    <option hidden selected>
                                        Escolha uma modalidade...
                                    </option>
                                    <option value="presencial">
                                        Presencial
                                    </option>
                                    <option value="ead">
                                        Ensino à Distância (EaD)
                                    </option>
                                </TextField>
                            </Box>
                        </form>
                        
                        
                    </CardContent>
                        
                </Card>
                <Card className={classes.bigCards} variant="outlined">
                    <CardContent>
                        <Grid 
                            justifyContent="flex-start"
                            direction="row"
                            container
                            spacing={1}
                        >
                            <Grid item>
                                <Avatar className={classes.avatar}>
                                    <LibraryBooks />
                                </Avatar>
                            </Grid>

                            <Grid item>
                                <Typography variant="h5" component="h2">
                                Dias da semana e Materiais
                                </Typography>
                                
                                
                            </Grid>
                        </Grid>
                        <hr />
                        <Box m={1}>
                        {days ? <FormControl className={classes.formControl}>
                            <InputLabel id="demo-mutiple-chip-label">Dias da semana</InputLabel>
                            <Select
                            labelId="demo-mutiple-chip-label"
                            id="diasDaSemana"
                            multiple
                            fullWidth
                            value={classData.diasDaSemana}
                            variant="filled"
                            onChange={handleDayPicker}
                            input={<Input id="diasDaSemana" />}
                            renderValue={(selected) => (
                                <div className={classes.chips}>
                                {selected.map((value) => (
                                    <Chip key={value} label={days[value]} className={classes.chip} />
                                ))}
                                </div>
                            )}
                            MenuProps={MenuProps}
                            >
                            {days.map((name, i) => (
                                <MenuItem key={name} name="diasDaSemana" value={i}>
                                {name}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl> : <label style={{color: 'red'}}>Códigos de dias da semana não configurados no sistema</label>}
                        </Box>
                        <Box m={1}>
                        <div style={{ height: 250, width: '100%' }}>
                            <DataGrid
                             ref={tableRef} 
                                style={{width: '100%'}}
                                
                                rows={rows} 
                                columns={
                                    [
                                        {field: 'codSistema', headerName: 'ID', width: 92, editable: false},
                                        {field: 'codLivro', headerName: 'Código', width: 130, editable: false},
                                        {field: 'nomeLivro', headerName: 'Nome do Livro', width: 300, editable: false},
                                        {field: 'idLivro', headerName: 'Ident. do Livro', width: 300, editable: false},
                                    ]
                                } 
                                disableSelectionOnClick 
                                checkboxSelection
                                
                                components={{
                                    Toolbar: CustomToolbar

                                }}
                                
                                loading={loading}
                                localeText={LocaleText}
                                onSelectionModelChange={handleRowSelection}
                            />
                        </div>
                        </Box>
                        
                        
                        
                    </CardContent>
                        
                </Card>
            </div>
            <div>
                <Fab onClick={handleSubmit} disabled={!courses || !teachers || !rows || !days} style={fabStyle} variant="extended" color='primary'>
                <Add className={classes.extendedIcon} />
                    Cadastrar turma
                </Fab>
            </div>
        </Fragment>
    );
}
 
export default AddClass;