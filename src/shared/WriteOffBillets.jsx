import { Backdrop, Button, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles, TextField } from "@material-ui/core";
import { Fragment, useEffect, useState } from "react";
import { billetsDocsRef, schoolInfoRef, studentsRef } from "../services/databaseRefs";
import { database, functions } from "../services/firebase";

const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));

const WriteOffBillets = ({docId}) => {
    const classes = useStyles();

    const [doc, setDoc] = useState();
    const [localDocId, setLocalDocId] = useState(docId);
    const [dialog, setDialog] = useState(false);
    const [infoSchool, setInfoSchool] = useState();
    const [student, setStudent] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (localDocId) {
            getData(docId)
        } else {
            setDialog(true)
        }
    }, [docId])

    const getData = async () => {
        setLoading(true)
        const localInfoSchool = (await schoolInfoRef.once('value')).val()
        setInfoSchool(localInfoSchool);

        
        let localDoc
        const snapshot = await billetsDocsRef.orderByChild('numeroDoc').equalTo(localDocId).once('value')
        for (const docKey in snapshot.val()) {
            if (Object.hasOwnProperty.call(snapshot.val(), docKey)) {
                localDoc = snapshot.val()[docKey];
                setDoc(localDoc)
            }
        }
        console.log(localDoc)
        const studentInfo = (await studentsRef.child(localDoc.matricula).once('value')).val()
        setStudent(studentInfo)
        setLoading(false)
        createBillet(localDoc.parcelaAtual, localDoc.numDeParcelas, localDoc.vencimento, localDoc.numeroDoc, localDoc.valorDoc, localDoc.descontos, localDoc.acrescimos, localDoc.totalCobrado, localDoc.dataProcessamento, localDoc.informacoes, studentInfo, localInfoSchool)
        
    }

    function createBillet(parcelaAtual, numDeParcelas, vencimento, numeroDoc, valorDoc, descontos, acrescimos, totalCobrado, dataProcessamento, informacoes, student, infoSchool) {
            console.log(student)
            setLoading(true)
        // bol++
        // if (bol > 3 && pag >= 1) {
        //     pag++
        //     bol = 0
        //     document.getElementById('livro').innerHTML += `
        //     <div class="page">
        //         <div class="subpage">
        //             <div id="boletos${pag}"></div>
        //         </div>
        //     </div>
        //     `
        // }
        let boletos = document.getElementById('boletos')
        boletos.innerHTML = ""
        let gera = functions.httpsCallable('geraPix')
        return gera({valor: totalCobrado, descricao: `DOC${numeroDoc}`}).then(function(lineCode) {
        
            setLoading(false);
            //divQr.src = lineCode.data;
            console.log(lineCode)
            //const code = new QRCode(divQr, { text: lineCode.data, width: 100, height: 100 });
            // qrCodesArray.push({qrcode: lineCode.data, numeroDoc: numeroDoc})
            
            boletos.innerHTML += `
        <table style="height: 4.8cm; width: 100%; border-collapse: collapse; border-style: solid; margin-top: 18px;" border="1" >
            <tbody>
                <tr style="height: 10px; border-style: none;">
                    <td style="width: 4.97079%; height: 179px;" rowspan="9">&nbsp;</td>
                    <td style="width: 22.9045%; height: 20px; text-align: center;" rowspan="2">
                    <table style="height: 100%; width: 96.3454%; border-collapse: collapse; border-style: hidden;" border="1">
                    <tbody>
                    <tr style="height: 18px;">
                        <td style="width: 38.8889%; height: 33px;" rowspan="2"><img src="${infoSchool.logoEscola}" alt="Logo" width="50" height="50" /></td>
                        <td style="width: 189.264%; height: 18px; border-left: hidden;">
                            <section style="font-size: 8pt; text-align: center;">
                                Parcela
                            </section>
                            
                            <section style="font-size: x-small; text-align: center;">
                                ${parcelaAtual}/${numDeParcelas}
                            </section>
                        </td>
                    </tr>
                    <tr style="height: 15px;">
                    <td style="width: 189.264%; height: 15px; border-left: hidden;">
                            <section style="font-size: 8pt; text-align: center;">
                                Vencimento
                            </section>
                            
                            <section style="font-size: x-small; text-align: center;">
                                ${vencimento}
                            </section>
                    </td>
                </tr>
                </tbody>
                </table>
                </td>
                <td style="width: 7.60226%; text-align: center; height: 20px; border-left: dotted;" rowspan="2"><img src="${infoSchool.logoEscola}" alt="Logo" width="50" height="50" /></td>
                <td style="height: 20px; width: 43.8475%;" colspan="3" rowspan="2">
                    <section style="font-size: 8pt;">
                        &nbsp;<b>Cedente</b>
                    </section>
                    <section style="font-size: x-small;">
                        &nbsp;${infoSchool.dadosBasicos.nomeEscola}
                    </section>
                    <section style="font-size: x-small;">
                        &nbsp;${infoSchool.dadosBasicos.cnpjEscola}
                    </section>
                    <section style="font-size: x-small;">
                        &nbsp;${infoSchool.dadosBasicos.enderecoEscola}
                    </section>
                    <section style="font-size: x-small;">
                        &nbsp;${infoSchool.dadosBasicos.telefoneEscola}
                    </section>
                </td>
                <td style="width: 64.5223%; height: 10px; ">
                    <section style="font-size: 8pt; text-align: center;">
                        Parcela
                    </section>
                    
                    <section style="font-size: x-small; text-align: center;">
                        ${parcelaAtual}/${numDeParcelas}
                    </section>    
                </td>
                </tr>
                <tr style="height: 10px;">
                <td style="width: 64.5223%; height: 10px;">
                    <section style="font-size: 8pt; text-align: center; ">
                        Vencimento
                    </section>
                    
                    <section style="font-size: x-small; text-align: center;">
                        ${vencimento}
                    </section>    
                </td>
                </tr>
                <tr style="height: 33px;">
                <td style="width: 22.9045%; height: 33px; text-align: start;">
                    <section style="font-size: 8pt; text-align: center;">
                        Documento
                    </section>
                    
                    <section style="font-size: x-small; width: 100%; text-align: center;">
                        ${numeroDoc}
                    </section>    
                </td>
                <td style="width: 19.286%; height: 33px; border-left: dotted;" colspan="2">
                    <section style="font-size: 8pt; text-align: center;">
                        Documento
                    </section>
                    
                    <section style="font-size: x-small; width: 100%; text-align: center;">
                        ${numeroDoc}
                    </section>        
                </td>
                <td style="width: 14.2301%; height: 33px;">
                    <section style="font-size: 8pt; text-align: center;">
                        Espécie
                    </section>
                    
                    <section style="font-size: x-small; width: 100%; text-align: center;">
                        R$
                    </section>        
                </td>
                <td style="width: 17.9337%; height: 33px;">
                    <section style="font-size: 8pt; text-align: center;">
                        Processamento
                    </section>
                    
                    <section style="font-size: x-small; text-align: center;">
                        ${dataProcessamento}
                    </section>    
                </td>
                <td style="width: 64.5223%; height: 33px;">
                    <section style="font-size: 8pt; text-align: center;">
                        (=) Valor do documento
                    </section>
                    
                    <section style="font-size: x-small; width: 100%; text-align: center;">
                        R$${valorDoc}
                    </section>        
                </td>
                </tr>
                <tr style="height: 24px;">
                <td style="width: 22.9045%; height: 24px;">
                    <section style="font-size: 8pt; text-align: center;">
                        (=) Valor do documento
                    </section>
                    
                    <section style="font-size: x-small; width: 100%; text-align: center;">
                        R$${valorDoc}
                    </section>          
                </td>
                <td style="width: 51.4498%; height: 88px; border-left: dotted;" colspan="3" rowspan="4">
                    <section style="font-size: 8pt;">
                        &nbsp;Informações
                    </section>
                    
                    <section style="font-size: x-small;">
                        &nbsp;
                    </section>
                    
                    
                <p style="font-size: x-small; width: 100%; text-align: start;">&nbsp;${informacoes}</p>
                </td>
                <td style="width: 17.9337%; height: 88px;" rowspan="4" colspan="1">
                    <section style="font-size: 8pt; text-align: center;">
                        Pague via PIX
                    </section>
                    <section style="font-size: 8pt; text-align: center;">
                        <img id="qrcode${numeroDoc}" style="width: 80px;" src="${lineCode.data}">
                    </section>
                    
                       
                </td>
                <td style="width: 64.5223%; height: 24px;">
                    <section style="font-size: 8pt; text-align: center;">
                        (-) Descontos
                    </section>
                    
                    <section style="font-size: x-small; width: 100%; text-align: center;">
                        ${descontos}
                    </section>          
                </td>
                </tr>
                <tr style="height: 22px;">
                    <td style="width: 22.9045%; height: 22px;">
                        <section style="font-size: 8pt; text-align: center;">
                            (-) Descontos
                        </section>
                        
                        <section style="font-size: x-small; width: 100%; text-align: center;">
                            R$${descontos}
                        </section>    
                    </td>
                    <td style="width: 64.5223%; height: 22px;">
                        <section style="font-size: 8pt; text-align: center;">
                            (+) Acréscimos
                        </section>
                        
                        <section style="font-size: x-small; width: 100%; text-align: center;">
                            R$${acrescimos}
                        </section>    
                    </td>
                </tr>
                <tr style="height: 21px;">
                    <td style="width: 22.9045%; height: 21px;">
                        <section style="font-size: 8pt; text-align: center;">
                            (+) Acréscimos
                        </section>
                        
                        <section style="font-size: x-small; width: 100%; text-align: center;">
                            R$${acrescimos}
                        </section>     
                    </td>
                    <td style="width: 64.5223%; height: 21px;">
                        <section style="font-size: 8pt; text-align: center;">
                            (=) Total Cobrado
                        </section>
                        
                        <section style="font-size: x-small; width: 100%; text-align: center;">
                            R$${totalCobrado}
                        </section>     
                    </td>
                </tr>
                <tr style="height: 21px;">
                    <td style="width: 22.9045%; height: 21px;">
                        <section style="font-size: 8pt; text-align: center;">
                            (=) Total Cobrado
                        </section>
                        
                        <section style="font-size: x-small; width: 100%; text-align: center;">
                            R$${totalCobrado}
                        </section>    
                    </td>
                    <td style="width: 64.5223%; height: 21px;">
                        <section style="font-size: 8pt; text-align: center;">
                            Data de Pagamento:
                        </section>
                        
                        <section style="font-size: small; width: 100%; text-align: center;">
                            ____/____/______
                        </section>
                    </td>
                </tr>
                <tr style="height: 20px;">
                    <td style="width: 22.9045%; height: 20px;" rowspan="2">
                        <section style="font-size: 8pt; text-align: center;">
                            Data de Pagamento:
                        </section>
                        
                        <section style="font-size: small; width: 100%; text-align: center;">
                            ____/____/______
                        </section>    
                    </td>
                    <td style="width: 51.4498%; height: 38px; border-left: dotted;" colspan="4" rowspan="2">
                        <section style="font-size: 8pt;">
                            &nbsp;<b>Informações do aluno nos cards abaixo</b>
                        </section>
                        
                        <section style="font-size: x-small;">
                            
                        </section>
                    </td>
                    <td style="width: 64.5223%; height: 38px;" rowspan="2">
                        <section style="font-size: 8pt; text-align: center;">
                            Assinatura:
                        </section>
                        
                        <section style="font-size: small; width: 100%; text-align: center;">
                           &nbsp;
                        </section>    
                    </td>
                </tr>
            </tbody>
            </table>
            `
            return ;
        })
        
        

       
    }

    const handleChangeDocId = (e) => {
        
        getData()
        setDialog(false)
    } 

    return (
        <Fragment>
            <Backdrop className={classes.backdrop} open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
                <Dialog open={dialog} onClose={() => setDialog(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Digite o número do documento do boleto</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Digite o número do Documento que se encontra em cada parcela para que o sistema encontre o débito no banco de dados
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Número do Documento"
                        type="number"
                        fullWidth
                        value={localDocId}
                        onChange={(e) => setLocalDocId(Number(e.target.value))}
                        autoComplete={false}
                        
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => setDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleChangeDocId} color="primary">
                        Procurar
                    </Button>
                    </DialogActions>
                </Dialog>
                <Container>
                    <div id="boletos">

                    </div>
                </Container>
                
        </Fragment>
    );
}
 
export default WriteOffBillets;