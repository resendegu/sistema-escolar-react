import { Button, FormControl, FormHelperText, Grid, makeStyles, TextField } from "@material-ui/core";
import { Fragment, useState } from "react";
import { DropzoneDialog } from 'material-ui-dropzone';
import { calculateAge, checkCpf } from "./FunctionsUse";
import CrudTable from "./DataGrid";

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    fields: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      
    },
  }));

function BasicDataFields(props) {
    const { shrink } = props;

    const classes = useStyles();

    const [ age, setAge ] = useState(null)
    const [ loading, setLoading ] = useState(false)

    const [ validCpf, setValidCpf ] = useState(false);

    const handleCalculateAge = async (date) => {
        console.log(date.target.valueAsDate)
        let birthdate = date.target.valueAsDate
        if (birthdate != null && !isNaN(birthdate.getDay()) ) {
            try {
                let ageObj = await calculateAge(birthdate);
                setAge(`Idade ${ageObj.years} anos, ${ageObj.months} meses e ${ageObj.days} dias`);
            } catch (error) {
                error.message === 'permission-denied' ? setAge(`Você não possui permissão.`) : setAge(error.message)
                document.getElementById('dataNascimentoAluno').value = ''
            }
            
        } 
        
        
    }

    const handleCheckCpf = (e) => {
        let cpf = e.target.value

        setValidCpf(!checkCpf(cpf))
    }

    return (
        <div className={classes.root}>
            
              <Grid 
              justifyContent="center"   
              container
              direction="row"
              spacing={2}
              >
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: shrink,}}  variant="filled" label="Nome Completo" type="text" id="nomeAluno" name="nomeAluno" aria-describedby="my-helper-text" />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField name="dataNascimentoAluno" style={{width: '219px',}} variant="filled" InputLabelProps={{shrink: true,}}  id="dataNascimentoAluno" required autoComplete="off" onBlur={handleCalculateAge} type="date" format="dd/MM/yyyy" label="Data de Nascimento"/>
                        <FormHelperText> {age} </FormHelperText>
                    </FormControl >
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: shrink,}} label="Telefone" type="text" id="telefoneAluno" name="telefoneAluno" aria-describedby="my-helper-text" />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: shrink,}} required label="Celular" type="text" id="celularAluno" name="celularAluno" aria-describedby="my-helper-text" />
                        <FormHelperText>DDD e o número (Ex.: 31999999999) </FormHelperText>
                    </FormControl>
                    
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label="E-mail" type="email" id="emailAluno" name="emailAluno" aria-describedby="my-helper-text" />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label="Senha do portal do Aluno" type="password" id="senhaAluno" name="senhaAluno" aria-describedby="my-helper-text" />
                        <FormHelperText>Mínimo 6 caracteres.</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label="CPF" error={validCpf} onChange={handleCheckCpf} onBlur={() => validCpf ? document.getElementById('cpfAluno').value = null : null} type="text" id="cpfAluno" name="cpfAluno" aria-describedby="my-helper-text" helperText={
                              validCpf &&
                              "Insira um CPF válido."
                            }
                            FormHelperTextProps={{ error: true }} />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label="RG" type="text" id="rgAluno" name="rgAluno" aria-describedby="my-helper-text"
                            FormHelperTextProps={{ error: true }} />
                    </FormControl>
                </Grid>
                
                
              </Grid>

        
          </div>
    );
}

function CourseDataFields(props) {
    const { shrink, rows, columns, rowHeight, onRowClick, courseChosen } = props;

    const classes = useStyles();

    const [ loading, setLoading ] = useState(false)

    return (
        <>
            {courseChosen.turmaAluno !== '' && <label>Turma escolhida: {courseChosen.turmaAluno}</label>}
            <CrudTable rows={rows} columns={columns} rowHeight={rowHeight} onRowClick={onRowClick} />
        </>
    );
}

function DocumentsSend(props) {

    const { onAdd } = props;

    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState([])

    const handleOpen = async () => {
        console.log(files)
        setOpen(true);
    }

    

    
    return (
        <>
            <Button variant="contained" color="primary" onClick={handleOpen}>
                Enviar documentos (opcional)
            </Button>
            <DropzoneDialog
                initialFiles = {files}
                fileObjects = {files}
                onChange={(files) => console.log('Files:', files)}
                maxFileSize={7000000}
                dropzoneText="Arraste e solte ou, clique para enviar um arquivo"
                filesLimit={10}
                previewText="Arquivos selecionados:"
                cancelButtonText={"Cancelar"}
                submitButtonText={"Salvar"}
                open={open}
                onClose={() => setOpen(false)}
                onSave={(filesNow) => {
                console.log('Files:', files);
                setFiles(filesNow)
                setOpen(false);
                }}
                showPreviews={true}
                showFileNamesInPreview={true}
            />
        </>
    );
}

export { BasicDataFields, DocumentsSend, CourseDataFields };