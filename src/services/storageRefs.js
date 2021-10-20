import { storage } from "./firebase";

// Setting the paths of the storage bucket
const rootPath = '/';
const schoolPath = 'sistemaEscolar/';

// Students path
const studentsPath = schoolPath + 'alunos/';

// Setting the root ref
const rootRef = storage.ref(rootPath);

// Setting any other refs in the storage bucket structure
const studentsRef = rootRef.child(studentsPath);

export { studentsRef };