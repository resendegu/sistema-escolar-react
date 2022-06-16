import { booksRef, classesRef, coursesRef, daysCodesRef } from "../services/databaseRefs"
import { functions } from "../services/firebase"

async function calculateAge(birthdate) { 
    let date = birthdate

    try {
        let timestampFunction = functions.httpsCallable('timestamp')
        let result = await timestampFunction()
        let now = new Date(result.data.timestamp._seconds * 1000)
    
        let yearNow = now.getYear();
        let monthNow = now.getMonth();
        let dateNow = now.getDate();
    
        let yearDob = date.getYear();
        let monthDob = date.getMonth();
        let dateDob = date.getDate();
        let age = {};
        let yearAge = yearNow - yearDob;
    
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
    } catch (error) {
        throw new Error(error.code)
    }

    
}

function checkCpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g,'');	
	if(cpf === '') return false;	
	// Elimina CPFs invalidos conhecidos	
	if (cpf.length !== 11 || 
		cpf === "00000000000" || 
		cpf === "11111111111" || 
		cpf === "22222222222" || 
		cpf === "33333333333" || 
		cpf === "44444444444" || 
		cpf === "55555555555" || 
		cpf === "66666666666" || 
		cpf === "77777777777" || 
		cpf === "88888888888" || 
		cpf === "99999999999")
			return false;		
	// Valida 1o digito	
	let add = 0;	
	for (let i=0; i < 9; i ++)		
		add += parseInt(cpf.charAt(i)) * (10 - i);	
		let rev = 11 - (add % 11);	
		if (rev === 10 || rev === 11)		
			rev = 0;	
		if (rev !== parseInt(cpf.charAt(9)))		
			return false;		
	// Valida 2o digito	
	add = 0;	
	for (let i = 0; i < 10; i ++)		
		add += parseInt(cpf.charAt(i)) * (11 - i);	
	rev = 11 - (add % 11);	
	if (rev === 10 || rev === 11)	
		rev = 0;	
	if (rev !== parseInt(cpf.charAt(10)))
		return false;		
	return true;
}

