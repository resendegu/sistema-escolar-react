import React, { useEffect, useState } from 'react';
import { Backdrop, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles } from '@material-ui/core';

import { functions } from '../services/firebase';
import { studentsRef, preEnrollmentsRef, disabledStudentsRef, performanceGradesRef, schoolInfoRef } from '../services/databaseRefs';
import './BaseDocumentStyle.css'

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: 9999999999999999999999999999999,
        color: '#fff',
    },
     
   }));

export default function BaseDocument({classCode, open, onClose}) {
    const classes = useStyles();
    const [loader, setLoader] = useState(false);
    const [time, setTime] = useState();
    const [infos, setInfos] = useState();
    const [docType, setDocType] = useState('');
 
  const getData = async () => {
      const timestamp = functions.httpsCallable('timestamp')
    var logoEscola = document.getElementById('logoEscola');
    var nomeEscola = document.getElementById('nomeEscola');
    var dataEmissao = document.getElementById('dataEmissao');
    var logoSecundaria = document.getElementById('logoSecundaria');
    var imagemAluno = document.getElementById('imagemAluno');
    var tipoDocumento = document.getElementById('tipoDocumento');
    var nomeAluno = document.getElementById('nomeAluno');
    var matriculaAluno = document.getElementById('matriculaAluno');

    var previousMatricula = document.getElementById('previousMatricula');
    var previousId = document.getElementById('previousId');
    var nextId = document.getElementById('nextId');
    var previousId = document.getElementById('previousId');
    var nextMatricula = document.getElementById('nextMatricula');
    var cabecalho = document.getElementById('cabecalho');
    var tituloSecao = document.getElementById('tituloSecao');
    var dadosTabela = document.getElementById('dadosTabela');
    var dadosFinais = document.getElementById('dadosFinais');
    var espacoFinal = document.getElementById('espacoFinal')

    const timeNow = await timestamp()
        setTime(timeNow)

        // Instantiating the elements
        const dataEhora = new Date(timeNow.data.timestamp._seconds * 1000);
        
        

        const infoEscola = await schoolInfoRef.once('value')
        setInfos(infoEscola.val())
        let infos = infoEscola.val()
        nomeEscola.innerText =  infos.dadosBasicos.nomeEscola
        dataEmissao.innerText = `${dataEhora.toLocaleDateString()} ${dataEhora.toLocaleTimeString()}`
        logoEscola.innerHTML = `<img src="${infos.logoEscola}" style="width: 70px; height: 70px;"></img>`
        logoSecundaria.innerHTML = `<p style="font-size: x-small;">${infos.dadosBasicos.cnpjEscola}</p><p style="font-size: x-small;">${infos.dadosBasicos.telefoneEscola}</p><p style="font-size: x-small;">${infos.dadosBasicos.enderecoEscola}</p>`

    let hash = window.location.hash;
        if (hash) {
            let type = hash.split('?')[0].substring(1);
            let matriculas = hash.split('?')[1];
            let ids = hash.split('?')[2] || '';
            console.log(type, matriculas, ids);
            if (type === 'fichaCadastral') {
                geraFichaCadastral(matriculas);
                setDocType('Ficha Cadastral')
            }
            if (type === 'preMatricula') {
                // Neste caso os parametros recebidos no lugar da matrícula serão um código de pré-matricula
                geraFichaCadastral(matriculas, 'preMatricula')
                console.log('foi')
                tipoDocumento.innerText = 'Ficha de Pré-matrícula'
            }
            if (type === 'boletim') {
                geraBoletim(matriculas, ids, infos); 
                tipoDocumento.innerText = 'Boletim'
            } 
        }

        


  }

  useEffect(() => {
      setTimeout(() => {
        getData()
      }, 1000);
      
  }, [])

  function calcularIdadePrecisa(dataNasc) {
	console.log(dataNasc)
	let nascimento = dataNasc
	nascimento = nascimento.split('-')
    let data = new Date()
    data.setDate(Number(nascimento[2]))
    data.setFullYear(Number(nascimento[0]))
    data.setMonth(Number(nascimento[1]) - 1)
    for (const key in nascimento) {
        if (Object.hasOwnProperty.call(nascimento, key)) {
            const element = nascimento[key];
            nascimento[key] = parseInt(element)
        }
    }
	let timestampNow = functions.httpsCallable('timestamp')
	return timestampNow().then(function(result){
		var now = new Date(result.data.timestamp._seconds * 1000)

		var yearNow = now.getYear();
		var monthNow = now.getMonth();
		var dateNow = now.getDate();

		var yearDob = data.getYear();
		var monthDob = data.getMonth();
		var dateDob = data.getDate();
		var age = {};
		var yearAge = yearNow - yearDob;

		if (monthNow >= monthDob)
			var monthAge = monthNow - monthDob;
		else {
			yearAge--;
			var monthAge = 12 + monthNow -monthDob;
		}

		if (dateNow >= dateDob)
			var dateAge = dateNow - dateDob;
		else {
			monthAge--;
			var dateAge = 31 + dateNow - dateDob;

			if (monthAge < 0) {
			monthAge = 11;
			yearAge--;
			}
		}

		age = {
				years: yearAge,
				months: monthAge,
				days: dateAge
			};
		
		return age;
	}).catch(function(error){
		throw new Error(error)
	})
	
}
    
        
        

        // Setting info from school

        



        function adicionaEspacoCabeçalho(texto1='', texto2='', texto3='', texto4='', colspan=null, id='') {
            var cabecalho = document.getElementById('cabecalho');
            if (colspan != null) {
                cabecalho.innerHTML += `
                <tr style="height: 20px;" id="cabecalho${id}">
                    <th ${colspan} style="width: 35.7142%; height: 20px; border-style: hidden; text-align: start; font-weight: normal; "><label><b>${texto1}</b></label>&nbsp;<label>${texto2}</label></td>
                </tr>
                `
            } else {
                cabecalho.innerHTML += `
                <tr style="height: 20px;" id="cabecalho${id}">
                    <td style="width: 35.7142%; height: 20px; border-style: hidden;"><label><b>${texto1}</b></label>&nbsp;<label>${texto2}</label></td>
                    <td style="width: 36.1352%; height: 20px; border-style: hidden;"><label><b>${texto3}</b></label>&nbsp;<label>${texto4}</label></td>
                </tr>
                `
            }
            
        }

        function adicionaDadosTabela(texto1='', texto2='', id='') {
            var dadosTabela = document.getElementById('dadosTabela');
            if (texto1[0] == true) {
                dadosTabela.innerHTML += `
                <tr style="height: 20px; " id="${id}">
                    <th colspan=2 style="height: 33px; width: 100%;  text-align: center;"><b>${texto1[1]}</b></th>
                </tr>
                `
            } else if (texto1[0] == false) {
                dadosTabela.innerHTML += `
                <tr style="height: 20px; " id="${id}">
                    <th colspan=2 style="height: 33px; width: 100%;  text-align: start;">&nbsp;<b>${texto1[1]}</b></th>
                </tr>
                `
            } else {
                for (let i = 0; i < texto1.length; i++) {
                    const topico = texto1[i];
                    const texto = texto2[i]
                    dadosTabela.innerHTML += `
                    <tr style="height: 20px; " id="${id}">
                        <td style="min-width: 140px; height: 33px; width: 30%; background-color: lightgray; text-align: center;">&nbsp;${topico}</td>
                        <td style="height: 33px; width: 60%;">&nbsp;${texto}</td>
                    </tr>
                    `
                }
            }
            
        }


        async function geraBoletim(matriculas, ids, infos) {
            var dadosTabela = document.getElementById('dadosTabela');
            var previousMatricula = document.getElementById('previousMatricula');
            
            var nextId = document.getElementById('nextId');
            var previousId = document.getElementById('previousId');
            var nextMatricula = document.getElementById('nextMatricula');
            let c = 0
            if (matriculas.indexOf(',') !== -1) {
                matriculas = matriculas.split(',');
                ids = ids.split(',');

                console.log(matriculas, ids)

                nextMatricula.style.display = 'block'
                previousMatricula.style.display = 'block'
                nextId.style.display = 'none'
                previousId.style.display = 'none'
                console.log(matriculas);
                gerador(matriculas[c], ids[c]); 
            } else {
                nextMatricula.style.display = 'none'
                previousMatricula.style.display = 'none'
                if (ids.indexOf(',') == -1) {
                    nextId.style.display = 'none'
                    previousId.style.display = 'none'
                } else {
                    nextId.style.display = 'block'
                    previousId.style.display = 'block'
                }
                
                gerador(matriculas, ids)
            }
            
            async function gerador(matricula, id) {
                var imagemAluno = document.getElementById('imagemAluno');
                var tituloSecao = document.getElementById('tituloSecao');
                var espacoFinal = document.getElementById('espacoFinal');
                
                dadosTabela.innerHTML = ''
                let alunoInfo = await studentsRef.child(matricula).once('value')
                alunoInfo = alunoInfo.exists() ? alunoInfo : await disabledStudentsRef.child(matricula + '/dadosAluno').once('value')

                    let aluno = alunoInfo.val();
                    let historico = aluno.historicoEscolar[id]
                    
                    let idade = await calcularIdadePrecisa(aluno.dataNascimentoAluno)
                    console.log(aluno);


                    
                    // Adiciona o semestre mais os livros
                    let semestreLivros = historico.infoAluno.nomePeriodo + ' - '
                    let c1 = 0
                    for (const i in historico.infoAluno.livros) {
                        if (c1 >= 1) {
                            semestreLivros += ' | '
                        }
                        
                        if (Object.hasOwnProperty.call(historico.infoAluno.livros, i)) {
                            const codLivroSistema = historico.infoAluno.livros[i];
                            semestreLivros += infos.livros[codLivroSistema].idLivro 
                        }
                        
                        c1++
                    }
                    adicionaEspacoCabeçalho('Nome: ', aluno.nomeAluno, 'Matrícula:', aluno.matriculaAluno)
                    console.log(aluno.fotoAluno)
                    imagemAluno.src = !aluno.fotoAluno ? null : aluno.fotoAluno 
                    adicionaEspacoCabeçalho('Turma:', historico.turma, 'Curso:', infos.cursos[historico.infoAluno.curso].nomeCurso)
                    adicionaEspacoCabeçalho('Data Início:', historico.infoAluno.inicio.split('-').reverse().join('/'), 'Data término:', historico.infoAluno.fim.indexOf('T') === -1 ? historico.infoAluno.fim.split('-').reverse().join('/') : new Date(historico.infoAluno.fim).toLocaleDateString())
                    adicionaEspacoCabeçalho('Semestre - Livro:', semestreLivros, '', '', 'colspan=2')

                    tituloSecao.innerText = ''
                    let notasDesempenho = historico.infoAluno.desempenho
                    let notas = []
                    let topicos = []
                    let soma = 0
                    console.log(notasDesempenho)
                    if (notasDesempenho !== undefined) {
                        adicionaDadosTabela([true, 'Notas de desempenho'])
                    }
                   
                    for (const topicoDesempenho in notasDesempenho) {
                        if (Object.hasOwnProperty.call(notasDesempenho, topicoDesempenho)) {
                            const nota = notasDesempenho[topicoDesempenho];
                            notas.push(nota)
                            topicos.push(topicoDesempenho)
                        }
                    }
                    adicionaDadosTabela(topicos, notas)

                    adicionaDadosTabela([true, 'Notas gerais'])
                    let notasGerais = historico.infoAluno.notas
                    notas = []
                    topicos = []
                    for (const topicoGeral in notasGerais) {
                        if (Object.hasOwnProperty.call(notasGerais, topicoGeral)) {
                            const nota = notasGerais[topicoGeral];
                            notas.push(nota)
                            topicos.push(topicoGeral)
                            soma += nota
                        }
                    }
                    adicionaDadosTabela(topicos, notas)
                    adicionaDadosTabela([false, `Nota Final: ${soma}`])

                    adicionaDadosTabela([true, 'Aproveitamento'])
                    let faltas = 0
                    let frequencia = historico.infoAluno.frequencia
                    for (const time in frequencia) {
                        if (Object.hasOwnProperty.call(frequencia, time)) {
                            const turma = frequencia[time];
                            faltas++
                        }
                    }
                    let aulasPresente = Number(historico.infoAluno.qtdeAulas) - faltas
                    let porcentagemFrequencia = ((100*aulasPresente)/Number(historico.infoAluno.qtdeAulas)).toFixed(2)
                    
                    adicionaDadosTabela(['Frequência (%)', 'Faltas'], [porcentagemFrequencia + '%', faltas == 0 ? 'Nenhuma falta' :`${faltas} de um total de ${historico.infoAluno.qtdeAulas} aulas ministradas`])
                    if (soma >= Number(infos.dadosBasicos.pontosAprovacao)) {
                        if (porcentagemFrequencia >= Number(infos.dadosBasicos.frequenciaAprovacao)) {
                            adicionaDadosTabela([false, 'Situação final: <label style="color: green;">APROVADO</label>'])
                        } else {
                            adicionaDadosTabela([false, 'Situação final: <label style="color: red;">REPROVADO POR FREQUÊNCIA</label>'])
                        }  
                    } else {
                        if (porcentagemFrequencia < Number(infos.dadosBasicos.frequenciaAprovacao)) {
                            adicionaDadosTabela([false, 'Situação final: <label style="color: red;">REPROVADO POR NOTA E FREQUÊNCIA</label>'])
                        } else {
                            adicionaDadosTabela([false, 'Situação final: <label style="color: red;">REPROVADO POR NOTA</label>'])
                        }
                        
                    }
                    
                    espacoFinal.innerHTML = `
                    <br><br>
                    <table style="width: 100%; border-collapse: collapse; border-style: hidden; height: 50px;" border="1">
                        <tbody>
                            <tr style="height: 18px;">
                                <td style="width: 33.3333%; padding: 10px; border-style: hidden; height: 18px; text-align: center;">
                                    <hr style="border-color: black;">
                                    <strong>Professor</strong>
                                </td>
                                <td style="width: 33.3333%; padding: 10px; border-style: hidden; height: 18px; text-align: center;">
                                    <hr style="border-color: black;">
                                    <strong>Dire&ccedil;&atilde;o</strong>
                                </td>
                                <td style="width: 33.3333%; padding: 10px; border-style: hidden; height: 18px; text-align: center;">
                                    <hr style="border-color: black;">
                                    <strong>Aluno ou respons&aacute;vel</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    `
                    
                  
                
            }

            nextMatricula.addEventListener('click', (e) => {
                if (c < matriculas.length - 1) {
                    c++
                    
                    gerador(matriculas[c], ids[c])
                }  
            })

            previousMatricula.addEventListener('click', (e) => {
                if (c > 0) {
                    c--
                   
                    gerador(matriculas[c], ids[c])
                }
            })

        }

        async function geraFichaCadastral(matriculas, tipo='matricula') {
            var tituloSecao = document.getElementById('tituloSecao');
            var imagemAluno = document.getElementById('imagemAluno');
            var previousMatricula = document.getElementById('previousMatricula');
            var previousId = document.getElementById('previousId');
            var nextId = document.getElementById('nextId');
            var nextMatricula = document.getElementById('nextMatricula');
            let c = 0
            if (matriculas.indexOf(',') !== -1) {
                matriculas = matriculas.split(',');
                nextMatricula.style.display = 'block'
                previousMatricula.style.display = 'block'
                nextId.style.display = 'none'
                previousId.style.display = 'none'
                console.log(matriculas);
                gerador(matriculas[c]); 
            } else {
                nextMatricula.style.display = 'none'
                previousMatricula.style.display = 'none'
                nextId.style.display = 'none'
                previousId.style.display = 'none'
                gerador(matriculas)
            }
            
            async function gerador(matricula) {
                
                let alunoInfo
                if (tipo === 'matricula') {
                    alunoInfo = await studentsRef.child(matricula).once('value')
                } else {
                    alunoInfo = await preEnrollmentsRef.child(matricula).once('value')
                }
                
                alunoInfo = alunoInfo.exists() ? alunoInfo : await disabledStudentsRef.child(matricula + '/dadosAluno').once('value')
                    
                    let aluno = alunoInfo.val();
                    let idade = await calcularIdadePrecisa(aluno.dataNascimentoAluno)
                    let responsaveis = aluno.responsaveis
                    console.log(responsaveis)
                    let responsavel
                    let keyResp
                    for (const key in responsaveis) {
                        if (Object.hasOwnProperty.call(responsaveis, key)) {
                            const resp = responsaveis[key];
                            keyResp = key
                            if (resp.pedagogico) {
                                responsavel = resp
                            
                            }
                        }
                    }
                    if (idade.years < 18) {
                        responsavel = responsavel === undefined ? responsaveis[keyResp] : responsavel
                    }
                    
                    console.log(aluno);
                    let titulos = [
                        [true, 'Dados do Aluno'],
                        [
                            'Data de Nascimento',
                            'CPF',
                            'RG',
                            'E-mail',
                            'Celular',
                            'Telefone',
                            'Endereço',
                            'Cidade - Estado',
                        ],
                        
                        idade.years < 18 ? [true, `${responsavel.relacao} do aluno`] : undefined,
                        idade.years < 18 ? [
                            'Nome', 'RG', 'CPF', 'Celular', 'E-mail', 
                        ] : undefined,

                        
                    ]
                    let dados = [
                        '',
                        [
                            aluno.dataNascimentoAluno.split('-').reverse().join('/'),
                            aluno.cpfAluno,
                            aluno.rgAluno,
                            aluno.emailAluno,
                            aluno.celularAluno,
                            aluno.telefoneAluno,
                            `${aluno.enderecoAluno}, ${aluno.bairroAluno}, CEP ${aluno.cepAluno} `,
                            aluno.cidadeAluno + ' - ' + aluno.estadoAluno,
                        ],

                        idade.years < 18 ? [''] : null,
                        idade.years < 18 ? [
                            responsavel.nome, responsavel.rg, responsavel.cpf, responsavel.celular, responsavel.email
                        ] : null,

                        

                    ]

                    
                    adicionaEspacoCabeçalho('Nome: ', aluno.nomeAluno, 'Matrícula:', aluno.matriculaAluno)
                    imagemAluno.src = !aluno.fotoAluno ? null : aluno.fotoAluno 
                    tituloSecao.innerText = ''
                    for (let i = 0; i < titulos.length; i++) {
                        const titulo = titulos[i];
                        const dado = dados[i];
                        console.log(titulo)
                        adicionaDadosTabela(titulo, dado, i)
                    }
                
                
                
            }

            nextMatricula.addEventListener('click', (e) => {
                if (c < matriculas.length - 1) {
                    c++
                    
                    gerador(matriculas[c])
                }  
            })

            previousMatricula.addEventListener('click', (e) => {
                if (c > 0) {
                    c--
                    
                    gerador(matriculas[c])
                }
            })

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
      <>
      <Backdrop open={loader} className={classes.backdrop}><CircularProgress color="inherit" /></Backdrop>
        <Dialog open={open} fullScreen>
        <DialogTitle>Visualizar documento</DialogTitle>
            <DialogContent>
                <div class="actionButtons">
                    <table border="1" style={{width: "100%", borderStyle: "hidden"}}>
                        <tbody>
                            <tr>
                                <td style={{width: "20%", textAlign: "center", borderStyle: "hidden"}}><button id="previousMatricula">Aluno Anterior</button></td>
                                <td style={{width: "20%", textAlign: "center", borderStyle: "hidden"}}><button id="previousId">Anterior</button></td>
                                
                                <td style={{width: "20%", textAlign: "center", borderStyle: "hidden"}}><button id="nextId">Próximo</button></td>
                                <td style={{width: "20%", textAlign: "center", borderStyle: "hidden"}}><button id="nextMatricula">Próximo Aluno</button></td>
                            </tr>
                        </tbody>
                    </table>
            
            
                </div>
                <div class="book" id='livro'>
                    <div class="page">
                        <div class="subpage">
                            <table border="1" style={{height: "73px", width: "100%", borderCollapse: "collapse"}}height="73">
                                <tbody>
                                    <tr>
                                        <td style={{width: "25%", textAlign: "center"}} id="logoEscola">Logo escola</td>
                                        <td style={{width: "50%", textAlign: "center"}}>
                                            <p id="nomeEscola">Nome da Escola</p>
                                            <p style={{fontSize: "small"}}><em>Emitido em <label id="dataEmissao">[data]</label></em></p>
                                        </td>
                                        <td style={{width: "25%", textAlign: "center"}} id="logoSecundaria">Outra logo ou informa&ccedil;&atilde;o</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p>
                                <img id="imagemAluno" src="../../images/espaco_foto_aluno.png" alt="Espa&ccedil;o foto 3x4 do aluno" style={{float: "right", marginBottom: "15px", marginTop: "15px", width: "3cm", height: "4cm"}} />
                            </p>
                            <h1 style={{color: "#4485b8"}}>
                                <br />
                                <strong style={{color: "#000"}}><label id="tipoDocumento">{docType}</label></strong>
                                <span>&nbsp;</span>
                            </h1>
                            <table border="1" style={{height: "40px", width: "75.8669%", borderCollapse: "collapse", borderStyle: "inset"}}>
                                <tbody id="cabecalho">
                                    
                                    
                                </tbody>
                            </table>
                            <p></p>
                            <p><br /><br /></p>
                            
                            <table border="1" style={{height: "58px", width: "100%", verticalAlign: "top", marginLeft: "auto", marginRight: "auto", borderStyle: "inset", borderCollapse: "collapse"}}>
                                <p style={{textAlign: "center", width: "100%"}}><b><label id="tituloSecao"></label></b></p>
                                <tbody id="dadosTabela">
                                    
                                </tbody>
                            </table>
                            <section id='espacoFinal'></section>
                            <hr />
                            <table border="1" style={{width: "100%", borderCollapse: "collapse", borderStyle: "dotted", marginLeft: "auto", marginRight: "auto"}}>
                                <tbody>
                                    <tr>
                                        <td style={{width: "100%", textAlign: "center"}}>Sistema Escolar GrupoProX - comercial@grupoprox.com</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        <DialogActions><Button id='noprint' onClick={() => PrintElem()}>Imprimir/PDF</Button><Button id='noprint' onClick={() => onClose(false)}>Fechar</Button></DialogActions>
        </Dialog>
      
      </>
    
  );
}
