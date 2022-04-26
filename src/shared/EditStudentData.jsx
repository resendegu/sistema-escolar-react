import { Backdrop, Button, CircularProgress, Container, makeStyles, Paper } from "@material-ui/core";
import { useEffect, useRef, useState } from "react";
import { Fragment } from "react";
import { preEnrollmentsRef, studentsRef } from "../services/databaseRefs";
import FullScreenDialog from "./FullscreenDialog";
import $ from 'jquery';
import { AddressAndParentsFields, BasicDataFields } from "./StudentFields";
import { useSnackbar } from "notistack";
import { useConfirmation } from "../contexts/ConfirmContext";

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

const EditStudentData = ({studentId, isOpen, onClose, preEnrollment}) => {

    const classes = useStyles();

    const form = useRef();

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const confirm = useConfirmation();

    const [loader, setLoader] = useState(false);

    useEffect(() => {
        
        console.log(form)
        getData();
        
        
    })

    const getData = async () => {
        
        const data = preEnrollment ? (await preEnrollmentsRef.child(studentId).once("value")).val() : (await studentsRef.child(studentId).once("value")).val()
        function putData() {
            for (const field in data) {
                if (Object.hasOwnProperty.call(data, field)) {
                    const value = data[field];
                    try {
                        document.getElementById(field).value = value
                    } catch (error) {
                        console.log(error, field, value)
                    }
                }
            }
        }
        
        setTimeout(() => {
            putData();
        }, 1500);


    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoader(true)
        let fieldsData = $('#formStudent').serializeArray();
        let formData = new FormData(form.current);
        console.log(fieldsData)

        let studentObj = {};
        fieldsData.forEach(field => {
            let values = formData.getAll(field.name);
            studentObj[field.name] = values.length === 1 ?  values[0] : values;
            
        })
        console.log(studentObj)
        try {
            await confirm({
                variant: "danger",
                catchOnCancel: true,
                title: "Confirmação",
                description: "Você deseja editar os dados deste Aluno? Esta ação não pode ser revertida."
            });
            preEnrollment ? preEnrollmentsRef.child(studentId).update(studentObj) : await studentsRef.child(studentId).update(studentObj);
            enqueueSnackbar("Dados salvos com sucesso.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            setLoader(false)
            onClose()
        } catch (error) {
            console.log(error)
            if (error)
                enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
                setLoader(false)
        }
    }

    return (
        <Fragment>
            
            
            <FullScreenDialog
                isOpen={isOpen}
                onClose={onClose}
                
                onSave={() => {
                    
                    form.current.requestSubmit();
                }}
                title={"Editar dados"}
                saveButton={"Salvar"}
            >
                <Backdrop className={classes.backdrop} open={loader}>
                    <CircularProgress color="inherit" />
                </Backdrop>
                <Container>
                    <Paper style={{padding: '10px', minWidth: '250px', marginTop: '10px', marginBottom: "10px"}} elevation={2}>
                        <form ref={form} id={"formStudent"} onSubmit={handleSubmit}>
                            <BasicDataFields setLoader={setLoader} shrink editMode />
                            <AddressAndParentsFields shrink editMode />
                        </form>
                        
                    </Paper>
                </Container>
                
                
            </FullScreenDialog>
        </Fragment>
    );
}
 
export default EditStudentData;