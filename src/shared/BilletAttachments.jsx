import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, LinearProgress, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles, Paper, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { CloudUpload, Delete, DeleteForever } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { useConfirmation } from "../contexts/ConfirmContext";
import { billetsDocsRef } from "../services/databaseRefs";
import { billetAttachmentsRef } from "../services/storageRefs";
import { formatBytes } from "./FunctionsUse";

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(1),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }));

const BilletAttachments = ({docKeyPath, open, setOpen}) => {

    const classes = useStyles();

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [ attachments, setAttachments ] = useState();
    const [ progress, setProgress ] = useState();
    const confirm = useConfirmation();

    useEffect(() => {
        if (docKeyPath) {
            const billetRef = billetsDocsRef.child(docKeyPath).child('attachments')
            billetRef.on('value', async (snapshot) => {
                if (snapshot.exists()) {
                    let attachmentsArray = [];
                    let localAttachments = snapshot.val();
                    for (const key in localAttachments) {
                        if (Object.hasOwnProperty.call(localAttachments, key)) {
                            let attachment = localAttachments[key];
                            attachment.databaseKey = key;
                            attachmentsArray.push(attachment);
                        }
                    }
                    setAttachments([...attachmentsArray]);
                    
                } else {
                    //enqueueSnackbar('Anexos não encontrados para este boleto.', {title: 'info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
                    setAttachments();
                }
            }, (error) => {
                enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
                console.log(error)
            })
        
        
            return () => {
                billetRef.off('value');
            }
        }
    }, [docKeyPath])

    const handleOpenAttachment = async (i) => {
        const link = attachments[i].link
        window.open(link, '_blank')
    }

    const handleUpload = (files) => {
        // Create the file metadata
        const file = files[0];
        console.log(file);
        var metadata = {
            contentType: file.type
        };
        
        // Upload file and metadata to the object 'images/mountains.jpg'
        var uploadTask = billetAttachmentsRef.child(docKeyPath + '/' +  file.name).put(file, metadata);
        
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
            (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    setProgress(progress)
                break;
                case 'running':
                    setProgress(progress)
                break;
            }
            },
            (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            console.log(error)
            switch (error.code) {
                case 'storage/unauthorized':
                // User doesn't have permission to access the object
                enqueueSnackbar('Você não possui permissões suficientes para enviar anexos.', {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
                break;
                case 'storage/canceled':
                // User canceled the upload
                enqueueSnackbar('Upload cancelado.', {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
                break;
        
                // ...
        
                case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
                break;
            }
            },
            () => {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log('File available at', downloadURL);
                billetsDocsRef.child(docKeyPath).child('attachments').push({name: file.name, link: downloadURL, size: file.size, type: file.type})
                setProgress()
            });
            }
        );
    }

    const handleDelete = async (name, databaseKey) => {
        try {
            await confirm({
                variant: "danger",
                catchOnCancel: true,
                title: "Confirmação",
                description: `Deseja deletar o anexo ${name}? Está ação não pode ser desfeita.`,
            });
            await billetAttachmentsRef.child(docKeyPath + '/' + name).delete()
            await billetsDocsRef.child(docKeyPath).child('attachments').child(databaseKey).remove()
            enqueueSnackbar('Anexo deletado.', {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        } catch (error) {
            error && enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
        }
        
    }


    function LinearProgressWithLabel(props) {
        return (
          <Box display="flex" alignItems="center">
            <Box width="100%" mr={1}>
              <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box minWidth={35}>
              <Typography variant="body2" color="textSecondary">{`${Math.round(
                props.value,
              )}%`}</Typography>
            </Box>
          </Box>
        );
      }

    return (
        <Fragment>
            <Dialog fullScreen={fullScreen} fullWidth open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Anexos</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Paper className={classes.paper}>
                        <div className={classes.demo}>
                            <List>
                            {attachments ? attachments.map((attachment, i) => (
                                <ListItem button onClick={() => handleOpenAttachment(i)}>
                                
                                <ListItemText
                                    primary={attachment.name}
                                    secondary={formatBytes(attachment.size)}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(attachment.name, attachment.databaseKey)}>
                                    <DeleteForever />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                            )) : (
                            <ListItem>
                                
                                <ListItemText
                                    primary={'Não existem anexos para este boleto'}
                                    
                                />
                                
                            </ListItem>
                            )}
                                
                            
                            </List>
                            <Button fullWidth variant="contained" color="primary" startIcon={<CloudUpload />} onClick={() => document.getElementById('filesUpload').click()}>Novo anexo</Button>
                            <input type="file" style={{display: 'none'}} id="filesUpload" onChange={(e) => handleUpload(e.target.files)} />
                            {progress && <LinearProgressWithLabel value={progress} />}
                        </div>
                        </Paper>
                    </Grid>
                    <Grid item xs={6}>
                        <Paper className={classes.paper}>xs=6</Paper>
                    </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}
 
export default BilletAttachments;