async function getAddress(cep) {
    try {
        const resp = await fetch('https://brasilapi.com.br/api/cep/v1/' + cep)
        const address = await resp.json();
        return address;
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
}


const enrollStudent = async (studentData, classData, contractData, otherData) => {
    let data
    if (studentData.tipoMatricula === 'preMatricula') {
        data = {dados: {...studentData, ...classData, ...otherData}}
    } else {
        data = {dados: {...studentData, ...classData, ...otherData, }, contratoConfigurado: contractData.contratoConfigurado, planoOriginal: contractData.planoOriginal, codContrato: contractData.codContrato}
    }
    
    console.log(data)
    
    try {
        let cadastraAluno = functions.httpsCallable('cadastraAluno');
        const message = await cadastraAluno(data)
        return message.data;
    } catch (error) {
        console.log(error)
        throw new Error(error.message);
    }
    
}

const handleSendClassData = async (data) => {
    
    let classData = data
    classData.hora = data.hora.split(':').join('_')
    console.log(classData)
    try {
        let cadastraTurma = functions.httpsCallable('cadastraTurma');
        const message = await cadastraTurma(classData);
        return  message.data;
    } catch (error) {
        console.log(error)
        throw new Error(error.message);
    }
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const generateClassCode = async (classData) => {
    let course
    let books
    let days

    try {
        course = await (await (coursesRef.child(classData.curso).child('codCurso').once('value'))).val()
        books = await (await (booksRef.once('value'))).val()
        days = await (await daysCodesRef.once('value')).val()
    } catch (error) {
        console.log(error)
    }
    let classCode = ''
    if (course !== undefined) {
        classCode += course
    }
    try {
        for (const i in classData.livros) {
            if (Object.hasOwnProperty.call(classData.livros, i)) {
                const idBook = classData.livros[i];
                const bookCode = books[idBook].codLivro
                classCode += bookCode
            }
        }
    } catch (error) {
        console.log(error)
    }
    
    classCode += '-'
    for (const i in classData.diasDaSemana) {
        if (Object.hasOwnProperty.call(classData.diasDaSemana, i)) {
            const day = classData.diasDaSemana[i];
            classCode += days[day]
        }
    }
    let time

    if (classData.hora.split(':')[1] === '00') {
        time = classData.hora.split(':')[0]
    } else {
        time = classData.hora.split(':').join('_')
    }

    if (time !== undefined) {
        classCode += time
    }

    return classCode;
}

const handleEnableDisableStudents = async (studentsId, classCode='', mode='desativa') => {
    // 'mode' can be "ativa" or "desativa"
    // The 'classCode' needs to be defined only for enabling students back. If sent a classCode but 'mode' is "desativa" it won't have any effects
    let data = {alunos: {}, codTurma: classCode, modo: mode}
    let studentsArray = []
    if (typeof studentsId === "string") {
        studentsArray.push(studentsId)
    } else {
        studentsArray = studentsId
    }
    studentsArray.map((id, i) => {
        data.alunos[id] = ''
        return 0;
    })

    let enableDisableStudentFunction = functions.httpsCallable('ativaDesativaAlunos')
    try {
        let result = await enableDisableStudentFunction(data);
        return result.data.answer;
    } catch (error) {
        throw new Error(error.message)
    }
    
}

const handleTransferStudents = async (currentClass, destinationClass, studentsId) => {
    let data = {turmaAtual: currentClass, turmaParaTransferir: destinationClass, alunos: studentsId}
    let studentsArray = []
    if (typeof studentsId === "string") {
        studentsArray.push(studentsId)
    } else {
        studentsArray = studentsId
    }
    data.alunos = studentsArray

    let transferStudentsFunction = functions.httpsCallable('transfereAlunos')
    try {
        let result = await transferStudentsFunction(data);
        return result.data.answer;
    } catch (error) {
        throw new Error(error.message)
    }
}

const handleAddTeacher = async (teacherEmail, classCode) => {
    let data = {emailProf: teacherEmail, codSala: classCode};
    let addTeacherFunction = functions.httpsCallable('addNovoProfTurma');
    try {
        let result = await addTeacherFunction(data);
        return result.data.answer;
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

const handleRemoveTeacher = async (classCode, index) => {
    try {
        await classesRef.child(classCode).child('professor').child(index).remove();
        return 'Professor(a) desconectado(a) com sucesso.'
    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
    
}

const handleDeleteClass = async (classCode) => {
    let data = {codTurma: classCode};
    let deleteClassFunction = functions.httpsCallable('excluiTurma');
    try {
        let result = await deleteClassFunction(data);
        return result.data.answer;
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

const getRandomKey = async () => {
    // Just using classesRef to get a random key, won't take any effect in the database
    const key = await classesRef.push().key;
    return key;
}

const handleClassOpen = async (classCode, eventSource, info) => {
    const classRef = classesRef.child(classCode)
    try {
        await classRef.child('aulaEvento').set(eventSource);
        await classRef.child('status').set({...info, turma: 'aberta'});
        return 'Turma aberta com sucesso!';
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
    
}

const handleCloseClass = async (classCode) => {
    let data = classCode
    let closeClassFunction = functions.httpsCallable('fechaTurma');
    try {
        let result = await closeClassFunction(data);
        return result.data.answer;
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getBrazilianHolidays = async (year) => {
    const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`)
    console.log(await response.json())
    
}

const accessVerification = async (accessType) => {
    let accessVerificationFunction = functions.httpsCallable('verificadorDeAcesso');
    try {
        let result = await accessVerificationFunction({acesso: accessType});
        return result.data;
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

const generateBillets = async (studentId, contractId) => {
    let generateBilletsFunction = functions.httpsCallable('geraBoletos');
    try {
        let result = await generateBilletsFunction({matricula: studentId, codContrato: contractId});
        console.log(result.data)
        return result.data;
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

async function createBilletView(parcelaAtual, numDeParcelas, vencimento, numeroDoc, valorDoc, descontos, acrescimos, totalCobrado, dataProcessamento, informacoes, student, infoSchool, billetElem) {
    // Function to create a single billet view
    console.log(student)

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
    //let boletos = document.getElementById('boletos')
    billetElem.innerHTML = ""
    let gera = functions.httpsCallable('geraPix')
    await gera({valor: totalCobrado, descricao: `DOC${numeroDoc}`}).then(function(lineCode) {

        
        //divQr.src = lineCode.data;
        console.log(lineCode)
        //const code = new QRCode(divQr, { text: lineCode.data, width: 100, height: 100 });
        // qrCodesArray.push({qrcode: lineCode.data, numeroDoc: numeroDoc})
        
        billetElem.innerHTML += `
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

    })
    return ;
}

const grantAndRevokeAccess = async (access, uid, checked) => {
    let grantAndRevokeAccessFunction = functions.httpsCallable('liberaERemoveAcessos');
    try {
        let result = await grantAndRevokeAccessFunction({acesso: access, checked: checked, uid: uid});
        console.log(result.data)
        return result.data;
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

const releaseFaults = async (dateStr, classId, studentsIds) => {
    const data = {dateStr: dateStr, classId: classId, studentsIds: studentsIds}

    let releaseFaultsFunction = functions.httpsCallable('lancaFaltas');
    try {
        let result = await releaseFaultsFunction(data);
        console.log(result.data)
        return result.data.answer;
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

const removeFaults = async (dateStr, classId, studentId) => {
    const data = {dateStr: dateStr, classId: classId, studentId: studentId}
    console.log(data)
    let removeFaultsFunction = functions.httpsCallable('removeFaltas');
    try {
        let result = await removeFaultsFunction(data);
        console.log(result.data)
        return result.data.answer;
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}
 
export { calculateAge, checkCpf, getAddress, enrollStudent, handleSendClassData, formatBytes, generateClassCode, handleEnableDisableStudents, handleTransferStudents, handleAddTeacher, handleDeleteClass, handleRemoveTeacher, getRandomKey, handleClassOpen, handleCloseClass, capitalizeFirstLetter, getBrazilianHolidays, accessVerification, generateBillets, createBilletView, grantAndRevokeAccess, releaseFaults, removeFaults };