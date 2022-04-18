import { useState, Fragment, useRef, useEffect, useReducer } from "react";
import {
    TextField,
    Button,
    Typography,
    CircularProgress,
    makeStyles,
    CssBaseline,
    Container,
    DialogActions,
    Grid,
    Checkbox,
    FormControlLabel,
    Dialog,
    Avatar,
    IconButton,
    Tooltip,
    Backdrop,
  } from "@material-ui/core";
import FormDialog from "../shared/FormDialog";
import { useFilePicker } from 'use-file-picker';
import { useAuth } from "../hooks/useAuth";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import { AccountCircle, Camera, CameraAlt, Close, Edit, Save, VerifiedUser } from "@material-ui/icons";
import { usersRef } from "../services/storageRefs";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { accessVerification } from "../shared/FunctionsUse";
import AdminCenter from "../shared/AdminCenter";

const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
      width: 150,
      height: 150,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    backdrop: {
      zIndex: theme.zIndex.tooltip + 1,
      color: '#fff',
    },
    button: {
      marginBottom: '10px',
    }
  }));

const AccountCenter = ({history, onClose, openChangePasswordDialog}) => {
    const classes = useStyles();
    const { signOut, updatePhoto, updateName, sendEmailVerification, passwordRecover } = useAuth();
    const [ isLoading, setIsLoading ] = useState(false);
    const [ verifyingAccess, setVerifyingAccess ] = useState(false); 
    const [ open, setOpen ] = useState(true);
    const [ status, setStatus ] = useState(null)
    const [ showSnack, setShowSnack ] = useState(false);
    const [ showUpdateName, setShowUpdateName ] = useState(false);
    const [ photoBackdrop, setPhotoBackdrop ] = useState(false);
    const [ isAdmin, setIsAdmin ] = useState(false);
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    const [ openAdmin, setOpenAdmin ] = useState(false);

    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
      if (user) {
        verifyAdminAccess()
      }
    }, [user])

    const verifyAdminAccess = async () => {
      try {
        setVerifyingAccess(true)
        await accessVerification('master');
        setIsAdmin(true);
      } catch (error) {
        setIsAdmin(false);
      }
      setVerifyingAccess(false)
    }
    

    const handleChangePhoto = async (files) => {
        try {
            setIsLoading(true)
            const upload = await usersRef.child(user.uid).child('profilePic').put(files[0]);
            const photo = await usersRef.child(user.uid).child('profilePic').getDownloadURL();
            console.log(photo)
            await updatePhoto(photo)
            enqueueSnackbar("Foto trocada. Atualize a página.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        } catch (error) {
            enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            console.log(error)
        }
        setIsLoading(false);
        
    }

    const handleUpdateName = async (name) => {
      try {
        setIsLoading(true);
        await updateName(name);
        setShowUpdateName(false);
        setIsLoading(false);
        enqueueSnackbar("Nome atualizado com sucesso. Atualize a página.", {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> });
      } catch (error) {
        enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> });
        console.log(error);
      }
      setIsLoading(false);
    }

    const handleEmailVerification = async () => {
      try {
        setIsLoading(true);
        await sendEmailVerification();
        enqueueSnackbar("E-mail de verificação enviado. Verifique sua caixa de entrada ou SPAM.", {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> });
      } catch (error) {
        enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> });
        console.log(error);
      }
      setIsLoading(false);
    }

    const handlePasswordRecover = async () => {
      try {
        setIsLoading(true);
        await passwordRecover(user.email);
        enqueueSnackbar("E-mail para alteração de senha enviado. Verifique sua caixa de entrada ou SPAM.", {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button>})
      } catch (error) {
        enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> });
        console.log(error);
      }
      setIsLoading(false);
    }

    const handleOpenAdminCenter = () => {
      setOpenAdmin(true);
    }
    
    return (
        <Fragment>
            <Backdrop className={classes.backdrop} open={isLoading}>
              <CircularProgress color="inherit" />
            </Backdrop>
            <AdminCenter isOpen={openAdmin} onClose={() => setOpenAdmin(false)}/>
            <Dialog open={open} onClose={onClose}>
                <Container component="main" maxWidth="xs">
                    <div className={classes.paper}>
                        <Avatar className={classes.avatar} onMouseOut={() => setPhotoBackdrop(false)} onMouseOver={() => setPhotoBackdrop(true)}>
                            <IconButton onClick={() => document.getElementById('alteraFoto').click()}>
                            {photoBackdrop && <CameraAlt />}
                                {user && 'photoURL' in user ? (<img src={user.photoURL} style={{width: "150px", borderRadius: '50%',}} alt=""/>) : <AccountCircle />} 
                            </IconButton>
                            
                        </Avatar>
                        <Tooltip title={'Clique para editar o nome'}>
                          <Typography component="h1" variant="h5" onClick={() => setShowUpdateName(true)}>
                              {showUpdateName ? (
                                <>
                                <TextField type="text" focused label="Nome" placeholder="Digite seu nome..." defaultValue={user.displayName} onBlur={(e) => handleUpdateName(e.target.value)} />
                                <IconButton style={{float: 'right'}} onClick={(e) => setShowUpdateName(false)}>
                                  <Save fontSize="small" />
                                </IconButton>
                                </>
                              ) : user && user.displayName} 
                              {/* <IconButton style={{float: 'right'}} onClick={}>
                                {showUpdateName ? <Save fontSize="small" /> : <Edit fontSize="small" />}
                              </IconButton> */}
                              
                          </Typography>
                          
                        </Tooltip>
                        <Typography component="h2" variant="h6">{user && user.email} {user && (user.emailVerified ? <Tooltip title="E-mail verificado."><VerifiedUser htmlColor="lightgreen" /></Tooltip> : (
                          <Tooltip title="E-mail não verificado. Clique aqui para verificar e-mail.">
                            <IconButton onClick={() => handleEmailVerification()}>
                              <Close color="error" />
                            </IconButton>
                          </Tooltip>
                          
                        ))}</Typography>
                        
                        <input type="file" accept="image/*" name="foto" id="alteraFoto" style={{visibility: 'hidden'}} onChange={(e) => handleChangePhoto(e.target.files)} />
                        <Button fullWidth className={classes.button} onClick={handlePasswordRecover}>Alterar minha senha</Button>
                        <Button fullWidth className={classes.button} onClick={() => signOut()} color="secondary" variant="contained">Sair</Button>
                        <Button fullWidth className={classes.button} variant="contained" color="primary" disabled={!isAdmin} onClick={handleOpenAdminCenter}>Central do administrador {verifyingAccess && <CircularProgress color="secondary" style={{float: 'right'}} size={20} />}</Button>
                        
                        
                    </div>
                </Container>
                <DialogActions>
                    <Button onClick={onClose}>Fechar</Button>
                </DialogActions>
            </Dialog>
            
        </Fragment>
    );
}
 
export default AccountCenter;