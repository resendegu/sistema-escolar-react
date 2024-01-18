import { useState, useCallback, Fragment, useRef } from "react";
import {
    TextField,
    Button,
    Checkbox,
    Typography,
    FormControlLabel,
    withStyles,
    CircularProgress,
    IconButton,
  } from "@material-ui/core";
import FormDialog from "../shared/FormDialog";
import { isLong } from "long";

import { useAuth } from "../hooks/useAuth";
import SimpleSnackbar from "../shared/Snackbar";
import DateTimePicker from "../shared/DateTimePicker";
import { Close } from "@material-ui/icons";

const SignUpDialog = (props) => {
    const {
        history,
        classes,
        onClose,
        openChangePasswordDialog,
    } = props;
    const [ isLoading, setIsLoading ] = useState(false); 
    const [ open, setOpen ] = useState(true);
    const [ status, setStatus ] = useState(null)
    const [ showSnack, setShowSnack ] = useState(false);
    const errorCodes = {
        "auth/wrong-password": (
            <span>
                Senha incorreta. Tente novamente ou clique em{" "}
                <b>&quot;Esqueceu sua senha?&quot;</b> para redefini-la.
            </span>
        ),
        "auth/email-already-in-use": (
            <span>
                E-mail já cadastrado. Tente novamente ou clique em{" "}
                <b>&quot;Esqueceu sua senha?&quot;</b> para redefini-la.
            </span>
        ),
        "auth/invalid-email": (
            <span>
                Digite um endereço de e-mail válido.
            </span>
        ),
        "auth/internal-error": (
            <span>
                Ocorreu um erro interno. Tente novamente e se o erro persistir entre em contato com o administrador.
            </span>
        ),
    }

    const { passwordRecover, createUserWithEmailAndPassword, signOut } = useAuth();

    const loginName = useRef();
    const loginEmail = useRef();
    const loginPassword = useRef();
    const loginPasswordConfirm = useRef();

    const handlePasswordForgot = (async () => {
        if (loginEmail.current.value !== "") {
            try {
                await passwordRecover(loginEmail.current.value);
                setShowSnack(true);
            
                
            } catch (error) {
                console.log(error)
                setStatus(error.code)
            }
        } else {
            setStatus('auth/user-not-found')
        }
        
    })

    const handleClose = () => {
        setOpen(false);
    }

    const signUp = (async () => {
        setIsLoading(true);
        let name = loginName.current.value
        let email = loginEmail.current.value
        let password = loginPassword.current.value
        let confirmPassword = loginPasswordConfirm.current.value
        
        if (password === confirmPassword) {
            try {
                let user = await createUserWithEmailAndPassword(email, password, name);
                console.log(user)
    
                if (user) {
                    setOpen(false)
                    setIsLoading(false)
                } else {
                    setIsLoading(false)
                }
            } catch (error) {
                console.log(error)
                setStatus(error.code)
                setIsLoading(false)
            }
        } else {
            setStatus('passwordsDoNotMatch');
            setIsLoading(false)
        }

        
        
        
    
    })


    

    return (
        <Fragment>
            {showSnack ? (
                <SimpleSnackbar 
                    duration={10000} 
                    message={'Um e-mail foi enviado para você com um link para recuperação.'} 
                    closeButtonLabel={'Ok'}
                    isOpen={true}
                    onClose={setShowSnack(false)}
                />
            ) : ""
            
            }
            
            <FormDialog
                open={open}
                onClose={onClose}
                loading={isLoading}
                handleClose={handleClose}
                closeButton={true}
                onFormSubmit={(e) => {
                    e.preventDefault();
                    signUp();
                }}
                headline="Criar conta"
                content={
                    <Fragment>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            label="Nome e Sobrenome"
                            inputRef={loginName}
                            autoFocus
                            autoComplete="off"
                            type="text"
                        />

                        <TextField
                            variant="outlined"
                            margin="normal"
                            error={status === "auth/user-not-found"}
                            required
                            fullWidth
                            label="E-mail"
                            inputRef={loginEmail}
                            autoFocus
                            autoComplete="off"
                            type="email"
                            onChange={() => {
                              if (status === "auth/user-not-found") {
                                setStatus(null);
                              }
                            }}
                            helperText={
                              status && errorCodes[status]
                            }
                            FormHelperTextProps={{ error: true }}
                        />

                       <TextField 
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            error={status === "auth/wrong-password"}
                            label="Senha"
                            type="password"
                            inputRef={loginPassword}
                            autoComplete="off"
                            onChange={() => {
                            if (status === "auth/wrong-password") {
                                setStatus(null);
                            }
                            }}
                            helperText={
                            status === "auth/wrong-password" ? (
                                <span>
                                Senha incorreta. Tente novamente ou clique em{" "}
                                <b>&quot;Esqueçeu sua senha?&quot;</b> para redefini-la.
                                </span>
                            ) : (
                                ""
                            )
                            }
                        
                        />

                        <TextField 
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            error={status === "passwordsDoNotMatch"}
                            label="Confirme a Senha"
                            type="password"
                            inputRef={loginPasswordConfirm}
                            autoComplete="off"
                            onChange={() => {
                            if (status === "passwordsDoNotMatch") {
                                setStatus(null);
                            }
                            }}
                            helperText={
                            status === "passwordsDoNotMatch" ? (
                                <span>
                                
                                <b>Senhas não conferem</b>
                                </span>
                            ) : (
                                ""
                            )
                            }
                        
                        />

                    </Fragment>
                }

                actions={
                    <Fragment>
                        <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="secondary"
                        disabled={isLoading}
                        size="large"
                        >
                        Criar conta
                        {isLoading && <CircularProgress />}
                        </Button>
                        <Typography
                            align="center"
                            style={{
                                cursor: 'pointer',
                            }}
                            color="primary"
                            onClick={isLoading ? null : handlePasswordForgot}
                            tabIndex={0}
                            role="button"
                            onKeyDown={(event) => {
                                // For screenreaders listen to space and enter events
                                if (
                                (!isLoading && event.keyCode === 13) ||
                                event.keyCode === 32
                                ) {
                                handlePasswordForgot();
                                }
                            }}
                            >
                            Esqueceu sua senha?
                        </Typography>
                    </Fragment>
                }
            />


            
        </Fragment>
    );
}
 
export default SignUpDialog;