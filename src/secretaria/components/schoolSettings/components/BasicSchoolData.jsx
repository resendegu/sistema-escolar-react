import { Button, Checkbox, CircularProgress, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, Input, InputAdornment, InputLabel, LinearProgress, makeStyles, Select, Switch, TextField } from "@material-ui/core";
import { Fragment, useEffect, useState } from "react";

import $ from 'jquery'
import 'jquery-mask-plugin/dist/jquery.mask.min'; 
import { basicDataRef } from "../../../../services/databaseRefs";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      width: '100%',
    },
    fields: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      
    },
    button: {
        alignSelf: 'center',
        
      },
      selectEmpty: {
        marginTop: theme.spacing(2),
      },
    formControl: {
        padding: theme.spacing(2),
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
      },
      secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
      },
}));

const BasicSchoolData = () => {
    const classes = useStyles();

    const [ shrink, setShrink ] = useState(undefined);
    const [ checked, setChecked ] = useState(false);
    const [ loading, setloading ] = useState(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();


    useEffect(() => {
        async function getData() {
            let data = (await basicDataRef.once('value')).val()
            console.log(data)
            setChecked(true)
            for (const id in data) {
                if (Object.hasOwnProperty.call(data, id)) {
                    const value = data[id];
                    console.log('id:', id)
                    console.log('value:', value)
                    try {
                        if (id === "permitirDistribuiNotas") {
                            setChecked(value)
                        } else {
                            document.getElementById(id).value = value;
                        } 
                        
                        
                    } catch (error) {
                        console.log(error);
                        
                    }
                    
                }
            }
            setShrink(true)
        }

        getData()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setloading(true);
        let data = $('#infoEscolaForm').serializeArray();
        let formData = new FormData(document.getElementById('infoEscolaForm'));
        console.log(data);
        let basicDataObj = {};

        for (const i in data) {
            if (Object.hasOwnProperty.call(data, i)) {
                const field = data[i];
                basicDataObj[field.name] = field.value;
                if (field.name === "permitirDistribuiNotas") {
                    basicDataObj[field.name] = true;
                }
            }
        }
        basicDataObj['permitirDistribuiNotas'] = basicDataObj['permitirDistribuiNotas'] ? true : false
        console.log(basicDataObj)
        try {
            await basicDataRef.update(basicDataObj)
            setloading(false)
            enqueueSnackbar('Dados atualizados com sucesso', {variant: 'success'})
        } catch (error) {
            console.log(error)
            setloading(false)
            enqueueSnackbar(error.message, {variant: 'error'})
            throw new Error(error.message)
        }
        
    }

    return (
        <Fragment>
            
            
            <form id="infoEscolaForm" onSubmit={handleSubmit}>
            <Grid
                justifyContent="flex-start"   
                container
                direction="row"
                spacing={1}
                
            >

                <Grid item>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <TextField placeholder={"CNPJ da Escola"} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={"CNPJ da Escola"} type="text" id={"cnpjEscola"} name={"cnpjEscola"} aria-describedby={"CNPJ da Escola"} onKeyPress={(e) => $(e.target).mask("99.999.999/9999-99")} />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <TextField placeholder={"Nome da Escola"} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={"Nome da Escola"} type="text" id={"nomeEscola"} name={"nomeEscola"} aria-describedby={"Nome da Escola"} />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <TextField placeholder={"Endereço da Escola"} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={"Endereço da Escola"} type="text" id={"enderecoEscola"} name={"enderecoEscola"} aria-describedby={"Endereço da Escola"} />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <TextField placeholder={"Telefone da Escola"} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={"Telefone da Escola"} type="text" id={"telefoneEscola"} name={"telefoneEscola"} aria-describedby={"Telefone da Escola"} onKeyPress={(e) => $(e.target).mask("(99) 999999999")} />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <TextField placeholder={"E-mail da Escola"} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={"E-mail da Escola"} type="text" id={"emailEscola"} name={"emailEscola"} aria-describedby={"E-mail da Escola"} />
                    </FormControl>
                </Grid>
                

            </Grid>
            <h4>Cores da Escola</h4>
            <Grid
                justifyContent="flex-start"   
                container
                direction="row"
                spacing={1}
            >
                <Grid item>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <InputLabel htmlFor="corPrimariaEscola">Cor primária da Escola</InputLabel>
                        <Input type="color" label="Cor primária da escola" name="corPrimariaEscola" id="corPrimariaEscola" style={{width: "219px"}}/>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <InputLabel htmlFor="corPrimariaEscola">Cor secundária da Escola</InputLabel>
                        <Input type="color" label="Cor secundária da Escola:" name="corSecundariaEscola" id="corSecundariaEscola" style={{width: "219px"}}/>
                    </FormControl>
                </Grid>

            </Grid>
            <h4>Critérios de Aprovação/Reprovação</h4>
            <Grid
                justifyContent="flex-start"   
                container
                direction="row"
                spacing={1}
            >
                <Grid item xl={6}>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <TextField placeholder={"Nota mínima para aprovação"} autoComplete="off" InputLabelProps={{shrink: shrink,}} InputProps={{endAdornment: <InputAdornment position="end">Pts</InputAdornment>}} variant="filled" label={"Nota mínima de aprovação"} type="text" id={"pontosAprovacao"} name={"pontosAprovacao"} aria-describedby={"Nota mínima para aprovação"} />
                        <FormHelperText>Pontuação mínima para que o aluno seja aprovado</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item xl={6}>
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <TextField placeholder={"Frequência mínima para aprovação"} autoComplete="off" InputLabelProps={{shrink: shrink,}} InputProps={{endAdornment: <InputAdornment position="end">%</InputAdornment>}} variant="filled" label={"Frequência mínima de aprovação"} type="text" id={"frequenciaAprovacao"} name={"frequenciaAprovacao"} aria-describedby={"Frequência mínima para aprovação"} />
                        <FormHelperText>Porcentagem mínima de frequência para que o aluno seja aprovado</FormHelperText>
                    </FormControl>
                    
                </Grid>

            </Grid>
            <FormControl component="fieldset">
                    <FormLabel component="legend">Autonomia dos professores:</FormLabel>
                        <FormGroup>
                            
                            <FormControlLabel
                            control={<Switch checked={checked} value={"permitirDistribuiNotas"} onChange={(e) => setChecked(e.target.checked)} name="permitirDistribuiNotas" id="permitirDistribuiNotas" />}
                            label="Permitir os professores distribuírem as notas nas turmas"
                            />
                            
                        </FormGroup>
                    <FormHelperText>Caso você não permita, a secretaria será a responsável por definir as pontuações máximas de atividades da turma, ou seja, será responsável por distribuir as notas.</FormHelperText>
            </FormControl>
            <h4>Configurações da Chave PIX</h4>
            <Grid
                justifyContent="flex-start"   
                container
                direction="row"
                spacing={1}
            >
                <Grid item xl={6}>
                <FormControl variant="filled">
                    <InputLabel htmlFor="filled-age-native-simple">Tipo da chave pix:</InputLabel>
                    <Select
                        InputLabelProps={{shrink: false,}}
                        native
                        inputProps={{
                            name: 'tipoChavePix',
                            id: 'tipoChavePix',
                        }}
                    >
                        <option selected>Escolha...</option>
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="celular">Celular</option>
                        <option value="email">E-mail</option>
                        <option value="aleatoria">Chave aleatória</option>
                    </Select>
                    <FormHelperText>Tipo da chave pix utilizada</FormHelperText>
                </FormControl>
                </Grid>
                <Grid item xl={6}>
                    <FormControl  style={{width: '100%'}}> 
                        <TextField placeholder={"Insira a chave pix..."} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={"Chave Pix"} type="text" id={"chavePix"} name={"chavePix"} aria-describedby={"Frequência mínima para aprovação"} />
                        <FormHelperText>Chave pix atrelada ao banco que receberá os valores</FormHelperText>
                    </FormControl>
                    
                </Grid>
                <Grid item xl={6}>
                    <FormControl  style={{width: '100%'}}> 
                        <TextField placeholder={"Insira o nome ou razão social do beneficiário..."} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={"Nome ou Razão Social"} type="text" id={"nomePix"} name={"nomePix"} aria-describedby={"Frequência mínima para aprovação"} />
                        <FormHelperText>Nome completo ou razão social do beneficiário na conta bancária atrelada</FormHelperText>
                    </FormControl>
                    
                </Grid>
                <Grid item xl={6}>
                    <FormControl  style={{width: '100%'}}> 
                        <TextField placeholder={"Cidade do beneficiário..."} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={"Cidade do beneficiário"} type="text" id={"cidadePix"} name={"cidadePix"} aria-describedby={"Frequência mínima para aprovação"} />
                        <FormHelperText>Nome da cidade do beneficiário da chave pix atrelada</FormHelperText>
                    </FormControl>
                    
                </Grid>
                
                
                
            </Grid>
            <h4>Configurações financeiras</h4>
            <Grid
                justifyContent="flex-start"   
                container
                direction="row"
                spacing={1}
            >
                <Grid item xl={6}>
                    <FormControl variant="filled">
                        <InputLabel htmlFor="filled-age-native-simple">Quando o dia do vencimento da parcela não existir...:</InputLabel>
                        <Select
                            InputLabelProps={{shrink: false,}}
                            native
                            inputProps={{
                                name: 'proximoDiaVencimento',
                                id: 'proximoDiaVencimento',
                                
                            }}
                            required
                        >
                            <option value="true">...postergar vencimento para o dia 1 do próximo mês.</option>
                            <option value={"false"}>...adiantar o vencimento para último dia do mesmo mês.</option>
                            
                        </Select>
                        <FormHelperText>Usado na geração de boletos para decidir nos dias que não existirem em certos meses</FormHelperText>
                    </FormControl>
                </Grid>
            </Grid>
            
            <br /><br />
            <Button type="submit" variant="contained" color="primary" fullWidth>Salvar dados básicos  </Button>
            {loading &&<LinearProgress color="secondary" />}
            
            </form>
            
        </Fragment>
    );
}
 
export default BasicSchoolData;