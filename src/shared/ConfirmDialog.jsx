import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
  } from "@material-ui/core";
import { useState } from "react";
  
  export const ConfirmationDialog = ({
    open,
    title,
    variant,
    description,
    onSubmit,
    onClose,
    promptText=false,
    promptLabel=''
  }) => {

    const [ text, setText ] = useState('')

    return (
      <Dialog open={open}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
          {promptText && <TextField onChange={(e) => setText(e.target.value)} label={promptLabel} fullWidth variant="outlined" />}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => onSubmit(text)}>
            Sim
          </Button>
          <Button color="primary" onClick={onClose} autoFocus>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  