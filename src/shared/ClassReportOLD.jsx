import React, { useEffect, useState } from 'react';
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, makeStyles } from '@material-ui/core';
import { functions } from '../services/firebase';
import { classesRef, performanceGradesRef, schoolInfoRef } from '../services/databaseRefs';
import './ClassReportStylesOLD.css'

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: 9999999999999999999999999999999,
        color: '#fff',
    },
     
   }));

export default function ClassReportOLD({classCode, open, onClose}) {
    const classes = useStyles();
    const [loader, setLoader] = useState(false);
 
  const getData = async () => {
    let hash = window.location.hash;
    if (hash) {
        let servico = hash.split('?')[0].substring(1);
        let turma = hash.split('?')[1];
        let codHistorico = hash.split('?')[2];
        
        console.log(servico)
        switch (servico) {
            case 'diario':
                
                break;
            
            default:
                break;
        }
        
    } else {
        geraDiario(classCode)
    }
  }

  useEffect(() => {getData()}, [classCode])

  function timestamp(time) {
    document.getElementById('timestamp').innerText = time
}

function title(title) {
    let titleRow = document.getElementById('title')
    titleRow.innerHTML = `<td class="tg-wp8o" colspan="16"><span style="font-weight:bold">${title}</span></td>`
}

function infoSchool(info) {
    let infoSchoolRow = document.getElementById('infoSchool')
    infoSchoolRow.innerHTML = `
    <td class="tg-wp8o" colspan="16">${info.nomeEscola} | CNPJ: ${info.cnpjEscola} <br> ${info.enderecoEscola} - Telefone: ${info.telefoneEscola} - E-mail: ${info.emailEscola}</td>
    `
    
}

function infoDoc(info, curso) {
    const infoDocRow = document.getElementById('infoDoc')
    infoDocRow.innerHTML = `
        <td class="tg-sg5v" colspan="4">
            <b>Curso:</b><br>
            <b>Professor:</b><br>
            <b>Início e Fim previstos:</b>
        </td>
        <td class="tg-sg5v" colspan="4">
            ${curso}<br>
            ${info.professor[0].nome}<br>
            ${info.status.inicio.split('-').reverse().join('/')} - ${info.status.fim.split('T')[0].split('-').reverse().join('/')}
        </td>
        <td class="tg-sg5v" style="text-align: end;" colspan="6">
            <b>Turma:</b><br>
            <b>Período:</b><br>
            <b>Horário:</b>
        </td>
        <td class="tg-sg5v" colspan="2">
            ${info.codigoSala}<br>
            ${info.status.nomePeriodo}<br>
            ${info.hora.split('_').join(':')}h
        </td>
    `
}

function setRows(rows) {
    let rowsElem = document.getElementById('rows')
    rowsElem.innerHTML = ''

    let html = ''
    let cells
    rows.map((row) => {
        cells = ''
        row.map((cell) =>{ 
            cells += `<td class="tg-0lax" style="${cell.center && 'text-align: center;'}" colspan="${cell.size}">${cell.text}</td>`
        })
        html += `<tr>${cells}</tr>`
    })

    rowsElem.innerHTML = html
    
}

function infoTopics(topics) {
    const infoTopicsRow = document.getElementById('infoTopics')
    let c = 16
    infoTopicsRow.innerHTML = ''

    topics.map((topic, i) => {
        infoTopicsRow.innerHTML += `
            <td class="tg-0pky" style="${topic.center && 'text-align: center;'}" colspan="${topic.size}">${topic.text}</td>
        `
    })

}

function lastRow(row) {
    const lastRowElem = document.getElementById('lastRow')
    let html = ''
    let cells = ''
    row.map((cell) =>{ 
        cells += `<td class="tg-0lax" colspan="${cell.size}">${cell.text}</td>`
    })
    html = `<tr> ${cells}</tr>`
    lastRowElem.innerHTML = html
}

async function geraDiario(turma, codHistorico) {
    setLoader(true);
    const turmaRef = classesRef.child(turma);
    const desempenhoRef = performanceGradesRef
    const infoEscola = (await schoolInfoRef.once('value')).val();
    const infoTurma = (await turmaRef.once('value')).val();
    const studentInfo = (await turmaRef.child('alunos').orderByChild('nome').once('value')).val();
    const notasDesempenho = (await desempenhoRef.once('value')).val()
    let somatorioDesempenho = 0
    for (const nomeNota in notasDesempenho) {
        if (Object.hasOwnProperty.call(notasDesempenho, nomeNota)) {
            const nota = notasDesempenho[nomeNota];
            somatorioDesempenho += nota
        }
    }
    const timeNow = functions.httpsCallable('timestamp')
    let timestampNow = (await timeNow()).data.timestamp
    let now = new Date(timestampNow._seconds * 1000)
    timestamp(`Data e hora de emissão: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)

    infoSchool(infoEscola.dadosBasicos)
    title('NOTAS E FALTAS LANÇADAS PARA A TURMA')

    let nomeCurso = infoEscola.cursos[infoTurma.curso].nomeCurso
    infoDoc(infoTurma, nomeCurso)
    // the sizes for info topics must sum 16 mandatorily
    const notas = infoTurma.notas
    
    let qtdeNotas = notas !== undefined ? Object.keys(notas).length : 0
    let topicsArray = [
        {text: 'Nº', size: 1, width: '0.2%'},
        {text: 'Nome', size: 13 - qtdeNotas, width: '37%'},
    ]
    
    for (const nomeNota in notas) {
        if (Object.hasOwnProperty.call(notas, nomeNota)) {
            const totalPts = notas[nomeNota];
            topicsArray.push({text: `${nomeNota}<br>(${totalPts}pts)`, size: 1, center: true})
        }
    }
    topicsArray.push({text: 'Total', size: 1, rotate: true})
    topicsArray.push({text: 'Faltas', size: 1, rotate: true})
    infoTopics(topicsArray)

    let rows = []
    const alunos = studentInfo
    let c = 0
    for (const matricula in alunos) {
        if (Object.hasOwnProperty.call(alunos, matricula)) {
            const aluno = alunos[matricula];
            let infoRow = []
            infoRow.push({text: c + 1, size: 1, center: true});
            infoRow.push({text: `${aluno.nome}`, size: 13 - qtdeNotas});
            let somatorioNotas = 0
            for (const nomeNota in notas) {
                try {
                    const nota = aluno.notas[nomeNota];
                    infoRow.push({text: (nota === 0 || nota === undefined) ? " " : nota, size: 1, center: true});
                    somatorioNotas += nota;
                } catch (error) {
                    infoRow.push({text: '', size: 1, center: true});
                }
            }
            infoRow.push({text: (somatorioNotas === 0 || isNaN(somatorioNotas)) ? " " : somatorioNotas, size: 1, center: true});
            const totalFaltas = aluno.frequencia ? Object.keys(aluno.frequencia).length : 0
            infoRow.push({text: totalFaltas === 0 ? " " : totalFaltas, size: 1, center: true})
            
            rows.push(infoRow)
            c++
        }
    }

    rows = rows.sort((a, b) => {
        console.log(a, b)
        return a[1].text.localeCompare(b[1].text)
    })
    console.log(rows)
    for (const rowI in rows) {
        if (Object.hasOwnProperty.call(rows, rowI)) {
            let row = rows[rowI];
            row[0].text = Number(rowI) + 1
        }
    }
    setRows(rows)

    let lastRowArray = []
    lastRowArray.push({text: '', size: 1})
    lastRowArray.push({text: 'Visto:<br>___/___/______', size: 1})
    lastRowArray.push({text: 'Assinatura', size: 14})
    lastRow(lastRowArray)

    setLoader(false)
}
  
function printElem() {
    let elem = 'diary'
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
            width: 29.7cm;
            min-height: 21cm;
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
        .tg  {border-collapse:collapse; border-style: solid; border-color:#000000;border-spacing:0;margin:0px auto; width: 28cm;}
      .tg td{background-color:#ffffff;border-color:#000000;border-style:hidden;border-width:1px;color:#444;
        font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:2px 15px;word-break:normal;}
      .tg th{background-color:#ffffff;border-color:#000000;border-style:hidden;border-width:1px;color:#fff;
        font-family:Arial, sans-serif;font-size:14px;font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
      .tg .tg-yj5y{background-color:#efefef;border-color:inherit;text-align:center;vertical-align:center}
      .tg .tg-sg5v{border-bottom: solid; font-size: 9pt;}
      .tg .tg-wp8o{text-align:center;vertical-align:center; }
      .tg .tg-m1nc{background-color:#ffffff;border-color:inherit;color:#000000;font-size:10px;text-align:right;vertical-align:center}
      .tg .tg-0pky{border-color:inherit;border-style: solid; text-align:left;vertical-align:center; text-align: center;}
      .tg .tg-73oq{border-color:#000000;text-align:left;vertical-align:center}
      .tg .tg-hvas{font-size:xx-small;text-align:left;vertical-align:center}
      .tg .tg-0lax{text-align:left;vertical-align:center; font-size: 9pt; border-style: solid; }
      .blank_row
        {
            height: 10px !important; /* overwrites any other rules */
            
            border-top: #000000;
            border-bottom: #000000;
        }
    @page {
    size: auto
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
      <>
      <Backdrop open={loader} className={classes.backdrop}><CircularProgress color="inherit" /></Backdrop>
        <Dialog open={open} fullScreen>
            <DialogContent>
                <div id='diary'>
                    <table class="tg">
                        <thead id="head">
                            <tr>
                                <th class="tg-m1nc" colspan="16" id="timestamp">Data de emissão: --/--/-- --:--:--</th>
                            </tr>
                            <tr id="title">
                                <td class="tg-wp8o" colspan="16"><span style={{fontWeight: "bold"}}>Carregando dados...</span></td>
                            </tr>
                            <tr id="infoSchool">
                                <td class="tg-wp8o" colspan="16">INFORMAÇÕES DA ESCOLA</td>
                            </tr>
                            <tr id="infoDoc">
                                <td class="tg-sg5v" colspan="4">TOPICO DE INFORMAÇÕES</td>
                                <td class="tg-sg5v" colspan="4">INFORMAÇÕES</td>
                                <td class="tg-sg5v" colspan="4">TOPICO DE INFORMAÇÕES</td>
                                <td class="tg-sg5v" colspan="4">INFORMAÇÕES</td>
                            </tr>
                            
                            <tr id="infoTopics">
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                                <td class="tg-0pky"></td>
                            </tr>
                        </thead>
                        <tbody id="rows">
                        
                            <tr>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                                <td class="tg-0lax"></td>
                            </tr>
                        
                        </tbody>
                        
                            <tfoot id="lastRow">
                                <tr>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                    <td class="tg-0lax"></td>
                                </tr>
                            </tfoot>
                    </table>
                </div>
                
            </DialogContent>
        <DialogActions><Button id='noprint' onClick={() => printElem()}>Imprimir/PDF</Button><Button id='noprint' onClick={() => onClose(false)}>Fechar</Button></DialogActions>
        </Dialog>
      
      </>
    
  );
}
