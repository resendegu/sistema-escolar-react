import { Button, Checkbox, createTheme, darken, Dialog, DialogActions, DialogContent, DialogTitle, lighten, makeStyles, Select, TextField } from "@material-ui/core";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useSnackbar } from "notistack";
import { Fragment, useEffect, useState } from "react";
import { usersListRef } from "../services/databaseRefs";
import { LocaleText } from "./DataGridLocaleText";
import { grantAndRevokeAccess } from "./FunctionsUse";
import { useConfirmation } from "../contexts/ConfirmContext";

function getThemePaletteMode(palette) {
    return palette.type || palette.mode;
  }

  
  
  const defaultTheme = createTheme();
  const useStyles = makeStyles(
    (theme) => {
      const getBackgroundColor = (color) =>
        getThemePaletteMode(theme.palette) === 'dark'
          ? darken(color, 0.6)
          : lighten(color, 0.6);
  
      const getHoverBackgroundColor = (color) =>
        getThemePaletteMode(theme.palette) === 'dark'
          ? darken(color, 0.5)
          : lighten(color, 0.5);
  
      return {
        root: {
          '& .super-app-theme--Open': {
            backgroundColor: getBackgroundColor(theme.palette.info.main),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor(theme.palette.info.main),
            },
          },
          '& .super-app-theme--Filled': {
            backgroundColor: getBackgroundColor(theme.palette.success.main),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor(theme.palette.success.main),
            },
          },
          '& .super-app-theme--PartiallyFilled': {
            backgroundColor: getBackgroundColor(theme.palette.warning.main),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor(theme.palette.warning.main),
            },
          },
          '& .super-app-theme--true': {
            backgroundColor: getBackgroundColor(theme.palette.error.main),
            '&:hover': {
              backgroundColor: getHoverBackgroundColor(theme.palette.error.main),
            },
          },
        },
      };
    },
    { defaultTheme },
  );

const AdminCenter = ({isOpen, onClose}) => {

    const classes = useStyles();

    const confirm = useConfirmation();

    const {enqueueSnackbar, closeSnackbar} = useSnackbar();
    
    const [ userUid, setUserUid ] = useState();
    const [ access, setAccess ] = useState();
    const [ checked, setChecked ] = useState(false);
    const [ users, setUsers ] = useState();
    const [ filterModel, setFilterModel ] = useState({
        items: [],
    });
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            let usersArray = []
            usersListRef.on('value', (snap) => {
                for (const uid in snap.val()) {
                    if (Object.hasOwnProperty.call(snap.val(), uid)) {
                        let user = snap.val()[uid];
                        user.id = uid
                        const accesses = user.acessos
                        for (const access in accesses) {
                            if (Object.hasOwnProperty.call(accesses, access)) {
                                const status = accesses[access];
                                user[access] = status
                            }
                        }
                        usersArray.push(user)
                        
                    }
                }
                setUsers([...usersArray])
                setLoading(false)
            }, (error) => {
                console.log(error)
            })

            return () => {
                usersListRef.off();
            }
        }
        
    }, [isOpen])

    const handleRowEdit = async (e) => {
        console.log(e);
        setLoading(true)
        const access = e.field
        
        const uid = e.id
        const checked = e.value
        try {

            access === 'master' && await confirm({
              variant: "danger",
              catchOnCancel: true,
              title: "Confirmação",
              description: `Cuidado. Você está editando o acesso MASTER do usuário. Deseja alterar o acesso MASTER deste usuário?`,
            });
            const result = await grantAndRevokeAccess(access, uid, checked)
            console.log(result)
            enqueueSnackbar(result.acesso, {title: 'Sucesso', variant: 'success', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        } catch (error) {
            console.log(error)
            error && enqueueSnackbar(error.message, {title: 'Erro', variant: 'error', key:"0", action: <Button onClick={() => closeSnackbar('0')} color="inherit">Fechar</Button> })
        }
        setLoading(false)
    }

    const handleRowSelection = async (e) => {
        console.log(e);
    }

    const handleRowClick = async (e) => {
        console.log(e);
    }

    return (
        <Fragment>
            <Dialog fullScreen open={isOpen} onClose={onClose}>
                <DialogTitle>Controle de acessos e privilégios</DialogTitle>
                <DialogContent>
                <div style={{ height: "75vh", width: '100%' }} className={classes.root}>
                        {users && <DataGrid 
                            filterModel={filterModel}
                            onFilterModelChange={(model) => setFilterModel(model)}
                            rows={users} 
                            columns={
                                [
                                    {field: 'email', headerName: 'Email', width: 300},
                                    {field: 'master', headerName: 'Master', type: 'boolean', width: 180, editable: true},
                                    {field: 'adm', headerName: 'Administração', type: 'boolean', width: 180, editable: true},
                                    {field: 'professores', headerName: 'Professores', type: 'boolean', width: 180, editable: true},
                                    {field: 'secretaria', headerName: 'Secretaria', type: 'boolean', width: 180, editable: true},
                                    {field: 'aluno', headerName: 'Aluno', type: 'boolean', width: 180, editable: true}
                                ]
                            } 
                            disableSelectionOnClick 
                            checkboxSelection
                            components={{
                                Toolbar: GridToolbar

                            }}
                            onCellEditCommit={handleRowEdit}
                            loading={loading}
                            localeText={LocaleText}
                            onSelectionModelChange={handleRowSelection}
                            onRowClick={handleRowClick}
                            getRowClassName={(params) => {
                                console.log(`super-app-theme--${params.getValue(params.id, 'disabled')}`)
                                return `super-app-theme--${params.getValue(params.id, 'disabled')}`
                            }
                            }

                        />}
                    </div>

                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}
 
export default AdminCenter;