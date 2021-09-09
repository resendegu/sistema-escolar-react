
import { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Backdrop, CircularProgress } from '@material-ui/core';
import DateTimePicker from '../../shared/DateTimePicker';
import { calculateAge, checkCpf } from '../../shared/FunctionsUse';
import { BasicDataFields, ContractConfigure, CourseDataFields, DocumentsSend } from '../../shared/StudentFields';
import * as $ from 'jquery';
import { database } from '../../services/firebase';
import { classesRef } from '../../services/databaseRefs';
import ErrorDialog from '../../shared/ErrorDialog';
import FullScreenDialog from '../../shared/FullscreenDialog';
import { useSnackbar } from 'notistack';

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
}));



export default function AddStudent() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [skipped, setSkipped] = useState(new Set());
  const [ loader, setLoader ] = useState(false);
  const steps = getSteps();
  const [ shrink, setShrink ] = useState();
  
  const [errorMessage, setErrorMessage] = useState('Error')
  const [ courseTable, setCourseTable ] = useState({rows: [{ id: 1, col1: 'Hello', col2: 'World' }], columns: [{ field: 'col1', headerName: 'Column 1', width: 150 }, { field: 'col2', headerName: 'Column 2', width: 150 }]});
  
  

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

  

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleGetCourseData = async () => {
    try {
      setErrorMessage(null)
      setLoader(true)
      const schoolClasses = (await (classesRef.once('value'))).val()
      let columns = [
        { field: 'col1', headerName: 'Turma', width: 150 }, 
        { field: 'col2', headerName: 'Horário', width: 125 },
        { field: 'col3', headerName: 'Professor', width: 170 },
      ]
      let rows = []
      let coursesData = []

      for (const classKey in schoolClasses) {
        if (Object.hasOwnProperty.call(schoolClasses, classKey)) {
          const classInfo = schoolClasses[classKey];
          rows.push({ id: classKey, col1: classKey, col2: classInfo.hora + 'h', col3: classInfo.professor[0].nome})
          coursesData.push({turmaAluno: classKey, horaAluno: classInfo.hora + 'h', profAluno: classInfo.professor[0], courseId: classInfo.curso})
        }
      }
      sessionStorage.setItem('coursesData', JSON.stringify(coursesData))

      setCourseTable({rows: rows, columns: columns})
      setLoader(false)

    } catch (error) {
      setLoader(false)
      setErrorMessage(error.message)
    }
    

  }

  function getSteps() {
    return ['Dados básicos', 'Dados para o Curso', 'Endereço e Responsáveis'];
  }

  function getStepContent(step) {
    
  switch (step) {
    case 0:
        
      return <BasicDataFields shrink={shrink}  />;
    case 1:
      return <CourseDataFields shrink={shrink} rows={courseTable.rows} columns={courseTable.columns} rowHeight={25} setLoader={setLoader} activeStep={activeStep} />;
    case 2:
      return 'Step 3: This is the bit I really care about!';
    default:
      return 'Unknown step';
  }
  
  
}

  const totalSteps = () => {
    return getSteps().length;
  };

  const isStepOptional = (step) => {
    return false;
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

    setActiveStep(newActiveStep);

    
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
      let formData = new FormData(document.getElementById('formAddStudent'))

      let data = Object.fromEntries(formData.entries());
      console.log(data)
      sessionStorage.setItem(activeStep, JSON.stringify(data))

      handleComplete()

  }

  

  return (
    <>
    
    {errorMessage && <ErrorDialog title="Erro" message={errorMessage} isOpen={true} onClose={handleOnCloseErrorDialog}/>}
    <div style={{position: 'absolute'}}>
      <Backdrop className={classes.backdrop} open={loader}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
    <div className={classes.root}>
      
        <h2>Cadastro de Alunos</h2>
      <Stepper alternativeLabel nonLinear activeStep={activeStep}>
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
        <form onSubmit={handleSubmit} id="formAddStudent">
        {allStepsCompleted() ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed - you&apos;re finished
            </Typography>
            <Button onClick={handleReset}>Resetar</Button>
          </div>
        ) : (
          <div>
              
                <Typography className={classes.instructions}>{getStepContent(activeStep)}</Typography>
                
              
            
                <div>
                
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                >
                    Próximo
                </Button>
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
                    (completed.has(activeStep) ? (
                    <Typography variant="caption" className={classes.completed}>
                        Passo {activeStep + 1} salvo
                    </Typography>
                    ) : (
                    <Button variant="contained" color="primary" type="submit">
                        {completedSteps() === totalSteps() - 1 ? 'Cadastrar Aluno' : 'Salvar'}
                    </Button>
                    ))}
                </div>
            
          </div>
         
        )}
        </form>
      </div>
    </div>
    </>
  );
}
