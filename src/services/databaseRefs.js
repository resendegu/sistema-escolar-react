import { database } from "./firebase";

// Setting the paths of the firebase database
const rootPath = 'sistemaEscolar/';

// School info paths
const schoolInfoPath = 'infoEscola/'
const booksPath = schoolInfoPath + 'livros/'
const coursesPath = schoolInfoPath + 'cursos/'
const contractsPath = schoolInfoPath + 'contratos/'
const additionalFieldsPath = schoolInfoPath + 'camposAdicionais/'
const basicDataPath = schoolInfoPath + 'dadosBasicos/'
const daysCodesPath = schoolInfoPath + 'codDiasSemana/'

// General paths
const classesPath = 'turmas/';
const studentsPath = 'alunos/';
const disabledStudents = 'alunosDesativados/';
const usersPath = 'usuarios/';
const chatsPath = 'chats/';
const notificationsPath = 'notifications/'


// Setting the root ref
const rootRef = database.ref(rootPath);

// Setting any other refs in the database structure
const classesRef = rootRef.child(classesPath);
const booksRef = rootRef.child(booksPath);
const coursesRef = rootRef.child(coursesPath);
const contractRef = rootRef.child(contractsPath);
const daysCodesRef = rootRef.child(daysCodesPath);
const additionalFieldsRef = rootRef.child(additionalFieldsPath);
const basicDataRef = rootRef.child(basicDataPath);
const notificationsRef = database.ref(notificationsPath);
const studentsRef = rootRef.child(studentsPath);

// Export the refs created
export { classesRef, booksRef, coursesRef, contractRef, daysCodesRef, additionalFieldsRef, basicDataRef, notificationsRef, studentsRef };