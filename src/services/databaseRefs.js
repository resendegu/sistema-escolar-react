import { database } from "./firebase";

// Setting the paths of the firebase database
const rootPath = 'sistemaEscolar/';

const classesPath = 'turmas/';
const schoolInfoPath = 'infoEscola/'
const coursesPath = schoolInfoPath + 'cursos/'
const contractsPath = schoolInfoPath + 'contratos/'
const additionalFieldsPath = schoolInfoPath + 'camposAdicionais/'
const basicDataPath = schoolInfoPath + 'dadosBasicos/'
const studentsPath = 'alunos/';
const disabledStudents = 'alunosDesativados/';
const usersPath = 'usuarios/';
const chatsPath = 'chats/';


// Setting the root ref
const rootRef = database.ref(rootPath);

// Setting any other refs in the database structure
const classesRef = rootRef.child(classesPath);
const coursesRef = rootRef.child(coursesPath);
const contractRef = rootRef.child(contractsPath);
const additionalFieldsRef = rootRef.child(additionalFieldsPath);
const basicDataRef = rootRef.child(basicDataPath);

// Export the refs created
export { classesRef, coursesRef, contractRef, additionalFieldsRef, basicDataRef };