import { database } from "./firebase";

// Setting the paths of the firebase database
const rootPath = 'sistemaEscolar/';

// School info paths
const schoolInfoPath = 'infoEscola/';
const booksPath = schoolInfoPath + 'livros/';
const coursesPath = schoolInfoPath + 'cursos/';
const contractsPath = schoolInfoPath + 'contratos/';
const additionalFieldsPath = schoolInfoPath + 'camposAdicionais/';
const basicDataPath = schoolInfoPath + 'dadosBasicos/';
const daysCodesPath = schoolInfoPath + 'codDiasSemana/';
const calendarPath = schoolInfoPath + 'calendarioGeral/';


// General paths
const classesPath = 'turmas/';
const studentsPath = 'alunos/';
const disabledStudentsPath = 'alunosDesativados/';
const usersPath = 'usuarios/';
const chatsPath = 'chats/';
const notificationsPath = 'notifications/';
const teachersListPath = 'listaDeProfessores/';
const followUpPath = 'followUp/'
const performanceGradesPath = 'notasDesempenho/referencia/'
const billetsDocsPath = 'docsBoletos/'
const usersListPath = 'listaDeUsuarios/'
const preEnrollmentsPath = 'preMatriculas/'
const quickDataPath = 'dadosRapidos/'


// Setting the root ref
const rootRef = database.ref(rootPath);

// Setting any other refs in the database structure
const schoolInfoRef = rootRef.child(schoolInfoPath);
const classesRef = rootRef.child(classesPath);
const booksRef = rootRef.child(booksPath);
const coursesRef = rootRef.child(coursesPath);
const contractRef = rootRef.child(contractsPath);
const daysCodesRef = rootRef.child(daysCodesPath);
const additionalFieldsRef = rootRef.child(additionalFieldsPath);
const basicDataRef = rootRef.child(basicDataPath);
const notificationsRef = database.ref(notificationsPath);
const studentsRef = rootRef.child(studentsPath);
const disabledStudentsRef = rootRef.child(disabledStudentsPath);
const teachersListRef = rootRef.child(teachersListPath);
const calendarRef = rootRef.child(calendarPath);
const followUpRef = rootRef.child(followUpPath);
const performanceGradesRef = rootRef.child(performanceGradesPath);
const usersRef = rootRef.child(usersPath);
const billetsDocsRef = rootRef.child(billetsDocsPath);
const usersListRef = rootRef.child(usersListPath);
const preEnrollmentsRef = rootRef.child(preEnrollmentsPath);
const quickDataRef = rootRef.child(quickDataPath);

// Export the refs created
export { schoolInfoRef, classesRef, booksRef, coursesRef, contractRef, daysCodesRef, additionalFieldsRef, basicDataRef, notificationsRef, studentsRef, disabledStudentsRef, teachersListRef, calendarRef, followUpRef, performanceGradesRef, usersRef, billetsDocsRef, usersListRef, preEnrollmentsRef, quickDataRef };