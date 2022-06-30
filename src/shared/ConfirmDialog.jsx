import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    InputLabel,
    Select,
    FormControl,
    makeStyles,
    MenuItem,
  } from "@material-ui/core";
import { useEffect } from "react";
import { useState } from "react";
import { studentsRef } from "../services/databaseRefs";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));
  
  export const ConfirmationDialog = ({
    open,
    title,
    variant,
    description,
    onSubmit,
    onClose,
    promptText=false,
    promptLabel='',
    promptStudent=false
  }) => {

    const classes = useStyles();

    const [ text, setText ] = useState('')
    const [ studentSelected, setStudentSelected ] = useState();
    const [students, setStudents] = useState([]);
    const [submit, setSubmit] = useState('...');

    useEffect(() => {
      studentsRef.once('value').then(snap => {
        let studentsObj = snap.val();
        let idsArray = []
        for (const id in studentsObj) {
          if (Object.hasOwnProperty.call(studentsObj, id)) {
            //const studentObj = studentsObj[id];
            idsArray.push(id);
          }
          setStudents([...idsArray])
        }
      }).catch(error => {
        throw new Error(error)
      })
    }, [])

    const handleChange = (event) => {
      setStudentSelected(event.target.value);
      setSubmit(event.target.value);
    };

    return (
      <Dialog open={open}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
          {promptText && <TextField onChange={(e) => setSubmit(e.target.value)} label={promptLabel} fullWidth variant="outlined" />}
          {promptStudent && (
            <div>
              <FormControl className={classes.formControl}>
                <InputLabel id="demo-simple-select-label">Alunos</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={studentSelected}
                  onChange={handleChange}
                >
                  {students.map((id, i) => (
                    <MenuItem value={id}>{id}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => onSubmit(submit)}>
            Sim
          </Button>
          <Button color="primary" onClick={onClose} autoFocus>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  