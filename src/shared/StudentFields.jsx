import { Box, Button, Container, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, InputLabel, LinearProgress, makeStyles, Paper, Select, Switch, TextField, Typography, Checkbox } from "@material-ui/core";
import { Fragment, useState } from "react";
import { calculateAge, checkCpf, getAddress } from "./FunctionsUse";
import CrudTable from "./DataGrid";
import { useEffect } from "react";
import { additionalFieldsRef, contractRef, coursesRef } from "../services/databaseRefs";
import $ from 'jquery';
import ErrorDialog from '../shared/ErrorDialog'
import { useSnackbar } from "notistack";
import { PlusOneRounded } from "@material-ui/icons";
import FullScreenDialog from "./FullscreenDialog";

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
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
    }
  }));

function BasicDataFields({ shrink, handleOptionalSteps, setParentsRequired, setLoader, editMode=false, external=false }) {
    
    const classes = useStyles();

    const [ age, setAge ] = useState(null)
    

    const [ validCpf, setValidCpf ] = useState(false);
    const [ enrollType, setEnrollType ] = useState(external ? {checked: true, value: 'preMatricula'} : {checked: false, value: 'matricula'});


    useEffect(() => {
        if (external) {
            setEnrollType({checked: true, value: 'preMatricula'})
        }
        let basicData = JSON.parse(sessionStorage.getItem(0))
        try {
            if (basicData.tipoMatricula === 'preMatricula') {
                setEnrollType({checked: true, value: 'preMatricula'})
                !external && handleOptionalSteps(1)
            } else {
                setEnrollType({checked: false, value: 'matricula'})
                
                handleOptionalSteps(1, true)
            }
            handleCalculateAge(basicData.dataNascimentoAluno)
        } catch (error) {
            console.log(error)
        }
        
    }, [])

    const handleCalculateAge = async (date) => {
        let birthdate = (date.hasOwnProperty('target') && date.target.valueAsDate) || new Date(date)
        if (birthdate != null && !isNaN(birthdate.getDay()) ) {
            try {
                setLoader(true)
                setAge('Calculando idade...')
                let ageObj = await calculateAge(birthdate);
                setAge(`Idade ${ageObj.years} anos, ${ageObj.months} meses e ${ageObj.days} dias`);
                if (!editMode) {
                    if (ageObj.years < 18) {
                        setParentsRequired(true);
                    } else {
                        setParentsRequired(false);
                    }
                }
                
                setLoader(false)
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

    const handleChangeEnrollType = () => {
        setEnrollType({checked: !enrollType.checked, value: !enrollType.checked ? 'preMatricula' : 'matricula'})
        if (!enrollType.checked) {
            handleOptionalSteps(1)
        } else {
            handleOptionalSteps(1, true)
        }
    }


    return (
        <>
        <div className={classes.root}>
            {!editMode &&
            <FormControl component="fieldset">
                <FormLabel component="legend">Tipo de Matrícula</FormLabel>
                <FormGroup>
                    <FormControlLabel
                    control={<Switch checked={enrollType.checked} onChange={handleChangeEnrollType} id="tipoMatricula" name="tipoMatricula" value="preMatricula" color="primary"/>}
                    label={'Pré-matrícula'} disabled={external}
                    />
                    
                </FormGroup>
                {!external && <FormHelperText>Escolha se será uma matrícula ou pré-matrícula.</FormHelperText>}
            </FormControl>}
              <Grid 
              justifyContent="center"   
              container
              direction="row"
              spacing={0}
              >
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: shrink,}}  variant="filled" label="Nome Completo do aluno" type="text" id="nomeAluno" name="nomeAluno" aria-describedby="my-helper-text" />
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
                        <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: shrink,}} label="Telefone" type="number" id="telefoneAluno" name="telefoneAluno" aria-describedby="my-helper-text" onKeyPress={(e) => $(e.target).mask("99999999999")}/>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: shrink,}} required label="Celular" type="number" id="celularAluno" name="celularAluno" aria-describedby="my-helper-text" onKeyPress={(e) => $(e.target).mask("99999999999")} />
                        <FormHelperText>DDD e o número (Ex.: 31999999999) </FormHelperText>
                    </FormControl>
                    
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="no" InputLabelProps={{shrink: shrink,}} variant="filled" label="E-mail" type="email" id="emailAluno" name="emailAluno" aria-describedby="my-helper-text" />
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
          </>
    );
}


