import { Fragment, useEffect, useState } from "react";
import useStyles from "../../../hooks/useStyles";
import { FormControl, Select, InputLabel, LinearProgress, Container, Grid, TextField, FormHelperText, FormLabel, RadioGroup, Radio, FormControlLabel, MenuItem, Checkbox, ListItemText, Input } from '@material-ui/core'
import { contractRef, coursesRef } from "../../../services/databaseRefs";
import { useSnackbar } from "notistack";
import $ from 'jquery';
import ErrorDialog from "../../../shared/ErrorDialog";
import FullScreenDialog from "../../../shared/FullscreenDialog";
import CrudTable from "../../../shared/DataGrid";

const PlanEditor = ({ courseId, planId=undefined, isOpen, setOpenDialog }) => {
    
    const [ saveDisabled, setSaveDisabled ] = useState(true);
    const [ calculatedData, setCalculatedData ] = useState();

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
    PaperProps: {
        style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
        },
    },
    };

    useEffect(() => {
        setSaveDisabled(true)
        handleGetData()
        console.log(calculatedData)
    }, [isOpen])

    const handleGetData = () => {
        try {
            coursesRef.child(courseId).once('value').then(courseInfo => {
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
    const [ plan, setPlan ] = useState()

    const [ openDialogError, setOpenDialogError ] = useState(false);

    const handleMountContractScreen = (courseInfo) => {
        console.log(courseInfo);
        setData(courseInfo);
        if (courseInfo.hasOwnProperty('planos')) {
            contractHandler('', courseInfo.planos[planId] ?? null)
            setPlan(courseInfo.planos[planId])
        } else {
            contractHandler('')
        }
        
        
       
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

    const contractHandler = async (elemId='', planChosen=null, save) => {
        
        let form = document.querySelector('#contractForm');

        let internData = {};
        try {
            var formData = new FormData(form);
            var fieldsData = $('#contractForm').serializeArray();
            console.log(fieldsData)
            
            fieldsData.forEach(field => {
                let values = formData.getAll(field.name);
                internData[field.name] = values.length === 1 ?  values[0] : values;
            })
        } catch (error) {
            console.log('**************************')
            console.log(error)
            console.log(planChosen)
            console.log(internData)
            internData = planChosen ? planChosen : {
                "acrescimoPlano" : "0",
                "codigoCursoAdd" : "",
                "descontoPlano" : "0",
                "descricaoPlano" : "",
                "distribuirAcrescimosEDescontos" : "",
                "nomeCursoAdd" : "",
                "nomePlano" : "",
                "numeroMaximoParcelasPlano" : "",
                "quandoAplicar" : "",
                "valorAcrescimo" : "0.00",
                "valorCurso" : "0",
                "valorDesconto" : "0",
                "valorFinal" : "0",
                "vencimento" : ""
              }
            console.log(internData)
            setPlan(internData)
        }
        

        if (internData.hasOwnProperty('diasDeVencimento') && !Array.isArray(internData.diasDeVencimento)) {
            internData.diasDeVencimento = internData.diasDeVencimento.split(',')
        } else if (internData.hasOwnProperty('diasDeVencimento')) {
            internData.diasDeVencimento = [internData.diasDeVencimento]
        } else {
            internData.diasDeVencimento = []
        }

        
        
        let internPlan = plan ?? {}
            
        try {
            console.log(elemId)
            if (elemId === 'valorDesconto') {
                internData.descontoPlano = ((internData.valorDesconto * 100) / Number(internData.valorCurso)).toFixed(2)
            } else {
                internData.valorDesconto = (Number(internData.valorCurso) * (internData.descontoPlano/100)).toFixed(2)
            }

            if (elemId === 'valorAcrescimo') {
                internData.acrescimoPlano = ((internData.valorAcrescimo * 100) / Number(internData.valorCurso)).toFixed(2)
            } else {
                internData.valorAcrescimo = (Number(internData.valorCurso) * (internData.acrescimoPlano/100)).toFixed(2)
            }
            try {
                document.getElementById('quandoAplicar').innerHTML = '';
                console.log(Number(internData.numeroMaximoParcelasPlano))
                for (let i = 0; i < Number(internData.numeroMaximoParcelasPlano); i++) {
                    document.getElementById('quandoAplicar').innerHTML += `<option value="${i}">Parcela ${i + 1}</option>`
                    
                }
            } catch (error) {
                console.log(error)
            }
            
            
            internData.valorFinal = (Number(internData.valorCurso) + (internData.valorAcrescimo - internData.valorDesconto)).toFixed(2)
            setRows([])
            let saldo = internData.valorCurso
            let saldoAcrescimo = internData.valorAcrescimo
            let saldoDesconto = internData.valorDesconto
            let contadorParcelas = internData.numeroMaximoParcelasPlano
            let somaParcelas = 0
            let valorParcelaGlobal = 0
            let internRows = []
            for (let parcela = 0; parcela < Number(internData.numeroMaximoParcelasPlano); parcela++) {
                let row = {}
                if (internData.hasOwnProperty('distribuirAcrescimosEDescontos') && internData.distribuirAcrescimosEDescontos === 'on') {
                    
                    
                    let acrescimoParcela 
                    let descontoParcela 
                    let valorParcela
                    valorParcelaGlobal = parcela === 0 ? parseFloat(saldo / contadorParcelas).toFixed(2) : valorParcelaGlobal
                    if (parcela >= internData.quandoAplicar) {
                        // parcela == internData.quandoAplicar ? saldo = internData.valorFinal - somaParcelas : null
                        valorParcelaGlobal = parcela === internData.quandoAplicar ?  parseFloat(saldo / contadorParcelas).toFixed(2) : valorParcelaGlobal
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
                    
                    console.log(internPlan)
                    row = internData.quandoAplicar !== undefined ? {id: parcela, col1: `Parcela ${parcela + 1}`, col2: `R$${valorParcela}`, col3: ` ${acrescimoParcela !== 0 || acrescimoParcela !== '' ? '+ R$' + acrescimoParcela : ''}`, col4: ` ${descontoParcela !== 0 || descontoParcela !== '' ? '- R$' + descontoParcela : ''}`, col5: `R$${(Number(valorParcela) + (acrescimoParcela - descontoParcela)).toFixed(2)}`} : row.id = {id: parcela}
                    console.log(row)
                    somaParcelas += (Number(valorParcela) + (acrescimoParcela - descontoParcela))
                } else {
                    saldo = parcela === 0 ? internData.valorFinal : saldo
                        row = {id: parcela, col1: `Parcela ${parcela + 1}`, col2: `R$${parseFloat(internData.valorFinal / internData.numeroMaximoParcelasPlano).toFixed(2)}`, col3: '0', col4: '0', col5: `R$${parseFloat(internData.valorFinal / internData.numeroMaximoParcelasPlano).toFixed(2)}`}
                    // saldo = saldo - parseFloat(internData.valorFinal / internData.numeroMaximoParcelasPlano).toFixed(2)
                    somaParcelas += Number(parseFloat(internData.valorFinal / internData.numeroMaximoParcelasPlano))
                }
                saldo = (parcela >= internData.quandoAplicar ? internData.valorFinal : internData.valorCurso) - somaParcelas
                console.log(saldo)
                internRows.push(row)
                console.log(internRows)
                // addParcela(`Saldo: R$${saldo}`)
                contadorParcelas--
            }
            internRows.push({id: 999999, col1: "Total", col5: `R$${somaParcelas.toFixed(2)}`})
            setRows(internRows)
            // addParcela(`Total: R$${somaParcelas.toFixed(2)}`)

        } catch (error) {
            console.log(error)
        }
            
            internData.codCurso = courseId;
            console.log(internData)
            setCalculatedData(internData)
            try {
                for (const id in internData) {
                    if (Object.hasOwnProperty.call(internData, id)) {
                        const value = internData[id];
                        document.getElementById(id).value = value;
                    }
                }
            } catch (error) {
                console.log(error)
            }
            
            console.log(internData)
            
            // if (planChosen) {
            //     console.log(planChosen)
            //   document.getElementById('vencimento').value = planChosen.vencimento;
            // }

            if (save) {
                
                form.requestSubmit()
                 
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

      const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(e)
        try {
            await coursesRef.child(courseId).child('planos').child(planId).set(calculatedData);
            enqueueSnackbar('Dados salvos!', {variant: 'success'});
            setOpenDialog(false)
        } catch (error) {
            enqueueSnackbar(error.message, {variant: 'error'});
        }
        
        
        
  
        
      }

      const daysOptions = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]

      
    return(
        <Fragment>
            {openDialogError && <ErrorDialog onClose={() => {setOpenDialogError(false)}} isOpen={true} title={openDialogError.title} message={openDialogError.message} /> }
            <FullScreenDialog 
                isOpen={isOpen}
                onClose={() => {
                    setCalculatedData();
                    setOpenDialog(false);
                }}
                onSave={() => {
                    contractHandler('', null, true);
                }}
                title={"Configurar plano"}
                saveButton={"Salvar"}
                
            >
                {!calculatedData ? (
                <div style={{width: '100%'}}>
                    <LinearProgress />
                </div>
                
                ) : (<>
                <Container>
                    <form onSubmit={handleSubmit} onBlur={(e) => {contractHandler(e.target.id)}} id="contractForm" autoComplete="off">
                        <h1>Dados do Curso:</h1>
                        <Grid
                            justifyContent="flex-start"   
                            container
                            direction="row"
                            spacing={2}
                        >
                            
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" InputLabelProps={{shrink: true,}} InputProps={{readOnly: true}} autoComplete="off" required label="Nome do curso" type="text" id="nomeCursoAdd" name="nomeCursoAdd" value={data.nomeCurso} aria-describedby="my-helper-text" />
                                    <FormHelperText>Identificação que aparece nos boletins e nos demais documentos emitidos pelo sistema. </FormHelperText>
                                </FormControl>
                                
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputProps={{readOnly: true}} InputLabelProps={{shrink: true,}} label="Código do curso" type="text" id="codigoCursoAdd" name="codigoCursoAdd" aria-describedby="my-helper-text" value={data.codCurso} />
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
                                    <TextField variant="filled" autoComplete="off"   required label="Nome do plano" type="text" id="nomePlano" name="nomePlano" aria-describedby="my-helper-text" defaultValue={calculatedData.nomePlano} />
                                    <FormHelperText>Este é o nome de identificação do plano para a secretaria. </FormHelperText>
                                </FormControl>
                                
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off"    label="Valor Integral do Curso" type="text" id="valorCurso" name="valorCurso" aria-describedby="my-helper-text" defaultValue={calculatedData.valorCurso} />
                                    <FormHelperText>Valor integral do curso sem descontos.</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off"   label="Desconto (%)" type="text" id="descontoPlano" name="descontoPlano" aria-describedby="my-helper-text" defaultValue={calculatedData.descontoPlano} />
                                    <FormHelperText>Desconto sobre o valor integral.</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off"   label="Valor do desconto" type="text" id="valorDesconto" name="valorDesconto" defaultValue={calculatedData.valorDesconto} aria-describedby="my-helper-text" />
                                    
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off"   label="Acréscimo (%)" type="text" id="acrescimoPlano" name="acrescimoPlano" aria-describedby="my-helper-text" defaultValue={calculatedData.acrescimoPlano}/>
                                    <FormHelperText>Acréscimo sobre o valor integral.</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off"   label="Valor do acréscimo" type="text" id="valorAcrescimo" name="valorAcrescimo" aria-describedby="my-helper-text" defaultValue={calculatedData.valorAcrescimo} />
                                    
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: true,}} InputProps={{readOnly: true}}  label="Valor integral final" type="text" id="valorFinal" name="valorFinal" aria-describedby="my-helper-text" defaultValue={calculatedData.valorFinal}/>
                                    
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
                                    <TextField variant="filled" autoComplete="off" InputLabelProps={{shrink: true,}} required label="Nº máx. de parcelas" type="text" id="numeroMaximoParcelasPlano" name="numeroMaximoParcelasPlano" aria-describedby="my-helper-text" defaultValue={calculatedData.numeroMaximoParcelasPlano} />
                                    <FormHelperText>O número máximo de parcelas para este plano.</FormHelperText>
                                    <FormControlLabel
                                        control={<Checkbox value={'on'} defaultChecked={calculatedData.distribuirAcrescimosEDescontos === "on" ? true : false} name="distribuirAcrescimosEDescontos" id="distribuirAcrescimosEDescontos" inputProps={{
                                            name: 'distribuirAcrescimosEDescontos',
                                            id: 'distribuirAcrescimosEDescontos',
                                        }} onChange={(e) => contractHandler(e.target.id)} />}
                                        label="Distribuir Descontos e Acréscimos a partir da parcela:"
                                    />
                                    <Select
                                    label="Aplicar a partir da:"
                                    native
                                    required
                                    disabled={calculatedData.distribuirAcrescimosEDescontos === "on" ? false : true}
                                    defaultValue={calculatedData.quandoAplicar}
                                    onChange={(e) => contractHandler(e.target.id)}
                                    fullWidth
                                    inputProps={{
                                        name: 'quandoAplicar',
                                        id: 'quandoAplicar',
                                    }}
                                    >
                                        {/* {() => {
                                            let Option = (<option hidden>Escolha a parcela...</option>)
                                            for (let i = 0; i <= calculatedData.numeroMaximoParcelasPlano; i++) {
                                                Option += (<option hidden key={i} value={i}>Parcela {i}</option>)
                                                
                                            }
                                            return Option;
                                        }} */}
                                    
                                    </Select>
                                </FormControl>
                                    
                                
                                
                            </Grid>
                            <Grid item>
                                <FormControl className={classes.fields}>
                                    <CrudTable rows={rows} columns={columns} rowHeight={25} disableColumnMenu disableDensitySelector disableColumnSelector disableColumnFilter hideFooter />
                                    <FormHelperText>Esta é apenas a simulação de parcelamento no contrato. Esta simulação, é a distribuição máxima de parcelas para este plano. </FormHelperText>
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
                            {plan && <FormControl component="fieldset">
                            <FormLabel component="legend">Configuração do vencimento</FormLabel>
                            <RadioGroup name="vencimento" id="vencimento" onChange={() => contractHandler()} defaultValue={plan && plan.vencimento}>
                                <FormControlLabel value="false" control={<Radio required />} label="Permitir escolha do dia no ato da matrícula" />
                                <FormControlLabel value="true" control={<Radio required />} label="Definir dias específicos para o vencimento" />
                                
                            </RadioGroup>
                            </FormControl>}
                            
                            
                            </Grid>

                            <Grid item>
                            {(calculatedData && calculatedData.vencimento === 'true') && (
                                <>
                                {/* <FormControl variant="filled">
                                    <InputLabel htmlFor="filled-age-native-simple">Escolha um dia</InputLabel>
                                    <Select
                                        required
                                        native
                                        value={state.value}
                                        onChange={handleChangeDay}
                                        
                                    >
                                        {!data.diasDeVencimento && (daysOptions.map(dayOpt => <option value={dayOpt}>{dayOpt}</option>))}
                                        
                                    </Select>
                                    <FormHelperText>Escolha o dia de vencimento do boleto/carnê. </FormHelperText>
                                </FormControl> */}

                                <FormControl className={classes.formControl}>
                                <InputLabel id="demo-mutiple-checkbox-label">Dias de vencimento</InputLabel>
                                <Select
                                labelId="demo-mutiple-checkbox-label"
                                
                                inputProps={{
                                    name: 'diasDeVencimento',
                                    id: 'diasDeVencimento',
                                }}
                                required
                                multiple
                                // inputProps={{
                                //     name: 'diasDeVencimento',
                                //     id: 'diasDeVencimento',
                                // }}
                                //onChange={handleChange}
                                input={<Input />}
                                defaultValue={calculatedData.diasDeVencimento}
                                renderValue={(selected) => selected.join(', ')}
                                variant="filled"
                                MenuProps={MenuProps}
                                >
                                {daysOptions.map((dayOpt) => (
                                    <MenuItem key={dayOpt} value={dayOpt}>
                                        <Checkbox checked={calculatedData.hasOwnProperty('diasDeVencimento') && calculatedData.diasDeVencimento.indexOf(dayOpt.toString()) !== -1} />
                                        <ListItemText primary={dayOpt} />
                                    </MenuItem>
                                ))}
                                </Select>
                                <FormHelperText> Escolha os dias que deseja permitir o vencimento. </FormHelperText>
                                </FormControl>
                                </>
                            ) }
                            </Grid>
                            
                            
                            <Grid item>
                                {plan && (
                                <FormControl className={classes.fields}> 
                                    <TextField variant="filled" autoComplete="off" required label="Informações e avisos" defaultValue={plan && plan.descricaoPlano} type="text" id="descricaoPlano" name="descricaoPlano" aria-describedby="my-helper-text" />
                                    <FormHelperText> Informações e avisos para serem gerados no boleto. </FormHelperText>
                                </FormControl>
                                )}
                            </Grid>
                            
                                
                            
                        </Grid>
                    </form>
                
                
                </Container>
                </>)}
            </FullScreenDialog>
            
        </Fragment>
    );
}

export default PlanEditor;