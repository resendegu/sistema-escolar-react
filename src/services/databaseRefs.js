import { database } from "./firebase";

// Setting the paths of the firebase database
const rootPath = 'sistemaEscolar/';
const classesPath = 'turmas/';
const studentsPath = 'alunos/';
const disabledStudents = 'alunosDesativados/';
const usersPath = 'usuarios/';
const chatsPath = 'chats/';

// Setting the root ref
const rootRef = database.ref(rootPath);

// Setting any other refs in the database structure
const classesRef = rootRef.child(classesPath);

// Export the refs created
export { classesRef };