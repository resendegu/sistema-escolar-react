import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@material-ui/core";
import { Fragment, useEffect, useState } from "react";
import { billetsDocsRef } from "../services/databaseRefs";
import { database } from "../services/firebase";


const WriteOffBillets = ({docId}) => {

    const [doc, setDoc] = useState();
    const [localDocId, setLocalDocId] = useState(docId);
    const [dialog, setDialog] = useState(false);

    useEffect(() => {
        if (localDocId) {
            getData(docId)
        } else {
            setDialog(true)
        }
    }, [docId])

    const getData = async () => {
        let localDoc
       
        const snapshot = await billetsDocsRef.orderByChild('numeroDoc').equalTo(localDocId).once('value')
        for (const docKey in snapshot.val()) {
            if (Object.hasOwnProperty.call(snapshot.val(), docKey)) {
                const localDoc = snapshot.val()[docKey];
                setDoc(localDoc)
            }
        }
        
    }

    const handleChangeDocId = (e) => {
        
        getData()
        setDialog(false)
    } 

    return (
        <Fragment>
                <Dialog open={dialog} onClose={() => setDialog(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Digite o número do documento do boleto</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Digite o número do Documento que se encontra em cada parcela para que o sistema encontre o débito no banco de dados
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Número do Documento"
                        type="number"
                        fullWidth
                        value={localDocId}
                        onChange={(e) => setLocalDocId(Number(e.target.value))}
                        autoComplete={false}
                        
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => setDialog(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleChangeDocId} color="primary">
                        Procurar
                    </Button>
                    </DialogActions>
                </Dialog>

                
        </Fragment>
    );
}
 
export default WriteOffBillets;