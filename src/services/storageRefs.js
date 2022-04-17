import { storage } from "./firebase";

// Setting the paths of the storage bucket
const rootPath = '/';
const schoolPath = 'sistemaEscolar/';

// School paths
const studentsPath = schoolPath + 'alunos/';
const billetAttachmentsPath = schoolPath + 'billetAttachments/'

// More paths
const usersPath = 'users/'


// Setting the root ref
const rootRef = storage.ref(rootPath);

// Setting any other refs in the storage bucket structure
const studentsRef = rootRef.child(studentsPath);
const usersRef = rootRef.child(usersPath);
const billetAttachmentsRef = rootRef.child(billetAttachmentsPath);

export { studentsRef, usersRef, billetAttachmentsRef };