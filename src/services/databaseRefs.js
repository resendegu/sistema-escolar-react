import { database } from "./firebase";

// Setting the paths of the firebase database
const rootPath = 'sistemaEscolar/';
const classesPath = 'turmas/';
const coursesPath = '/infoEscola/cursos/'
const contractsPath = '/infoEscola/contratos/'
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

// Export the refs created
export { classesRef, coursesRef, contractRef };