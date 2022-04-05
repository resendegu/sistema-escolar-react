import { storage } from "./firebase";

// Setting the paths of the storage bucket
const rootPath = '/';
const schoolPath = 'sistemaEscolar/';

// School paths
const studentsPath = schoolPath + 'alunos/';

// More paths
const usersPath = 'users/'

// Setting the root ref
const rootRef = storage.ref(rootPath);

// Setting any other refs in the storage bucket structure
const studentsRef = rootRef.child(studentsPath);
const usersRef = rootRef.child(usersPath);

export { studentsRef, usersRef };