function ContractConfigure({ activeStep, isOpen, setOpenDialog }) {
    
    const courseChosen = JSON.parse(sessionStorage.getItem(activeStep))

    const [ saveDisabled, setSaveDisabled ] = useState(true);

    useEffect(() => {
        setSaveDisabled(true)
        handleGetData()
    }, [isOpen])

    const handleGetData = () => {
        console.log(activeStep)
        try {
            coursesRef.child(courseChosen.dadosTurma.courseId).once('value').then(courseInfo => {
                console.log(courseInfo.val())
                handleMountContractScreen(courseInfo.val())
            }).catch(error => {
                console.log(error)
            })
        } catch (error) {
            console.log(error);
        }
        
    }

    const [ shrink, setShrink ] = useState(false);

    const [ plans, setPlans ] = useState([{value: '', label: '', key: ''}])
    const [ plan, setPlan ] = useState([{id: ''}])

    const [ openDialogError, setOpenDialogError ] = useState(false);

    const handleMountContractScreen = (courseInfo) => {
        console.log(courseInfo);
        setData(courseInfo);

        let plansInfo = courseInfo.planos;
        let plansArray = [];
        for (const key in plansInfo) {
            if (Object.hasOwnProperty.call(plansInfo, key)) {
                const plan = plansInfo[key];
                plansArray.push({value: key, label: plan.nomePlano, key: key})
            }
        }
        console.log(plansArray)
        setPlans(plansArray);
       
    }

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const classes = useStyles();
    const [ data, setData ] = useState(null);

    const [state, setState] = useState({
        planId: '',
        name: '',
    });

    const columns = [
        { field: 'col1', headerName: 'Parcela', width: 110 }, 
        { field: 'col2', headerName: 'Valor Inicial', width: 147 },
        { field: 'col3', headerName: 'Acréscimos', width: 142 },
        { field: 'col4', headerName: 'Descontos', width: 135 },
        { field: 'col5', headerName: 'Valor Final', width: 147 },
    ]
      
    const [ rows, setRows ] = useState([{id: 1, col1: '1', col2: 0, col3: 0, col4: 0, col5: 0},]);

    const contractHandler = async (save = false) => {
        
        let form = document.querySelector('#contractForm');
        let formData = new FormData(form);
        let fieldsData = $('#contractForm').serializeArray();
        console.log(fieldsData)

        let internData = {};
        fieldsData.forEach(field => {
            let values = formData.getAll(field.name);
            internData[field.name] = values.length === 1 ?  values[0] : values;
        })
        let internPlan = data.planos[plan.id]

        internData.vencimentoEscolhido = internData.diasDeVencimento
            if (Number(internData.numeroParcelas) > Number(internPlan.numeroMaximoParcelasPlano)) {
                setOpenDialogError({
                    title: 'Parcelamento não permitido', 
                    message: 'Este plano permite apenas o parcelamento em até ' + internPlan.numeroMaximoParcelasPlano + ' parcelas. Para ter um parcelamento maior, tente usar outro plano compatível com sua necessidade, ou solicite ao setor Administrativo/Financeiro para possível mudança de parcelamento deste plano.'
                })
                internData.numeroParcelas = ''
            } else if (internData.numeroParcelas < internPlan.quandoAplicar + 1) {
                
                setOpenDialogError({
                    title: 'Parcelamento não permitido', 
                    message: `O contrato deve possuir pelo menos ${Number(internPlan.quandoAplicar) + 1} parcelas. Para outros tipos de parcelamento ou pagamento á vista, tente usar outro plano compatível com sua necessidade, ou solicite ao setor Administrativo/Financeiro para possível mudança de parcelamento deste plano.`
                })
                internData.numeroParcelas = ''
            } else {
                try {
                    internData.valorDesconto = (Number(internData.valorCurso) * (internData.descontoPlano/100)).toFixed(2)
                    internData.valorAcrescimo = (Number(internData.valorCurso) * (internData.acrescimoPlano/100)).toFixed(2)
                    internData.valorFinal = (Number(internData.valorCurso) + (internData.valorAcrescimo - internData.valorDesconto)).toFixed(2)
                    setRows([])
                    let saldo = internData.valorCurso
                    let saldoAcrescimo = internData.valorAcrescimo
                    let saldoDesconto = internData.valorDesconto
                    let contadorParcelas = internData.numeroParcelas
                    let somaParcelas = 0
                    let valorParcelaGlobal = 0
                    let internRows = []
                    for (let parcela = 0; parcela < internData.numeroParcelas; parcela++) {
                        let row = {}
                        if (internPlan.distribuirAcrescimosEDescontos === 'on') {
                            
                            
                            let acrescimoParcela 
                            let descontoParcela 
                            let valorParcela
                            valorParcelaGlobal = parcela === 0 ? parseFloat(saldo / contadorParcelas).toFixed(2) : valorParcelaGlobal
                            if (parcela >= internPlan.quandoAplicar) {
                                // parcela == internData.quandoAplicar ? saldo = internData.valorFinal - somaParcelas : null
                                valorParcelaGlobal = parcela === internPlan.quandoAplicar ?  parseFloat(saldo / contadorParcelas).toFixed(2) : valorParcelaGlobal
                                valorParcela = valorParcelaGlobal
                                acrescimoParcela = (saldoAcrescimo/contadorParcelas).toFixed(2)
                                descontoParcela = (saldoDesconto/contadorParcelas).toFixed(2)
                                // saldo = (Number(saldo) - valorParcela) - Number(acrescimoParcela - descontoParcela)
                            } else {
                                valorParcela = valorParcelaGlobal
                                
                                // saldo = saldo - valorParcela
                                acrescimoParcela = 0
                                descontoParcela = 0
                            }
                            
                            saldoAcrescimo = saldoAcrescimo - acrescimoParcela
                            saldoDesconto = saldoDesconto - descontoParcela
                            
                            row = internPlan.quandoAplicar !== undefined ? {id: parcela, col1: parcela + 1, col2: `R$${valorParcela}`, col3: ` ${acrescimoParcela !== 0 || acrescimoParcela !== '' ? '+ R$' + acrescimoParcela : ''}`, col4: ` ${descontoParcela !== 0 || descontoParcela !== '' ? '- R$' + descontoParcela : ''}`, col5: `R$${(Number(valorParcela) + (acrescimoParcela - descontoParcela)).toFixed(2)}`} : {id: parcela} 
                            console.log(row)
                            somaParcelas += (Number(valorParcela) + (acrescimoParcela - descontoParcela))
                        } else {
                            saldo = parcela === 0 ? internData.valorFinal : saldo
                             row = {id: parcela, col1: `Parcela ${parcela + 1}`, col2: `R$${parseFloat(internData.valorFinal / internData.numeroParcelas).toFixed(2)}`, col3: '0', col4: '0', col5: `R$${parseFloat(internData.valorFinal / internData.numeroParcelas).toFixed(2)}`}
                            // saldo = saldo - parseFloat(internData.valorFinal / internData.numeroMaximoParcelasPlano).toFixed(2)
                            somaParcelas += Number(parseFloat(internData.valorFinal / internData.numeroParcelas))
                        }
                        saldo = (parcela >= internPlan.quandoAplicar ? internData.valorFinal : internData.valorCurso) - somaParcelas
                        console.log(saldo)
                        internRows.push(row)
                        console.log(internRows)
                        // addParcela(`Saldo: R$${saldo}`)
                        contadorParcelas--
                    }
                    setRows(internRows)
                    // addParcela(`Total: R$${somaParcelas.toFixed(2)}`)
    
                } catch (error) {
                    console.log(error)
                }
            }
            

            for (const id in internData) {
                if (Object.hasOwnProperty.call(internData, id)) {
                    const value = internData[id];
                    document.getElementById(id).value = value;
                }
            }

            if (save) {
                sessionStorage.setItem('contratoConfigurado', JSON.stringify(internData));
                sessionStorage.setItem('planoOriginal', JSON.stringify(internPlan));
                let contractCode = await contractRef.push().key;
                sessionStorage.setItem('codContrato', contractCode);
                if ((internData.vencimentoEscolhido && internData.numeroParcelas && internData['ano-mes']) !== '') {
                    enqueueSnackbar('Dados salvos!', {variant: 'success'});
                    setOpenDialog(false);
                } else {
                    enqueueSnackbar('Preencha todos os campos necessários do contrato.', {variant: 'error'});
                }
                
            }
    }
    
    const handleChange = (event) => {
        const planId = event.target.value;
        setPlan({id: planId});
        let plan = data.planos[planId];
        for (const name in plan) {
            if (Object.hasOwnProperty.call(plan, name)) {
                const value = plan[name];
                if (name === 'diasDeVencimento') {
                    document.getElementById(name).innerHTML = '<option selected hidden></option>'
                    value.forEach(day => {
                        
                        let option = document.createElement('option')
                        option.value = day
                        option.innerText = day
                        document.getElementById(name).appendChild(option)
                    })
                } else {
                    try {
                        document.getElementById(name).value = value
                    } catch (error) {
                        console.log(error)
                    }
                }
                
               
            }
        }
        setShrink(true);
        if (planId !== '')
            setSaveDisabled(false)
        else
            setSaveDisabled(true)
      };

      const [ day, setDay ] = useState(1)
      const handleChangeDay = (event) => {
        setDay(event.target.value)
      }

      const handleSubmit = (e) => {
        e.preventDefault()
        console.log(e)
        let formData = new FormData(document.getElementById('contractForm'))
  
        let data = Object.fromEntries(formData.entries());
        console.log(data)
        //sessionStorage.setItem(activeStep, JSON.stringify(data))
      }

      const daysOptions = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]

      
    return(
        <Fragment>
            {openDialogError && <ErrorDialog onClose={() => {setOpenDialogError(false)}} isOpen={true} title={openDialogError.title} message={openDialogError.message} /> }
            <FullScreenDialog 
                isOpen={isOpen}
                onClose={() => {
                    setOpenDialog(false);
                }}
                onSave={() => {
                    contractHandler(true);
                }}
                title={"Configurar contrato"}
                saveButton={"Salvar"}
                saveButtonDisabled={saveDisabled}
            >
                {!data ? (
                <div style={{width: '100%'}}>
                    <LinearProgress />
                </div>
                
                ) : (<>
                <div style={{textAlign: 'center', width: '100%'}}><h3>Escolha um plano</h3></div>
                <FormControl variant="filled">
                    <InputLabel htmlFor="listaPlanos">Escolha um plano</InputLabel>
                    <Select
                        native
                        value={plan.id}
                        onChange={handleChange}
                        id="listaPlanos"
                        inputProps={{
                            name: 'listaPlanos',
                            id: 'listaPlanos',
                        }}
                    >
                        <option aria-label="None" value="" />
                        {plans.map(plan => ( 
                            <option value={plan.value} key={plan.value}>{plan.label}</option>
                        )
                        )}
                    </Select>
                </FormControl>
                <Container>
                    <form onSubmit={handleSubmit} onBlur={() => {contractHandler()}} id="contractForm" autoComplete="off">
                        <h1>Dados do Curso:</h1>
                        <Grid
                            justifyContent="flex-start"   
                            container
                            direction="row"
                            spacing={2}
                        >
                            
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" InputLabelProps={{shrink: shrink,}} InputProps={{readOnly: true}} autoComplete="off" required label="Nome do curso" type="text" id="nomeCursoAdd" name="nomeCursoAdd" value={data.nomeCursoAdd} aria-describedby="my-helper-text" />
                                    <FormHelperText>Identificação que aparece nos boletins e nos demais documentos emitidos pelo sistema. </FormHelperText>
                                </FormControl>
                                
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: shrink,}} label="Código do curso" type="text" id="codigoCursoAdd" name="codigoCursoAdd" aria-describedby="my-helper-text" />
                                    <FormHelperText>Código utilizado para formar os códigos automáticos de turma.</FormHelperText>
                                </FormControl>
                            </Grid>
                                
                            
                        </Grid>
                        <hr />
                        <h1>Dados do Plano:</h1>
                        <h6>Todos os valores brutos estão em R$ (BRL - Brazilian Real / Real Brasileiro)</h6>
                        <Grid
                            justifyContent="flex-start"   
                            container
                            direction="row"
                            spacing={2}
                        >
                            
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: shrink,}} required label="Nome do plano" type="text" id="nomePlano" name="nomePlano" aria-describedby="my-helper-text" />
                                    <FormHelperText>Este é o nome de identificação do plano para a secretaria. </FormHelperText>
                                </FormControl>
                                
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: shrink,}}  label="Valor Integral do Curso" type="text" id="valorCurso" name="valorCurso" aria-describedby="my-helper-text" />
                                    <FormHelperText>Valor integral do curso sem descontos.</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: shrink,}} label="Desconto (%)" type="text" id="descontoPlano" name="descontoPlano" aria-describedby="my-helper-text" />
                                    <FormHelperText>Desconto sobre o valor integral.</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: shrink,}} label="Valor do desconto" type="text" id="valorDesconto" name="valorDesconto" aria-describedby="my-helper-text" />
                                    
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: shrink,}} label="Acréscimo (%)" type="text" id="acrescimoPlano" name="acrescimoPlano" aria-describedby="my-helper-text" />
                                    <FormHelperText>Acréscimo sobre o valor integral.</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: shrink,}} label="Valor do acréscimo" type="text" id="valorAcrescimo" name="valorAcrescimo" aria-describedby="my-helper-text" />
                                    
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: shrink,}} label="Valor integral final" type="text" id="valorFinal" name="valorFinal" aria-describedby="my-helper-text" />
                                    
                                </FormControl>
                            </Grid>
                            
                        </Grid>
                        <hr />
                        <h2>Parcelas</h2>
                        <Grid
                            justifyContent="flex-start"   
                            container
                            direction="row"
                            spacing={2}
                        >
                            
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: true,}} required label="Nº de parcelas" type="text" id="numeroParcelas" name="numeroParcelas" aria-describedby="my-helper-text" />
                                    <FormHelperText>O número máximo de parcelas é de {plan.id && data.planos[plan.id].numeroMaximoParcelasPlano} parcelas. </FormHelperText>
                                </FormControl>
                                
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}>
                                    <CrudTable rows={rows} columns={columns} rowHeight={25} disableColumnMenu disableDensitySelector disableColumnSelector disableColumnFilter hideFooter />
                                    <FormHelperText>Esta tabela serve apenas para visualizar a simulação de parcelamento no contrato. Esta é a distribuição de parcelas para este plano. </FormHelperText>
                                </FormControl>
                                
                            </Grid>
                                
                            
                        </Grid>
                        <hr />
                        <h2>Vencimento</h2>
                        <Grid
                            justifyContent="flex-start"   
                            container
                            direction="row"
                            spacing={2}
                            alignContent="center" 
                            alignItems="center"
                        >
                            <Grid item >
                            <FormControl variant="filled">
                                <InputLabel htmlFor="filled-age-native-simple">Escolha um dia</InputLabel>
                                <Select
                                    required
                                    native
                                    value={state.value}
                                    onChange={handleChangeDay}
                                    inputProps={{
                                        name: 'diasDeVencimento',
                                        id: 'diasDeVencimento',
                                    }}
                                >
                                    {!data.diasDeVencimento && (daysOptions.map(dayOpt => <option value={dayOpt}>{dayOpt}</option>))}
                                    
                                </Select>
                                <FormHelperText>Escolha o dia de vencimento do boleto/carnê. </FormHelperText>
                            </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: true,}} required label="Dia Escolhido" value={day} type="text" id="vencimentoEscolhido" name="vencimentoEscolhido" aria-describedby="my-helper-text" />
                                    <FormHelperText> Dia escolhido para o vencimento. </FormHelperText>
                                </FormControl>
                                
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField name="ano-mes" variant="filled"  InputLabelProps={{shrink: true,}}  id="ano-mes" required autoComplete="off"  type="month" label="Escolha quando começará o vencimento"/>
                                    <FormHelperText> Escolha o mês e o ano para iniciar a geração dos boletos. </FormHelperText>
                                </FormControl >
                            </Grid>

                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: shrink,}} required label="Informações e avisos" InputProps={{readOnly: true}} type="text" id="descricaoPlano" name="descricaoPlano" aria-describedby="my-helper-text" />
                                    <FormHelperText> Informações e avisos para serem gerados no boleto. </FormHelperText>
                                </FormControl>
                                
                            </Grid>
                            
                                
                            
                        </Grid>
                    </form>
                
                
                </Container>
                </>)}
            </FullScreenDialog>
            
        </Fragment>
    );
}

