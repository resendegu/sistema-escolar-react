import { Button, Checkbox, Dialog, DialogActions, DialogContent, Select, TextField } from "@material-ui/core";
import { Fragment, useEffect, useState } from "react";
import { usersListRef } from "../services/databaseRefs";
import { grantAndRevokeAccess } from "./FunctionsUse";

const AdminCenter = ({isOpen}) => {
    const [ open, setOpen ] = useState(false);
    const [ userUid, setUserUid ] = useState();
    const [ access, setAccess ] = useState();
    const [ checked, setChecked ] = useState(false);
    const [ users, setUsers ] = useState();

    useEffect(() => {
        setOpen(true)
        usersListRef.once('value').then((snap) => {
            setUsers(snap.val())
        })
    }, [isOpen])

    const handleGrantAccess = async () => {
        try {
            console.log(userUid, access, checked)
            let result = await grantAndRevokeAccess(access, userUid, checked);
            console.log(result)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Fragment>
            <Dialog fullScreen open={open}>
                <DialogContent>
                    { users && <Select
                        native
                        value={userUid}
                        onChange={(e) => setUserUid(e.target.value)}
                    >
                        <option hidden selected>Escolha...</option>
                        {Object.keys(users).map((uid, i) => <option value={uid}>{users[uid].email}</option>)}
                    </Select>}
                    <TextField label="Acesso" value={access} onChange={(e) => setAccess(e.target.value)}/>
                    <Checkbox value={checked} onChange={(e) => setChecked(e.target.checked)} />
                    Conceder acesso

                    <Button onClick={handleGrantAccess}>Conceder acesso</Button>

                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Fechar</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}
 
export default AdminCenter;