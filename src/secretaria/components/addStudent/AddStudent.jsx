
import { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Backdrop, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, Paper, useMediaQuery } from '@material-ui/core';
import { enrollStudent } from '../../../shared/FunctionsUse';
import { AddressAndParentsFields, BasicDataFields, CourseDataFields } from '../../../shared/StudentFields';
import $ from 'jquery';
import { classesRef } from '../../../services/databaseRefs';
import ErrorDialog from '../../../shared/ErrorDialog';
import { useSnackbar } from 'notistack';
import { ArrowForward, Save } from '@material-ui/icons';


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  completed: {
    display: 'inline-block',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  extendedIcon: {
    marginLeft: theme.spacing(1),
  },
}));



export default function AddStudent() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [skipped, setSkipped] = useState(new Set());
  const [ loader, setLoader ] = useState(false);
  const steps = getSteps();
  const [ shrink, setShrink ] = useState();
  const [ optionalSteps, setOptionalSteps ] = useState([]);
  const [ parentsRequired, setParentsRequired ] = useState(undefined)
  
  const [errorMessage, setErrorMessage] = useState('Error')
  const [ courseTable, setCourseTable ] = useState({rows: [{ id: 1, col1: 'Hello', col2: 'World' }], columns: [{ field: 'col1', headerName: 'Column 1', width: 150 }, { field: 'col2', headerName: 'Column 2', width: 150 }]});
  const [ openFinalDialog, setOpenFinalDialog ] = useState(false);
  
  useEffect(() => {
    
  }, [])

  useEffect(() => {
    let index = activeStep;  
      let form_data = new FormData(document.getElementById('formAddStudent'));
      let item = JSON.parse(sessionStorage.getItem(index))
      for ( let key in item ) {
          form_data.append(key, item[key]);
          

          $('#' + key).val(item[key]);
          setShrink(true)
      }
      if (allStepsCompleted()) {
        handleAddStudent()
      }

      handleGetCourseData()

  }, [activeStep, completed])


  const handleOnCloseErrorDialog = () => {
    setErrorMessage(null);
  }

  const handleAddStudent = () => {
    console.log(sessionStorage.getItem('0'))
  }

  const fabStyle = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
};

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleGetCourseData = async () => {
    try {
      setErrorMessage(null)
      setLoader(true)
      const schoolClasses = (await (classesRef.once('value'))).val()
      let columns = [
        { field: 'col1', headerName: 'Turma', width: 150 }, 
        { field: 'col2', headerName: 'Horário', width: 125 },
        { field: 'col3', headerName: 'Professor(a)', width: 170 },
        { field: 'col4', headerName: 'E-mail Prof.', width: 170 },
      ]
      let rows = []
      let coursesData = []

      for (const classKey in schoolClasses) {
        if (Object.hasOwnProperty.call(schoolClasses, classKey)) {
          const classInfo = schoolClasses[classKey];
          let teacherObj
          let teacher
          let teacherEmail
          if (classInfo.hasOwnProperty('professor')) {
            teacherObj = classInfo.professor[0]
            teacherEmail = classInfo.professor[0].email
            teacher = classInfo.professor[0].nome
          } else {
            teacher = 'Não cadastrado'
          }
          rows.push({ id: classKey, col1: classKey, col2: classInfo.hora + 'h', col3: teacher, col4: teacherEmail})
          coursesData.push({turmaAluno: classKey, horaAluno: classInfo.hora + 'h', profAluno: teacherObj, courseId: classInfo.curso})
        }
      }
      sessionStorage.setItem('coursesData', JSON.stringify(coursesData))

      setCourseTable({rows: rows, columns: columns})
      setLoader(false)

    } catch (error) {
      console.log(error)
      setLoader(false)
      setErrorMessage(error.message)
    }
    

  }

  function getSteps() {
    return ['Dados básicos', 'Dados para o Curso', 'Endereço, Responsáveis e dados adicionais'];
  }

  const handleOptionalSteps = (step, remove=false) => {
    let optionalArray = optionalSteps;
    if (!remove) {
      optionalArray.push(step);
    } else {
      let index = optionalArray.indexOf(step)
      optionalArray.splice(index, 1);
    }
    setOptionalSteps(optionalArray)
  }

  function getStepContent(step) {
    
  switch (step) {
    case 0:
        
      return <BasicDataFields shrink={shrink} handleOptionalSteps={handleOptionalSteps} activeStep={activeStep} setParentsRequired={setParentsRequired} setLoader={setLoader} />;
    case 1:
      return <CourseDataFields shrink={shrink} rows={courseTable.rows} columns={courseTable.columns} rowHeight={25} setLoader={setLoader} activeStep={activeStep} />;
    case 2:
      return <AddressAndParentsFields shrink={shrink} parentsRequired={parentsRequired}/>;
    default:
      return 'Unknown step';
  }
  
  
}

  const totalSteps = () => {
    return getSteps().length;
  };

  const isStepOptional = (step) => {
    if (optionalSteps.indexOf(step) === -1) {
      return false;
    } else {
      return true;
    }
    
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const skippedSteps = () => {
    return skipped.size;
  };

  const completedSteps = () => {
    return completed.size;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps() - skippedSteps();
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const handleNext = () => {
      const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed
          // find the first step that has been completed
          steps.findIndex((step, i) => !completed.has(i))
        : activeStep + 1;
      if (!isLastStep()) {
        setActiveStep(newActiveStep);
      }
    

    
  };

   

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep);
    
  };

  const handleStep = (step) => () => {
    setActiveStep(step);

  };

  const handleComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);
    setCompleted(newCompleted);
    console.log(completed)


    /**
     * Sigh... it would be much nicer to replace the following if conditional with
     * `if (!this.allStepsComplete())` however state is not set when we do this,
     * thus we have to resort to not being very DRY.
     */
    // if (completed.size !== totalSteps() - skippedSteps()) {
    //   handleNext();
    // }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted(new Set());
    setSkipped(new Set());
    let steps = getSteps()

    for (let index = 0; index < steps.length; index++) {
        sessionStorage.removeItem(index)  
    }
    sessionStorage.removeItem('planoOriginal')
    sessionStorage.removeItem('codContrato')
    sessionStorage.removeItem('contratoConfigurado')
  };
  

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  function isStepComplete(step) {
    return completed.has(step);
  }

  const handleSubmit = (e) => {
    e.preventDefault()
      console.log(e)
      try {
        
        let formData = new FormData(document.getElementById('formAddStudent'))

        let data = Object.fromEntries(formData.entries());
        console.log(data)
        
        switch (activeStep) {
          case 0:
              sessionStorage.setItem(activeStep, JSON.stringify(data))
          break;
          case 1:
          
              let configuredContract = JSON.parse(sessionStorage.getItem('contratoConfigurado'));
              let originalPlan = JSON.parse(sessionStorage.getItem('planoOriginal'));
              let classStoredData = JSON.parse(sessionStorage.getItem(activeStep));
              try {
                let test = classStoredData.dadosTurma

              } catch {
                throw Error('Turma não escolhida.')
              }
              let contractCode = sessionStorage.getItem('codContrato');
              if (!contractCode) {
                throw Error('Contrato não configurado.')
              }
              
              let stepStore = {dadosTurma: classStoredData.dadosTurma, dadosContrato: {codContrato: contractCode, planoOriginal: originalPlan, contratoConfigurado: configuredContract}}
              sessionStorage.setItem(activeStep, JSON.stringify(stepStore));
          break;
          case 2:
              data.responsaveis = JSON.parse(sessionStorage.getItem('responsaveis')) || null;
              console.log(parentsRequired, data.responsaveis)
              if (parentsRequired && (data.responsaveis === null || data.responsaveis.length < 1)) {
                throw new Error('O aluno é menor de idade. É necessário cadastrar pelo menos um responsável.')
              }
              sessionStorage.setItem(activeStep, JSON.stringify(data))
          break;
        
          default:
            break;
        }

        handleComplete();

        if (isLastStep()) {
          setOpenFinalDialog(true);
        }

        
        handleNext();
        
      } catch (error) {
        console.log(error)
        enqueueSnackbar(error.message, {variant: 'error'})
      }
      

  }

  const handleSendData = () => {
    setOpenFinalDialog(false);
    setLoader(true);
    let storedData = {}
    for (let i = 0; i < totalSteps(); i++) {
      storedData[i] = (JSON.parse(sessionStorage.getItem(i)))
    }
    console.log(storedData)
    enrollStudent(storedData[0], 
      storedData[1] === null ? '' : storedData[1].dadosTurma, 
      storedData[1] === null ? '' : storedData[1].dadosContrato, 
      storedData[2])
        .then((message) => {
          setOpenFinalDialog(false);
          enqueueSnackbar(message.answer, {variant: 'success', });
          for (let index = 0; index < steps.length; index++) {
            sessionStorage.removeItem(index)  
          }
          sessionStorage.removeItem('planoOriginal')
          sessionStorage.removeItem('codContrato')
          sessionStorage.removeItem('contratoConfigurado')
          sessionStorage.removeItem('responsaveis')
          setLoader(false);
          handleReset()
      }).catch(error => {
        enqueueSnackbar(error.message, {variant: 'error'})
        setLoader(false);
      })
  }


  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
  
      <Dialog
      fullScreen={fullScreen}
      open={openFinalDialog}
      onClose={() => setOpenFinalDialog(false)}
      aria-labelledby="responsive-dialog-title"
      ba
    >
      <DialogTitle id="responsive-dialog-title">{"Você confirma o cadastro do aluno?"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Todos os dados digitados serão enviados aos servidores, e você será identificado como usuário que realizou este cadastro para consultas futuras.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => setOpenFinalDialog(false)} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSendData} color="primary" autoFocus>
          Cadastrar aluno
        </Button>
      </DialogActions>
    </Dialog>
    
    {errorMessage && <ErrorDialog title="Erro" message={errorMessage} isOpen={true} onClose={handleOnCloseErrorDialog}/>}
    <div style={{position: 'absolute'}}>
      <Backdrop className={classes.backdrop} open={loader}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
    <div className={classes.root}>
      <Stepper alternativeLabel activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const buttonProps = {};
          if (isStepOptional(index)) {
            buttonProps.optional = <Typography variant="caption">Opcional</Typography>;
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepButton
                onClick={handleStep(index)}
                completed={isStepComplete(index)}
                {...buttonProps}
              >
                {label}
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
      <div>
        <form onSubmit={handleSubmit} id="formAddStudent" autoComplete="off">
          <div>
              
                <Typography className={classes.instructions}>
                  <Paper style={{padding: '10px', minWidth: '250px'}} elevation={2}>
                    {getStepContent(activeStep)}
                  </Paper>
                </Typography>
                
              
            
                <div>
                {allStepsCompleted() && <Button onClick={handleReset}>Resetar</Button>}
                
                <Fab type="submit" style={fabStyle} variant="extended" color='primary'>
                  
                  {completedSteps() === totalSteps() - 1 ? 'Cadastrar Aluno' : 'Próximo'}
                  <ArrowForward className={classes.extendedIcon} />
                </Fab>
          

                {/* <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    className={classes.button}
                >
                    {completedSteps() === totalSteps() - 1 ? 'Cadastrar Aluno' : 'Próximo'}
                </Button> */}
                {isStepOptional(activeStep) && !completed.has(activeStep) && (
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSkip}
                    className={classes.button}
                    >
                    Pular
                    </Button>
                )}

                {activeStep !== steps.length &&
                    (completed.has(activeStep) && (
                    <Typography variant="caption" className={classes.completed}>
                        Passo {activeStep + 1} salvo
                    </Typography>
                    ))}
                </div>
            
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
