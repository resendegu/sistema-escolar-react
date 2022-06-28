import React, { cloneElement, useDebugValue, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop'
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import { studentFilesRef } from '../services/storageRefs';
import { formatBytes } from './FunctionsUse';
import { storage } from '../services/firebase';
import { Box, Button, Tooltip } from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress'
import ShowFiles from './ShowFiles';
import { CloudUpload, Face, Refresh } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import { disabledStudentsRef, preEnrollmentsRef, studentsRef } from '../services/databaseRefs';
import { useConfirmation } from '../contexts/ConfirmContext';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    maxWidth: 270,
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
  list: {
    height: "50vh",
    overflow: 'auto',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));



export default function StudentFiles({ studentId, disabledStudent, preEnrollment }) {
  const classes = useStyles();

  const confirm = useConfirmation();
  
  const [dense, setDense] = useState(true);
  const [secondary, setSecondary] = useState(true);
  const [studentFiles, setStudentFiles] = useState([]);
  const [ filesList, setFilesList ] = useState()
  const [ openFile, setOpenFile ] = useState(false)
  const [ url, setUrl ] = useState()
  const [ totalFilesSize, setTotalFilesSize ] = useState('0 B')
  const [ filesKey, setFilesKey ] = useState();
  const [ loading, setLoading ] = useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();


  const getData = async () => {
    setLoading(true)
    if (preEnrollment) {
      const snapshot = await preEnrollmentsRef.child(studentId).child('studentFilesKey').once('value')
      if (snapshot.exists()) {
        setStudentFiles()
        const studentFilesKey = snapshot.val();
        setFilesKey(studentFilesKey);
        let filesArray = []
        const res = await studentFilesRef.child(studentFilesKey).listAll()
        console.log(res)
        res.items.forEach(async (item) => {
          let metadata = await item.getMetadata()
          filesArray.push({name: item.name, fullPath: item.fullPath, metadata: metadata})
          setStudentFiles([...filesArray])
        })
        
        
      } else {
        const newKey = await studentsRef.push().key
        preEnrollmentsRef.child(studentId).child('studentFilesKey').set(newKey)
        getData()
      }
    } else {
      const snapshot = disabledStudent ? await disabledStudentsRef.child(studentId).child('dadosAluno').child('studentFilesKey').once('value') : await studentsRef.child(studentId).child('studentFilesKey').once('value')

      if (snapshot.exists()) {
        setStudentFiles()
        const studentFilesKey = snapshot.val();
        setFilesKey(studentFilesKey);
        let filesArray = []
        const res = await studentFilesRef.child(studentFilesKey).listAll()
        console.log(res)
        res.items.forEach(async (item) => {
          let metadata = await item.getMetadata()
          filesArray.push({name: item.name, fullPath: item.fullPath, metadata: metadata})
          setStudentFiles([...filesArray])
        })
        
        
      } else {
        const newKey = await studentsRef.push().key
        disabledStudent ? disabledStudentsRef.child(studentId).child('dadosAluno').child('studentFilesKey').set(newKey) : studentsRef.child(studentId).child('studentFilesKey').set(newKey)
        getData()
      }
    }
    
    setLoading(false)

  }
  useEffect(() => {
    
    getData()
      
    
  }, [studentId])

  useEffect(() => {
    calculateTotalSize()
  }, [studentFiles])

  const handleOpenFile = async (fullPath) => {
    let url = await storage.ref(fullPath).getDownloadURL();
    console.log(url);
    setOpenFile(true)
    setUrl(url)
  }
  

  const handleCloseFile = () => {
    setOpenFile(false);
  }

  const handleDeleteFile = async (filePath) => {
    try {
      await confirm({
        variant: "danger",
        catchOnCancel: true,
        title: "Confirmação",
        description: `Você deseja deletar esse arquivo? Esta ação não pode ser desfeita.`,
      });
      setLoading(true);
      await storage.ref(filePath).delete()
      enqueueSnackbar('Arquivo deletado', {variant: 'success'})
      getData().then(filesArray => {
        setStudentFiles(filesArray)
        
      })
    } catch (error) {
      error && enqueueSnackbar(error.message, {variant: 'error'})
    }
    setLoading(false)
  }

  const handleUploadFile = async (e) => {
    setLoading(true);
    const files = e.target.files
    console.log(files)
    let filesArray = []
    for (const file of files) {
      filesArray.push(file)
    }
    Promise.all(
        filesArray.map(file => putStorageItem(file))
    )
    .then((url) => {
      console.log(`All success`, url)
      getData().then(filesArray => {
        setStudentFiles(filesArray)
        
      })
      enqueueSnackbar('Upload concluído com sucesso', {variant: 'success'})
      setLoading(false)
    })
    .catch((error) => {
      console.log(`Some failed: `, error.message)
      enqueueSnackbar(error.message, {variant: 'error'})
    });

    

    
  
    
    function putStorageItem(item) {
      // the return value will be a Promise
      return studentFilesRef.child(filesKey).child(item.name).put(item)
      .then((snapshot) => {
        console.log('One success:', item)
        enqueueSnackbar(`${item.name} enviado com sucesso`, {variant: 'info'})
      }).catch((error) => {
        console.log('One failed:', item, error.message)
      });
    }
  }

  const handleSetStudentPhoto = async (fullPath) => {
    setLoading(true)
    try {
      const strgRef = storage.ref(fullPath)
      let url = await strgRef.getDownloadURL();
      await studentsRef.child(studentId).child('fotoAluno').set(url)
      let metadata = await strgRef.getMetadata()
      console.log(metadata)
      enqueueSnackbar('Foto do aluno definida', {variant: 'success'})
    } catch (error) {
      console.log(error)
      enqueueSnackbar(error.message, {variant: 'error'})
    }
    setLoading(false)
  }

  const calculateTotalSize = () => {

    let bytes = 0
    studentFiles && studentFiles.map((file, i) => {
      bytes += Number(file.metadata.size)
    })

    let total = formatBytes(bytes)
    setTotalFilesSize(total)

  }

  const generate = (element) => {
    
    return  studentFiles ? studentFiles.map((file, i) => (
        cloneElement(element, {
          key: i,
          button: true,
          onClick: () => handleOpenFile(file.fullPath),
          size: file.metadata.size,
          name: file.name,
          onDelete: () => handleDeleteFile(file.fullPath),
          setStudentPhoto: () => handleSetStudentPhoto(file.fullPath)
        })

      )
        
    ) : (
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <FolderIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={'Nenhum arquivo encontrado.'}
          secondary={'Tente fazer o upload de arquivos do aluno. Eles aparecerão aqui.'}
        />
        
      </ListItem>
    )
      
  }

  const ListItemElem = (props) => {
    const { onClick, button, name, size, onDelete, setStudentPhoto} = props;

    return (
      
      <ListItem button={button} onClick={onClick}>
        
        <ListItemText
          primary={name}
          secondary={secondary ? formatBytes(size) : null}
        />
        <ListItemSecondaryAction>
          {(name.includes(".jpg") || name.includes(".png")) && (
            <Tooltip title="Definir como foto para o boletim do aluno">
              <IconButton edge="end" aria-label="delete" onClick={setStudentPhoto}>
                <Face />
              </IconButton>
            </Tooltip>
          
          )}
          <IconButton edge="end" aria-label="delete" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  return (
    <div className={classes.root}>
      <ShowFiles open={openFile} url={url} onClose={handleCloseFile} />
      <Box m={1}>
          <Button onClick={() => {
            document.getElementById('uploadFiles').click()
            
          }} variant="outlined" size="small" color="primary" fullWidth startIcon={<CloudUpload />}>Upload</Button>
        </Box>
        <Box m={1}>
          <Button onClick={() => {
            getData()
            
          }} variant="outlined" size="small" color="primary" fullWidth startIcon={<Refresh />}>Atualizar</Button>
          <input type="file" name="uploadFiles" id="uploadFiles" multiple style={{display: 'none'}} onInput={handleUploadFile} />
        </Box>
      {/* <FormGroup row>
         <FormControlLabel
          control={
            <Checkbox checked={dense} onChange={(event) => setDense(event.target.checked)} />
          }
          label="Lista densa"
        /> 
        
        
      </FormGroup> */}
      <Grid container spacing={1}>
        
        <Grid item xs={12} md={12}>
          
          <div className={classes.demo}>
             
            <List dense={dense} className={classes.list}>
              {loading && <LinearProgress />}
              {generate(
                <ListItemElem />
              )}
            </List>
              
            
          </div>
          <Typography color="textSecondary">
              Armazenamento utilizado: {totalFilesSize}
            </Typography>
        </Grid>
      </Grid>
    </div>
  );
}
