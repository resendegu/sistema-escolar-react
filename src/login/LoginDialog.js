import { useState, Fragment, useRef } from "react";
import {
    TextField,
    Button,
    Typography,
    CircularProgress,
  } from "@material-ui/core";
import FormDialog from "../shared/FormDialog";

import { useAuth } from "../hooks/useAuth";
import { useSnackbar } from "notistack";

const LoginDialog = (props) => {
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
    const {enqueueSnackbar, closeSnackbar} = useSnackbar();

    const { signInWithEmailAndPassword, passwordRecover } = useAuth();

    const loginEmail = useRef();
    const loginPassword = useRef();

    const handlePasswordForgot = (async () => {
        if (loginEmail.current.value !== "") {
            try {
                await passwordRecover(loginEmail.current.value);
                enqueueSnackbar("E-mail enviado. Verifique sua caixa de entrada ou SPAM.", {title: 'Info', variant: 'info', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            
                
            } catch (error) {
                console.log(error)
                setStatus(error.code)
                enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
            }
        } else {
            setStatus('auth/user-not-found')
        }
        
    })

    const login = (async () => {
        setIsLoading(true);
        let email = loginEmail.current.value
        let password = loginPassword.current.value

        try {
            let user = await signInWithEmailAndPassword(email, password);
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
        
        
    
    })

    

    return (
        <Fragment>
            <FormDialog
                open={open}
                onClose={onClose}
                loading={isLoading}
                onFormSubmit={(e) => {
                    e.preventDefault();
                    login();
                }}
                headline="Entrar no Sistema"
                content={
                    <Fragment>
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
                              status === "auth/user-not-found" &&
                              "Verifique o endereço de e-mail."
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
                                <b>&quot;Esqueceu sua senha?&quot;</b> para redefini-la.
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
                        endIcon={isLoading && <CircularProgress />}
                        >
                        Login
                        
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
 
export default LoginDialog;