import { Button, FilledInput, FormControl, FormHelperText, Grid, InputAdornment, InputLabel, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { daysCodesRef } from "../../../../services/databaseRefs";

const DaysCodeSet = () => {

    const [values, setValues] = useState(['', '', '', '', '', '', '']);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    useEffect(() => {
        async function getData() {
            let valuesArray = (await daysCodesRef.once('value')).val()
            setValues(valuesArray);
        }
        getData()
    }, [])

    const handleChange = (prop, event) => {
        let valuesArray = values.slice()
        valuesArray[prop] = event.target.value;
        setValues(valuesArray);
        console.log(valuesArray)
    };

    const handleSendData = async () => {

        try {
            await daysCodesRef.set(values)
            enqueueSnackbar('Dados salvos!')
        } catch (error) {
            console.log(error)
            enqueueSnackbar(error.message, {variant: 'error'})
        }
        
    }

    const daysOfTheWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

    return (
        <Fragment>
            <div>
                <Grid
                    justifyContent="flex-start"   
                    container
                    direction="row"
                    spacing={2}
                >
                    
                        {values.map((value, i) => {
                            return (
                                <Grid item>
                                    <TextField
                                        style={{width: '200px'}}
                                        label="Código para:"
                                        id={"abvr" + i}
                                        value={values[i]}
                                        onChange={(e) => {handleChange(i, e)}}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">{daysOfTheWeek[i]}</InputAdornment>,
                                        }}
                                        variant="filled"
                                    />
                                </Grid>
                            );
                        })}
                    
                    
                </Grid>
                <br />
                <Button onClick={handleSendData} fullWidth variant="contained" color="primary">Salvar e aplicar</Button>
                
            </div>
        </Fragment>
    );
}
 
export default DaysCodeSet;