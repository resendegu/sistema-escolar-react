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
        let message = await cadastraAluno(data)
        return message.data;
    } catch (error) {
        console.log(error)
        throw new Error(error.message);
    }
    
}
 
export { calculateAge, checkCpf, getAddress, enrollStudent };