function CourseDataFields(props) {
    const { shrink, rows, columns, rowHeight, activeStep, setLoader } = props;

    const classes = useStyles();

    const [ loading, setLoading ] = useState(false)
    const [ contractState, setContractState ] = useState(false)
    const [ courseChosen, setCourseChosen ] = useState({turmaAluno: '', horaAluno: '', professor: {}})
    const [ openDialog, setOpenDialog ] = useState(false);


    useEffect(() => {
        let contractCode = sessionStorage.getItem('codContrato');
        let storedCourse = JSON.parse(sessionStorage.getItem(activeStep))
        console.log(contractCode);
        if (contractCode && storedCourse) {
            setContractState(contractCode);
            setCourseChosen(storedCourse.dadosTurma)
        } else {
            setContractState(null);
            
        }
    }, [openDialog])

    const handleRowClick = (data) => {
        const coursesData = JSON.parse(sessionStorage.getItem('coursesData'));
        setCourseChosen((coursesData.filter(course => course.turmaAluno === data.id))[0]);
        sessionStorage.setItem(activeStep, JSON.stringify({dadosTurma: (coursesData.filter(course => course.turmaAluno === data.id))[0]}));
        setOpenDialog(true)
        
    }
      

    return (
        <>
            <ContractConfigure activeStep={activeStep} setLoader={setLoader} isOpen={openDialog} setOpenDialog={setOpenDialog}  />
            
            <Grid
                justifyContent="center"   
                container
                
                spacing={1}
            >
                <Grid item xs>
                    <Paper style={{padding: '10px', minWidth: '250px'}} elevation={5}>
                        <h4>Escolha uma turma</h4>
                        
                        <CrudTable rows={rows} columns={columns} rowHeight={rowHeight} onRowClick={handleRowClick} />
                    </Paper>
                </Grid>
                <Grid item xs sm={3}>
                    <Paper style={{padding: '10px', alignItems: 'center'}} elevation={5}>
                        <h4>{courseChosen && courseChosen.turmaAluno !== '' ? <label>Turma escolhida: {courseChosen.turmaAluno}</label> : <label>Turma não escolhida</label>}</h4>
                        <hr />
                    <h4>{contractState ? 'Contrato configurado' : 'Contrato não configurado'}</h4>
                        {contractState && (
                            <Box>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: shrink,}} required label="Cód. do Contrato" InputProps={{readOnly: true}} type="text" value={contractState} id="contractCode" name="contractCode" aria-describedby="my-helper-text" />
                                    <FormHelperText> Código gerado pelo sistema para o contrato. Não é necessário guardá-lo ou alterá-lo. </FormHelperText>
                                </FormControl>
                            </Box>
                        )}
                        {contractState && (<FormHelperText>O Contrato já está configurado. Caso queira alterar, basta clicar na turma novamente e refazer o contrato.</FormHelperText>)} 
                    </Paper>
                </Grid>

            </Grid>
            
            
            
        </>
    );
}


