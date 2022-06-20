import { Avatar, Badge, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, InputAdornment, makeStyles, TextField, Tooltip, useMediaQuery, useTheme } from "@material-ui/core";
import { Add, Close, Delete, Done, FormatListNumberedRtl, Help, AccountCircle, QuestionAnswer, Refresh, AssignmentTurnedIn } from "@material-ui/icons";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { classesRef, performanceGradesRef, studentsRef } from "../services/databaseRefs";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
    table: {
        minWidth: 650,
    },
    flex: {
        display: "flex",
        flexDirection: "row",
        flex: 1,
        '& > div': {
            width: '25ch',
            margin: theme.spacing(1),
            
        },
    },
    root: {
        '& > *': {
          margin: theme.spacing(1),
        },
      },
  }));

  

const ReleaseGrades = ({open, onClose, classCode, studentsIds, refresh}) => {
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const [grades, setGrades] = useState([{key: '', value: 0, readonly: false}])
    const [studentGrades, setStudentGrades] = useState([{key: '', value: 0, readonly: false}])
    const [sum, setSum] = useState(0);
    const [performanceGradesSum, setPerformanceGradesSum] = useState(0);
    const [studentsAvatars, setStudentAvatars] = useState([]);

    const form = useRef();

    useEffect(() => {getData()}, [classCode, studentsIds]);

    function createData(name, calories, fat, carbs, protein) {
        return { name, calories, fat, carbs, protein };
      }

      const rows = [
        createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
        createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
        createData('Eclair', 262, 16.0, 24, 6.0),
        createData('Cupcake', 305, 3.7, 67, 4.3),
        createData('Gingerbread', 356, 16.0, 49, 3.9),
      ];

    const getData = async () => {
        // Getting class setted grade
        let performanceGrades = (await performanceGradesRef.once('value')).val();
        let localPerformanceSum = 0;
        for (const key in performanceGrades) {
            if (Object.hasOwnProperty.call(performanceGrades, key)) {
                const value = performanceGrades[key];
                localPerformanceSum += parseFloat(value)
            }
        }
        setPerformanceGradesSum(localPerformanceSum);
        let classGrades = (await classesRef.child(classCode).child('notas').once('value')).val();
        let gradesArray = [];
        for (const key in classGrades) {
            if (Object.hasOwnProperty.call(classGrades, key)) {
                const value = classGrades[key];
                gradesArray.push({key: key, value: value, readonly: key === "Desempenho"});
            }
        }
        console.log(gradesArray)
        setGrades([...gradesArray]);

        // Getting students grade
        let studentGradesArray = [];
        let studentsAvatarsArray = [];
        setStudentGrades(studentGradesArray)
        for (const i in studentsIds) {
            const id = studentsIds[i]
            const studentResults = (await classesRef.child(classCode).child('alunos').child(id).child('notas').once('value')).val();
            const studentInfo = (await studentsRef.child(id).once('value')).val();
            let total = 0
            for (const key in studentResults) {
                if (Object.hasOwnProperty.call(studentResults, key)) {
                    const value = studentResults[key];
                    total += Number(value)
                }
            }
            studentsAvatarsArray.push({performance: studentResults ? studentResults.Desempenho : 0, studentName: studentInfo.nomeAluno, id: id, avatar: studentInfo.fotoAluno, total: total})
            setStudentAvatars([...studentsAvatarsArray])
            if (studentsIds.length === 1) {
                
                for (const key in studentResults) {
                    if (Object.hasOwnProperty.call(studentResults, key)) {
                        const value = studentResults[key];
                        studentGradesArray.push({key: key, value: value, readonly: key === "Desempenho",});
                    }
                }
                setStudentGrades([...studentGradesArray])
                console.log(studentGradesArray)
                if (studentGradesArray.length !== gradesArray.length) {
                    let tempGrade = []
                    for (const i in gradesArray) {
                        let key = gradesArray[i].key
                        if (Object.hasOwnProperty.call(gradesArray, i)) {
                            tempGrade.push({key: key, value: key === "Desempenho" ? (studentResults && studentResults.hasOwnProperty('Desempenho') ? studentResults.Desempenho : 0) : 0, readonly: key === "Desempenho",})
                            
                        }
                    }
                    console.log(tempGrade)
                    setStudentGrades([...tempGrade])
                }
            } else {
                let tempGrade = []
                console.log(gradesArray)
                for (const i in gradesArray) {
                    let key = gradesArray[i].key
                    if (Object.hasOwnProperty.call(gradesArray, i)) {
                        tempGrade.push({key: key, value: 0, readonly: key === "Desempenho",})
                        
                    }
                }
                console.log(tempGrade)
                setStudentGrades([...tempGrade])
            }

        }
        console.log(studentGradesArray)
        
    }

    const handleSum = (localStudentGrades) => {
        let localSum = 0;
        localStudentGrades.map((grade, i) => {
            if (localStudentGrades.hasOwnProperty(i) && Number(localStudentGrades[i].value) > Number(grades[i].value)) {
                console.log(localStudentGrades, grades)
                localStudentGrades[i].value = grades[i].value
                setStudentGrades([...localStudentGrades])
            }
            localSum += parseFloat(grade.value)
        })

        setSum(localSum)
        console.log(studentsAvatars)
        
        
    }

    const handleAddGrade = (key='', value=0, readonly=false) => {
        let gradesCopy = grades;
        gradesCopy.push({key: key, value: value, readonly: readonly});
        setGrades([...gradesCopy]);

    }

    const handleSaveData = async (e) => {
        e.preventDefault();
        if (sum <= 100)
            try {
                form.current.requestSubmit() 
                console.log(studentGrades)
                let localGrades = {};
                studentGrades.map((grade, i) => {
                    
                    localGrades[grade.key] = Number(grade.value);
                    
                })
                console.log(localGrades)
                for (const i in studentsIds) {
                    if (Object.hasOwnProperty.call(studentsIds, i)) {
                        const id = studentsIds[i];
                        await classesRef.child(classCode).child('alunos').child(id).child('notas').set(localGrades);
                    }
                }
                
                enqueueSnackbar("Notas lançadas com sucesso.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                refresh();
                onClose(false);
                
            } catch (error) {
                console.log(error);
                refresh();
                enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            }
        else 
            enqueueSnackbar('O somatório das notas não pode ser maior que 100.', {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })

    }

    const handleClose = () => {
        onClose(false);
    }

    const handleDeleteGrade = (i) => {
        let localGrades = grades;
        localGrades.splice(i, 1);
        setGrades([...localGrades])
            
    }

    const handleChangePerformanceGrade = (e) => {
        console.log(e.target.checked)
        if (e.target.checked){
            handleAddGrade('Desempenho', performanceGradesSum, true)
        } else {
            //handleDeleteGrade()
            let localGrades = grades;
            const newGrades = localGrades.filter(grade => grade.readonly !== true);
            setGrades([...newGrades]);
        }
            
    }

    const Fields = ({localGrades, localStudentGrades}) => {
       
        useEffect(() => {
            handleSum(localStudentGrades)
        }, [localGrades])

        const BuiltFields = localGrades.map((grade, i) => {
            
            return (
                <Fragment>
                    <div className={classes.flex}>
                        <TextField
                            variant="outlined"
                            
                            placeholder={"EX."}
                            color="primary"
                            label="Nome da nota"
                            defaultValue={grade.key}
                            disabled
                            
                            required
                        />
                        <TextField
                            variant="outlined"
                            onChange={(e) => {
                                console.log(localStudentGrades, localGrades, e.target.value)
                                
                                localStudentGrades[i].value = e.target.value === '' ? 0 : e.target.value
                                e.target.value = e.target.value === '' ? 0 : e.target.value
                                setStudentGrades(localStudentGrades)
                                
                            }}
                            onBlur={() => handleSum(localStudentGrades)}
                            type="number"
    
                            placeholder={"5"}
                            color="secondary"
                            label="Nota"
                            defaultValue={localStudentGrades.hasOwnProperty(i) && localStudentGrades[i].value}
                            id={grade.key}
                            InputProps={{
                                endAdornment: <InputAdornment position="start">/{grade.value}</InputAdornment>,
                                
                            }}
                            
                            disabled={grade.readonly}
                            required
                        />
                        {!grade.readonly &&(
                            <Tooltip title="Lançar total">
                                <IconButton aria-label="delete" onClick={() => {
                                    
                                    localStudentGrades[i].value = grade.value
                                    setStudentGrades([...localStudentGrades])
                                }}>
                                    <AssignmentTurnedIn />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>  
                    
                </Fragment>
            );
        })
        
        return BuiltFields;
    }

    return (
        <Fragment>
            <Dialog open={open} onClose={handleClose} fullScreen={fullScreen}>
                <DialogTitle> Lançamento de notas
                    <div className={classes.root}>
                        {studentsAvatars && studentsAvatars.map((student, i) => (
                            <Tooltip title={`${student.id}: ${student.studentName}`}>
                                <Badge badgeContent={studentsIds.length !== 1 ? (sum === 0 ? Number(student.total) : Number(sum) + Number(student.performance === undefined ? 0 : student.performance)) : (sum)} max={999} color="primary">
                                    {student.avatar ? (<img src={student.avatar} style={{width: "40px", height: "40px", borderRadius: '50%',}} alt=""/>) : <Avatar />}
                                    
                                </Badge>
                            </Tooltip>
                            
                        ))}
                    </div>    
                </DialogTitle>
                <DialogContent>
                    <div>
                        <div>
                            <FormControlLabel
                                control={
                                <Checkbox
                                    //checked={state.checkedB}
                                    //onChange={handleChange}
                                    disabled
                                    name="checkedB"
                                    color="primary"
                                    onChange={handleChangePerformanceGrade}
                                    defaultChecked={grades.length !== 0 && (grades.filter(grade => grade.readonly === true))[0]}
                                />
                                }
                                label="Incluir desempenho"
                            />
                            <Tooltip title={"Ao marcar esta caixa, o somatório das notas de desempenho (que são definidas pela secretaria) será adicionado automaticamente ao somatório da distribuição de notas desta turma."}>
                                <Help fontSize="small" />
                            </Tooltip>
                            
                            <Button endIcon={<Refresh />} style={{float: "right"}} onClick={getData}>Atualizar</Button>
                            
                            
                        </div>
                        
                    </div>
                    <div>
                        <form ref={form} onSubmit={handleSaveData}>
                            <Fields localGrades={grades} localStudentGrades={studentGrades}/>
                        </form>
                        

                        
                    </div>
                    <div className={classes.flex}>
                        {/* <div>
                            <IconButton aria-label="delete" onClick={() => handleAddGrade()}>
                                <Add />
                            </IconButton>
                            <label>Nova nota</label>
                        </div> */}
                        <div>
                            <IconButton aria-label="delete" disabled>
                                <FormatListNumberedRtl />
                            </IconButton>
                            <label>Somatório: <label style={{color: sum > 100 ? "#FF0000" : ""}}>{sum}</label>/100</label>
                        </div>

                    </div>
                    
                    
                </DialogContent>
                <DialogActions>
                
                    <Button onClick={() => form.current.requestSubmit()}>Salvar</Button>
                    <Button onClick={handleClose}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}
 
export default ReleaseGrades;