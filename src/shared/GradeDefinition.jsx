import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, makeStyles, TextField, Tooltip, useMediaQuery, useTheme } from "@material-ui/core";
import { Add, Close, Delete, FormatListNumberedRtl, Help, QuestionAnswer, Refresh } from "@material-ui/icons";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { classesRef, performanceGradesRef } from "../services/databaseRefs";
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
    }
  }));

  

const GradeDefinition = ({open, onClose, classCode}) => {
    const classes = useStyles();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const [grades, setGrades] = useState([{key: '', value: 0, readonly: false}])
    const [sum, setSum] = useState(0);
    const [performanceGradesSum, setPerformanceGradesSum] = useState(0);

    const form = useRef();

    useEffect(() => {getData()}, [classCode]);

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
    }

    const handleSum = (localGrades) => {
        let localSum = 0;
        localGrades.map((grade, i) => {
            localSum += parseFloat(grade.value)
        })

        setSum(localSum)
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
                console.log(grades)
                let localGrades = {};
                grades.map((grade, i) => {
                    localGrades[grade.key] = grade.value;
                })
                console.log(localGrades)
                await classesRef.child(classCode).child('notas').set(localGrades);
                enqueueSnackbar("Notas distribuídas com sucesso.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                onClose(false);
                
            } catch (error) {
                console.log(error);
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

    const Fields = ({localGrades}) => {
       
        useEffect(() => {
            handleSum(localGrades)
        }, [localGrades])

        const BuiltFields = localGrades.map((grade, i) => {
            
            return (
                <Fragment>
                    <div className={classes.flex}>
                        <TextField
                            variant="outlined"
                            onChange={(e) => {
                                localGrades[i].key = e.target.value
                                setGrades(localGrades)
                            }}
                            placeholder={"EX."}
                            color="primary"
                            label="Nome da nota"
                            defaultValue={grade.key}
                            disabled={grade.readonly}
                            required
                        />
                        <TextField
                            variant="outlined"
                            onChange={(e) => {
                                localGrades[i].value = e.target.value
                                setGrades(localGrades)
                            }}
                            onBlur={() => handleSum(localGrades)}
                            type="number"
    
                            placeholder={"5"}
                            color="secondary"
                            label="Valor da nota (0 - 100)"
                            defaultValue={grade.value}
                            disabled={grade.readonly}
                            required
                        />
                        {!grade.readonly &&(
                        <IconButton aria-label="delete" onClick={() => handleDeleteGrade(i)}>
                            <Delete />
                        </IconButton>)}
                    </div>  
                    
                </Fragment>
            );
        })
        
        return BuiltFields;
    }

    return (
        <Fragment>
            <Dialog open={open} onClose={handleClose} fullScreen={fullScreen}>
                <DialogTitle> Distribuição de notas </DialogTitle>
                <DialogContent>
                    <div>
                        <div>
                            <FormControlLabel
                                control={
                                <Checkbox
                                    //checked={state.checkedB}
                                    //onChange={handleChange}
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
                            <Fields localGrades={grades}/>
                        </form>
                        

                        
                    </div>
                    <div className={classes.flex}>
                        <div>
                            <IconButton aria-label="delete" onClick={() => handleAddGrade()}>
                                <Add />
                            </IconButton>
                            <label>Nova nota</label>
                        </div>
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
 
export default GradeDefinition;