const AddressAndParentsFields = ({ shrink, parentsRequired, editMode=false }) => {

    const classes = useStyles();
    
    const [ cep, setCep ] = useState({message: 'Digite o CEP para buscar'});
    const [ validCpf, setValidCpf ] = useState(false);
    const [ parentsFields, setParentsFields ] = useState([]);

    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ additionalFields, setAdditionalFields ] = useState(null);

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    

    useEffect(() => {
        let parentsArray = JSON.parse(sessionStorage.getItem('responsaveis'))
        console.log(parentsArray)
        if (parentsArray) {
            setParentsFields(parentsArray)
        } else if (parentsRequired) {
            setDialogOpen(true)
        }
        additionalFieldsRef.once('value').then((snapshot) => {
            let fieldsData = snapshot.val();
            setAdditionalFields(fieldsData);
        }).catch(error => {
            console.log(error)
            throw new Error(error.message)
        })
    }, [])

    const handleGetAddress = async (e) => {
        console.log(e.target.value)
        let cepNum = e.target.value
        if (cepNum != null) {
            try {
                setCep({message: 'Buscando CEP...'})
                let cepObj = await getAddress(cepNum);
                cepObj.message = 'Endereço encontrado!'
                if (cepObj.errors) {
                    cepObj.message = 'Erro. Tente Novamente!'
                }
                console.log(cepObj)
                setCep(cepObj);
            } catch (error) {
                console.log(error)
                error.message === 'permission-denied' ? setCep(`Você não possui permissão.`) : setCep(error.message)
                
            }
            
        } 
        
        
    }

    const handleCheckCpf = (e) => {
        let cpf = e.target.value

        setValidCpf(!checkCpf(cpf))
    }

    const handleAddParentField = (edit=false, id=null) => {
        if (edit) {
            let fields = (parentsFields.filter(parent => parent.id === id))[0]
            console.log(fields)
            setDialogOpen(fields)
            
        } else {
            setDialogOpen(true);
        }
        
    }

    const handleCloseDialog = () => {
        if (parentsFields.length === 0 && parentsRequired) {
            enqueueSnackbar('O aluno é menor de idade. Deve ser cadastrado pelo menos um responsável.', {variant: 'warning', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        } else {
            setDialogOpen(false);
        }
        
    }

    const handleSaveParentData = () => {
        let valid = $('#formParentData')[0].checkValidity();
        if (!valid) {
            $('#formParentData')[0].reportValidity();
        } else {
            let fieldsData = $('#formParentData').serializeArray();
            let form = document.querySelector('#formParentData');
            let formData = new FormData(form);
            console.log(fieldsData)

            let parentObj = {};
            fieldsData.forEach(field => {
                let values = formData.getAll(field.name);
                parentObj[field.name] = values.length === 1 ?  values[0] : values;
                if (field.name === "pedagogico" || field.name === "financeiro") {
                    parentObj[field.name] = values[0] === "true" ? true : false
                }
            })
            parentObj.id = parentObj.cpf
            let parentsArray = JSON.parse(JSON.stringify(parentsFields))
            let newParentsArray = parentsArray.filter(parent => parent.id !== parentObj.id)
            newParentsArray.push(parentObj)
            console.log('Array antiga', parentsArray)
            console.log('Nova array', newParentsArray)
            setParentsFields(newParentsArray)
            sessionStorage.setItem('responsaveis', JSON.stringify(newParentsArray))
            setDialogOpen(false)
        }
        
    }

    

    return (
        <>
        <FullScreenDialog isOpen={dialogOpen} onClose={handleCloseDialog} onSave={handleSaveParentData} title="Cadastrar responsável" saveButton="Salvar" saveButtonDisabled={false}>
        <Typography style={{width: '99%', marginLeft: 'auto', marginRight: 'auto'}}>
            <Paper>
                <div style={{textAlign: 'center'}}>
                    <h4>Digite os dados do responsável</h4>
                </div>
                <form id="formParentData">
                    <Grid
                    justifyContent="flex-start"   
                    container
                    direction="row"
                    spacing={1}
                    
                    >
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField autoComplete="off" required InputLabelProps={{shrink: shrink,}} variant="filled" label="Nome" type="text" id="nome" name="nome" aria-describedby="my-helper-text" value={dialogOpen.nome} onChange={(e) => {setDialogOpen({ nome: e.target.value})}}
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl variant="filled" >
                                <InputLabel htmlFor="relacao" style={{marginTop: '16px',}} required shrink={true}>Relação</InputLabel>
                                <Select
                                    style={{marginTop: '16px',}}
                                    native
                                    // value={state.value}
                                    // onChange={handleChangeDay}
                                    inputProps={{
                                        name: 'relacao',
                                        id: 'relacao',
                                    }}
                                    value={dialogOpen.relacao}
                                    onChange={(e) => {setDialogOpen({ relacao: e.target.value})}}
                                >
                                    <option hidden>Escolha...</option>
                                    <option value="Mãe">Mãe</option>
                                    <option value="Pai">Pai</option>
                                    <option value="Tio">Tio</option>
                                    <option value="Tia">Tia</option>
                                    <option value="Avô">Avô</option>
                                    <option value="Avó">Avó</option>
                                    <option value="Responsável">Responsável</option>
                                    
                                </Select>
                                
                            </FormControl>
                        </Grid>
                        
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField  autoComplete="off" required InputLabelProps={{shrink: shrink,}} variant="filled" label="Número Celular" type="text" id="celular" name="celular" aria-describedby="my-helper-text" value={dialogOpen.celular} onChange={(e) => {setDialogOpen({ celular: e.target.value})}}
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField autoComplete="off" required InputLabelProps={{shrink: shrink,}} variant="filled" label="E-mail" type="email" id="email" name="email" aria-describedby="my-helper-text" value={dialogOpen.email} onChange={(e) => {setDialogOpen({ email: e.target.value})}}
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField autoComplete="off" required InputLabelProps={{shrink: shrink,}} variant="filled" label="CPF" error={validCpf} onBlur={(e) => {e.target.value = validCpf ? '' : e.target.value}} onChange={(e) => {handleCheckCpf(e)
                                 setDialogOpen({ cpf: e.target.value})}}  type="text" id="cpf" name="cpf" aria-describedby="my-helper-text" value={dialogOpen.cpf} helperText={
                                        validCpf &&
                                        "Insira um CPF válido."
                                    }
                                    FormHelperTextProps={{ error: true, }}  />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField autoComplete="off" required InputLabelProps={{shrink: shrink,}} variant="filled" label="RG" type="text" id="rg" name="rg" aria-describedby="my-helper-text" value={dialogOpen.rg} onChange={(e) => {setDialogOpen({ rg: e.target.value})}}
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}>
                            <FormControlLabel
                                value={dialogOpen.pedagogico}
                                control={<Checkbox id="pedagogico" checked={dialogOpen.pedagogico} onChange={(e) => {setDialogOpen({pedagogico: e.target.checked, financeiro: dialogOpen.financeiro})}} name="pedagogico" color="primary" />}
                                label="Responsável Pedagógico"
                                labelPlacement="end"
                            />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}>
                            <FormControlLabel
                                value={dialogOpen.financeiro}
                                control={<Checkbox id="financeiro" checked={dialogOpen.financeiro} onChange={(e) => {setDialogOpen({financeiro: e.target.checked, pedagogico: dialogOpen.pedagogico})}} name="financeiro" color="primary" />}
                                label="Responsável Financeiro"
                                labelPlacement="end"
                            />
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
                
            </Paper>
            
        </Typography>
        </FullScreenDialog>
        <div className={classes.root}>
        <h4>Endereço</h4>
              <Grid 
              justifyContent="flex-start"   
              container
              direction="row"
              spacing={2}
              >
                  
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: shrink,}}  variant="filled" label="CEP" type="text" id="cepAluno" name="cepAluno" onBlur={handleGetAddress} aria-describedby="my-helper-text" />
                        <FormHelperText> {cep.message} </FormHelperText>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField name="enderecoAluno" style={{width: '219px',}} variant="filled" InputLabelProps={{shrink: true,}}  id="enderecoAluno" required autoComplete="off"  type="text"  label="Endereço" value={cep.street}/>
                        
                    </FormControl >
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: true,}} label="Número" type="text" id="numeroAluno" required name="numeroAluno" aria-describedby="my-helper-text" />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: true,}} required label="Bairro" type="text" id="bairroAluno" name="bairroAluno" aria-describedby="my-helper-text" value={cep.neighborhood} />
                        
                    </FormControl>
                    
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: true,}} variant="filled" label="Cidade" type="text" id="cidadeAluno" name="cidadeAluno" aria-describedby="my-helper-text" value={cep.city} />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl className={classes.fields}> 
                        <TextField required autoComplete="off" InputLabelProps={{shrink: true,}} variant="filled" label="UF" type="text" id="estadoAluno" name="estadoAluno" aria-describedby="my-helper-text" value={cep.state} />
                        
                    </FormControl>
                </Grid>
                
                
                
              </Grid>
              {!editMode && (
                <>
                    <h4>Responsáveis</h4>
                    <Button variant="contained" color="primary" onClick={() => {handleAddParentField()}}><PlusOneRounded /> Cadastrar Responsável </Button>
                </>
                )}

        
            <Fragment>
            
            {parentsFields.map((field) => (
                <Typography key={field.id}>
                    <hr />
                    <Grid
                    justifyContent="flex-start"   
                    container
                    direction="row"
                    spacing={2}
                    
                    >
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField autoComplete="off" required disabled InputLabelProps={{shrink: shrink,}} variant="filled" label="Nome" type="text" aria-describedby="my-helper-text" value={field.nome}
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl variant="filled" >
                                <InputLabel htmlFor="relacao" disabled style={{marginTop: '16px',}} required shrink={true}>Relação</InputLabel>
                                <Select
                                    style={{marginTop: '16px',}}
                                    native
                                    // value={state.value}
                                    // onChange={handleChangeDay}
                                    disabled={true}
                                    value={field.relacao}
                                >
                                    <option hidden selected>Escolha...</option>
                                    <option value="Mãe">Mãe</option>
                                    <option value="Pai">Pai</option>
                                    <option value="Tio">Tio</option>
                                    <option value="Tia">Tia</option>
                                    <option value="Avô">Avô</option>
                                    <option value="Avó">Avó</option>
                                    <option value="Responsável">Responsável</option>
                                    
                                </Select>
                                
                            </FormControl>
                        </Grid>
                        
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField  autoComplete="off" required disabled InputLabelProps={{shrink: shrink,}} variant="filled" label="Número Celular" type="text"  aria-describedby="my-helper-text" value={field.celular}
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField autoComplete="off" required disabled InputLabelProps={{shrink: shrink,}} variant="filled" label="E-mail" type="text" aria-describedby="my-helper-text" value={field.email}
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField autoComplete="off" required disabled InputLabelProps={{shrink: shrink,}} variant="filled" label="CPF" error={validCpf} onChange={handleCheckCpf} onBlur={() => validCpf ? document.getElementById('cpf').value = null : null} type="text"  aria-describedby="my-helper-text" value={field.cpf} helperText={
                                        validCpf &&
                                        "Insira um CPF válido."
                                    }
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}> 
                                <TextField autoComplete="off" required disabled InputLabelProps={{shrink: shrink,}} variant="filled" label="RG" type="text"  aria-describedby="my-helper-text" value={field.rg}
                                    FormHelperTextProps={{ error: true }} />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}>
                            <FormControlLabel
                                value="pedagogico"
                                control={<Checkbox id="pedagogico" disabled checked={field.pedagogico} name="pedagogico" color="primary" />}
                                label="Responsável Pedagógico"
                                labelPlacement="end"
                            />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}>
                            <FormControlLabel
                                value="financeiro"
                                control={<Checkbox id="financeiro" disabled checked={field.financeiro} name="financeiro" color="primary" />}
                                label="Responsável Financeiro"
                                labelPlacement="end"
                            />
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <FormControl className={classes.fields}>
                                <Button variant="contained" onClick={() => {handleAddParentField(true, field.id)}}>Editar</Button>
                            </FormControl>
                            
                        </Grid>
                    </Grid>
                    
                </Typography>
                    
                
            ))}                    
            </Fragment>

            <h4>Dados adicionais</h4>
            {additionalFields && additionalFields.map(field => (
                    <FormControl className={classes.fields} style={{width: '100%'}}> 
                        <TextField required={field.required}  placeholder={field.placeholder} autoComplete="off" InputLabelProps={{shrink: shrink,}} variant="filled" label={field.label} type="text" id={"additional" + field.id} name={"additional" + field.id} aria-describedby={field.placeholder} />
                    </FormControl>
                
            ))}
                
       
          </div>
          </>
    );
}
 

export { BasicDataFields, CourseDataFields, ContractConfigure, AddressAndParentsFields };