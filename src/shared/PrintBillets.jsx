import { Backdrop, CircularProgress, Dialog, DialogContent, DialogActions, Button, DialogTitle } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Fragment, useEffect, useState } from "react";
import { database, functions } from "../services/firebase";


const useStyles = makeStyles((theme) =>({
    backdrop: {
        zIndex: 9999999999999,
        color: '#fff',
    },
}))

const PrintBillets = ({studentId, contractId, open, onClose}) => {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);

    async function segundaViaBoletos(matricula, codContrato) {
        setLoading(true)
        let alunoRef = database.ref('sistemaEscolar/alunos/' + matricula + '/')
        let alunosDesativadosRef = database.ref('sistemaEscolar/alunosDesativados')
        let contratoRef = database.ref('sistemaEscolar/infoEscola/contratos').child(codContrato)
        let docsBoletosRef = database.ref('sistemaEscolar/docsBoletos')
        let infoEscola = await database.ref('sistemaEscolar/infoEscola').once('value')
        let dadosEscola = infoEscola.val()
        console.log(dadosEscola)
        let dadosAluno = await alunoRef.once('value')
        dadosAluno = dadosAluno.exists() ? dadosAluno : await alunosDesativadosRef.child(matricula + '/dadosAluno').once('value')
        let aluno = dadosAluno.val()
        let contratos = aluno.contratos
        let contrato = contratos[contratos.indexOf(codContrato)]
        let data = dadosEscola.contratos[codContrato].contratoConfigurado
        let plano = dadosEscola.contratos[codContrato].planoOriginal
        let mesInicio = Number(data['ano-mes'].split('-')[1])
        let anoInicio = Number(data['ano-mes'].split('-')[0])
        console.log(codContrato)
        let docsSistema = dadosEscola.docsBoletos
        let qtdeDocs = 0

        let timestampF = functions.httpsCallable('timestamp')
        let timestamp = await timestampF()
        console.log(timestamp)
        var now = new Date(timestamp.data.timestamp._seconds * 1000)
        console.log(now)
        var dataProcessamento = `${Number(now.getDate()) <= 9 ? '0' + now.getDate() : now.getDate()}/${Number(now.getMonth()) + 1 <= 9 ? '0' + (Number(now.getMonth()) + 1) : now.getMonth()}/${now.getFullYear()}`
        for (const key in docsSistema) {
            if (Object.hasOwnProperty.call(docsSistema, key)) {
                qtdeDocs++
                
            }
        }
        let pag = 1
        let bol = 0


        try {
            
            let docsBoletosGerados = await contratoRef.child('docsBoletos').once('value')
            let numerosDeDoc = docsBoletosGerados.val()
            if (numerosDeDoc == null) {
                setLoading(false)
                window.alert('Não foram gerados boletos para este contrato ainda.')
                limpa()
            }
            let docsFiltrados = await docsBoletosRef.orderByChild('numeroDoc').startAt(numerosDeDoc[0]).endAt(numerosDeDoc[numerosDeDoc.length - 1]).once('value')
            let docsDoContrato = docsFiltrados.val()
            console.log(docsDoContrato)
            console.log(numerosDeDoc)

            limpa()

            for (const key in docsDoContrato) {
                if (Object.hasOwnProperty.call(docsDoContrato, key)) {
                    const doc = docsDoContrato[key];
                    await addParcela(doc.parcelaAtual, doc.numDeParcelas, doc.vencimento, doc.numeroDoc, doc.valorDoc, doc.descontos, doc.acrescimos, doc.totalCobrado, doc.dataProcessamento, doc.informacoes)
                }
            }
            
            setLoading(false)
            


        } catch (error) {
            console.log(error)
        }

        function limpa() {
            document.getElementById('livro').innerHTML = `
            <div class="page">
                <div class="subpage">
                    <div id="boletos1">
                        <table style="height: 4.8cm; width: 100%; border-collapse: collapse; border-style: solid; margin-top: 18px;" border="1" >
                        <tbody>
                            <tr style="text-align: center;">
                                <td style="width: 4.97079%; height: 241px;" rowspan="9">&nbsp;</td>
                                <td style="background-color: lightgray; text-align: center; border-style: solid;">
                                    
                                    <img src="${dadosEscola.logoEscola}" alt="Logo" width="140" height="140" />
                                        
                                    
                                    
                                    <tr style="background-color: ${dadosEscola.dadosBasicos.corSecundariaEscola}; height: 12px;">
                                        <td style="color: ${dadosEscola.dadosBasicos.corPrimariaEscola};"></td>
                                    </tr>
                                    <tr style="background-color: ${dadosEscola.dadosBasicos.corPrimariaEscola}; height: 43px;">
                                        <td style="background-color: ${dadosEscola.dadosBasicos.corPrimariaEscola};"></td>
                                    </tr>
                                    
                                </td>    
                            </tr>
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            `
        }

        function addParcela(parcelaAtual, numDeParcelas, vencimento, numeroDoc, valorDoc, descontos, acrescimos, totalCobrado, dataProcessamento, informacoes) {
            
            bol++
            if (bol > 3 && pag >= 1) {
                pag++
                bol = 0
                document.getElementById('livro').innerHTML += `
                <div class="page">
                    <div class="subpage">
                        <div id="boletos${pag}"></div>
                    </div>
                </div>
                `
            }
            let boletos = document.getElementById('boletos' + pag)
            let gera = functions.httpsCallable('geraPix')
            return gera({valor: totalCobrado, descricao: `DOC${numeroDoc}`}).then(function(lineCode) {
            
                
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
                            <td style="width: 38.8889%; height: 33px;" rowspan="2"><img src="${dadosEscola.logoEscola}" alt="Logo" width="30" height="30" /></td>
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
                    <td style="width: 7.60226%; text-align: center; height: 20px; border-left: dotted;" rowspan="2"><img src="${dadosEscola.logoEscola}" alt="Logo" width="30" height="30" /></td>
                    <td style="height: 20px; width: 43.8475%;" colspan="3" rowspan="2">
                        <section style="font-size: 8pt;">
                            &nbsp;<b>Cedente</b>
                        </section>
                        <section style="font-size: x-small;">
                            &nbsp;${dadosEscola.dadosBasicos.nomeEscola}
                        </section>
                        <section style="font-size: x-small;">
                            &nbsp;${dadosEscola.dadosBasicos.cnpjEscola}
                        </section>
                        <section style="font-size: x-small;">
                            &nbsp;${dadosEscola.dadosBasicos.enderecoEscola}
                        </section>
                        <section style="font-size: x-small;">
                            &nbsp;${dadosEscola.dadosBasicos.telefoneEscola}
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
                            &nbsp;${data.nomeCursoAdd}
                        </section>
                        
                        
                    <p style="font-size: x-small; width: 100%; text-align: start;">&nbsp;${data.descricaoPlano}</p>
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
                                &nbsp;<b>Sacado</b>
                            </section>
                            
                            <section style="font-size: x-small;">
                                &nbsp;${aluno.nomeAluno}&nbsp;&nbsp;&nbsp; CPF Nº: ${aluno.cpfAluno}<br>
                                &nbsp;${aluno.enderecoAluno}, ${aluno.numeroAluno}, ${aluno.bairroAluno}, ${aluno.cidadeAluno}-${aluno.estadoAluno}
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

        

    }

    useEffect(() => {
        setTimeout(() => {
            document.getElementById('livro').innerHTML = `
        <div class="page">
                        <div class="subpage">
                            <div id="boletos1">
                                <table style="height: 179px; width: 100%; border-collapse: collapse; border-style: solid;" border="1">
                                    <tbody>
                                        <tr style="height: 10px; border-style: none;">
                                            <td style="width: 4.97079%; height: 179px;" rowspan="9">&nbsp;</td>
                                            <td style="width: 22.9045%; height: 20px; text-align: center;" rowspan="2">
                                            <table style="height: 100%; width: 96.3454%; border-collapse: collapse; border-style: hidden;" border="1">
                                            <tbody>
                                            <tr style="height: 18px;">
                                                <td style="width: 38.8889%; height: 33px;" rowspan="2"><img src="https://firebasestorage.googleapis.com/v0/b/projetoxagencia.appspot.com/o/sistemaEscolar%2FinfoEscola%2Flogo%20projetox?alt=media&token=1297d858-4b74-4b35-a7c7-b96cae1edd2c" alt="Logo" width="30" height="30" /></td>
                                                <td style="width: 189.264%; height: 18px; border-left: hidden;">
                                                    <section style="font-size: 8pt;">
                                                        Parcela
                                                    </section>
                                                    
                                                    <section style="font-size: x-small;">
                                                        1/6
                                                    </section>
                                                </td>
                                            </tr>
                                            <tr style="height: 15px;">
                                            <td style="width: 189.264%; height: 15px; border-left: hidden;">venci</td>
                                        </tr>
                                        </tbody>
                                        </table>
                                        </td>
                                        <td style="width: 7.60226%; text-align: center; height: 20px; border-left: dotted;" rowspan="2"><img src="https://firebasestorage.googleapis.com/v0/b/projetoxagencia.appspot.com/o/sistemaEscolar%2FinfoEscola%2Flogo%20projetox?alt=media&token=1297d858-4b74-4b35-a7c7-b96cae1edd2c" alt="Logo" width="30" height="30" /></td>
                                        <td style="height: 20px; width: 43.8475%;" colspan="3" rowspan="2">Cedente</td>
                                        <td style="width: 64.5223%; height: 10px;">parcela</td>
                                        </tr>
                                        <tr style="height: 10px;">
                                        <td style="width: 64.5223%; height: 10px;">vencimento</td>
                                        </tr>
                                        <tr style="height: 33px;">
                                        <td style="width: 22.9045%; height: 33px;">documento</td>
                                        <td style="width: 19.286%; height: 33px; border-left: dotted;" colspan="2">documento</td>
                                        <td style="width: 14.2301%; height: 33px;">especie</td>
                                        <td style="width: 17.9337%; height: 33px;">processame</td>
                                        <td style="width: 64.5223%; height: 33px;">valor doc</td>
                                        </tr>
                                        <tr style="height: 24px;">
                                        <td style="width: 22.9045%; height: 24px;">valor doc</td>
                                        <td style="width: 51.4498%; height: 88px; border-left: dotted;" colspan="4" rowspan="4">
                                        <p>dasd</p>
                                        <hr />
                                        <p>&nbsp;</p>
                                        </td>
                                        <td style="width: 64.5223%; height: 24px;">descontos</td>
                                        </tr>
                                        <tr style="height: 22px;">
                                            <td style="width: 22.9045%; height: 22px;">descontos</td>
                                            <td style="width: 64.5223%; height: 22px;">acrescimos</td>
                                        </tr>
                                        <tr style="height: 21px;">
                                            <td style="width: 22.9045%; height: 21px;">acrescimos</td>
                                            <td style="width: 64.5223%; height: 21px;">total cobrado</td>
                                        </tr>
                                        <tr style="height: 21px;">
                                            <td style="width: 22.9045%; height: 21px;">total cobrado</td>
                                            <td style="width: 64.5223%; height: 21px;">data pagam</td>
                                        </tr>
                                        <tr style="height: 20px;">
                                            <td style="width: 22.9045%; height: 20px;" rowspan="2">data pagam</td>
                                            <td style="width: 51.4498%; height: 38px; border-left: dotted;" colspan="4" rowspan="2">Sacado</td>
                                            <td style="width: 64.5223%; height: 38px;" rowspan="2">assinatura</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
        `
        segundaViaBoletos(studentId, contractId)
        }, 0.5);
        
    }, [studentId, contractId])

    function handlePrint() {
        var divContents = document.getElementById("livro").innerHTML;
        var a = window.open('', '', );
        a.document.write('<html>');
        a.document.write('<body>');
        a.document.write(divContents);
        a.document.write('</body></html>');
        a.document.close();
        a.print();
    }

    function PrintElem() {
        let elem = 'livro'
        var mywindow = window.open('', 'PRINT', 'height=800,width=950');
        
        mywindow.document.write('<html><head><title>' + document.title  + '</title>');
        mywindow.document.write(`
            <style>
            body {
                -webkit-print-color-adjust: exact;
            }
            body {
                margin: 0;
                padding: 0;
                background-color: #FAFAFA;
                font: 12pt "Arial";
            }
            
            body {
                -webkit-print-color-adjust: exact;
            }
            
            * {
                box-sizing: border-box;
                -moz-box-sizing: border-box;
                line-height: 110%;
            }
            
            .page {
                width: 21cm;
                min-height: 29.7cm;
                padding: 0.3cm;
                margin: 0.3cm auto;
                border: 1px #D3D3D3 solid;
                border-radius: 5px;
                background: white;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
            }
            
            .subpage {
                padding: 0.5cm;
                height: 256mm;
                outline: 2cm #ffffff00 solid;
            }
            
            @page {
                size: A4;
                margin: 0;
            }
            
            @media print {
                .page {
                    margin: 0;
                    border: initial;
                    border-radius: initial;
                    width: initial;
                    min-height: initial;
                    box-shadow: initial;
                    background: initial;
                    page-break-after: always;
                }
                .actionButtons {
                    display: none !important;
                }
            }
            
            .actionButtons {
                width: 21cm;
                padding: 1cm;
                margin: 1cm auto;
            }
            </style>
        `)
        mywindow.document.write('</head><body > <div id="noprint" class="actionButtons" style="width: 100%; text-align: center; margin-top: 10px;"><button onclick="window.print()" style="align-self: center;" id="noprint">Imprimir/PDF</button></div>');
        //mywindow.document.write('<h1>' + document.title  + '</h1>');
        mywindow.document.write(document.getElementById(elem).innerHTML);
        mywindow.document.write('</body></html>');

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/
        
    
    //mywindow.close();

    return true;
}

    return (
        <Fragment>
            
            <Dialog open={open} fullScreen>
                <DialogTitle>Boleto do contrato{loading && <CircularProgress style={{float: 'right'}} color="inherit" />}</DialogTitle>
                <DialogContent>
                
                <div class="book" id="livro">
                    
                </div>
                </DialogContent>
                
                
                <DialogActions><Button id='noprint' onClick={() => PrintElem()} disabled={loading}>Imprimir/PDF {loading && <CircularProgress color="inherit" size={20} />}</Button><Button id='noprint' onClick={() => onClose(false)}>Fechar</Button></DialogActions>
            </Dialog>
            
        </Fragment>
    );
}
 
export default PrintBillets;