
import { useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Backdrop, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, useMediaQuery, Container, Fab } from '@material-ui/core';

import $ from 'jquery';

import { useSnackbar } from 'notistack';
import { classesRef } from '../../services/databaseRefs';
import { AddressAndParentsFields, BasicDataFields } from '../../shared/StudentFields';
import { enrollStudent } from '../../shared/FunctionsUse';
import ErrorDialog from '../../shared/ErrorDialog';
import ExternalFilesUpload from './ExternalFilesUpload';
import { ArrowForward } from '@material-ui/icons';


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



export default function ExternalEnroll() {
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
  const [ canSend, setCanSend ] = useState(false);
  
  

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

  }, [activeStep, completed])


  const handleOnCloseErrorDialog = () => {
    setErrorMessage(null);
  }

  const handleAddStudent = () => {
    console.log(sessionStorage.getItem('0'))
  }

  

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  function getSteps() {
    return ['Dados básicos', 'Endereço, Responsáveis e dados adicionais', 'Envio de arquivos'];
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
        
      return <BasicDataFields shrink={shrink} handleOptionalSteps={handleOptionalSteps} activeStep={activeStep} setParentsRequired={setParentsRequired} setLoader={setLoader} external={true} />;
      
    case 1:
      return <AddressAndParentsFields shrink={shrink} parentsRequired={parentsRequired}/>;

    case 2: 
        return <ExternalFilesUpload hasFile={setCanSend} />
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
                data.tipoMatricula = 'preMatricula'
              sessionStorage.setItem(activeStep, JSON.stringify(data))
          break;

          case 1:
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
    storedData[1].studentFilesKey = storedData[2] 
    console.log(storedData)
    enrollStudent(storedData[0], 
      "", 
      "", 
      storedData[1])
        .then((message) => {
          setOpenFinalDialog(false);
          enqueueSnackbar(message.answer, {variant: 'success', });
          for (let index = 0; index < steps.length; index++) {
            sessionStorage.removeItem(index)  
          }
          sessionStorage.removeItem('responsaveis')
          sessionStorage.removeItem('studentKey')
          setLoader(false);
          handleReset()
      }).catch(error => {
        enqueueSnackbar(error.message, {variant: 'error'})
        setLoader(false);
      })
  }
  const fabStyle = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
};

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
      <DialogTitle id="responsive-dialog-title">{"Confirmação"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Você deseja enviar sua pré-matricula?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => setOpenFinalDialog(false)} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSendData} color="primary" autoFocus>
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* {errorMessage && <ErrorDialog title="Erro" message={errorMessage} isOpen={true} onClose={handleOnCloseErrorDialog}/>} */}
    <div style={{position: 'absolute'}}>
      <Backdrop className={classes.backdrop} open={loader}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
    <Container>
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
                  
                      {completedSteps() === totalSteps() - 1 ? 'Enviar pré-matrícula' : 'Próximo'}
                      <ArrowForward className={classes.extendedIcon} />
                    </Fab>
                    {/* <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        className={classes.button}
                    >
                        {completedSteps() === totalSteps() - 1 ? 'Enviar pré-matrícula' : 'Próximo'}
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
    </Container>
    
    </>
  );
}
