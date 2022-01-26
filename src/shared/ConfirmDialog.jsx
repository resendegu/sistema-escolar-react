import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
  } from "@material-ui/core";
  
  export const ConfirmationDialog = ({
    open,
    title,
    variant,
    description,
    onSubmit,
    onClose
  }) => {
    return (
      <Dialog open={open}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={onSubmit}>
            Sim
          </Button>
          <Button color="primary" onClick={onClose} autoFocus>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  