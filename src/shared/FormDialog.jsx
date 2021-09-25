import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, Box, withStyles, DialogTitle, IconButton } from "@material-ui/core";
import { Close } from "@material-ui/icons";


const styles = theme => ({
  dialogPaper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: theme.spacing(3),
    maxWidth: 420
  },
  actions: {
    marginTop: theme.spacing(2)
  },
  dialogPaperScrollPaper: {
    maxHeight: "none"
  },
  dialogContent: {
    paddingTop: 0,
    paddingBottom: 0
  }
});

/**
 * A Wrapper around the Dialog component to create centered
 * Login, Register or other Dialogs.
 */
function FormDialog(props) {
  const {
    classes,
    open,
    onClose,
    loading,
    headline,
    onFormSubmit,
    content,
    actions,
    hideBackdrop,
    handleClose,
    closeButton
  } = props;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableBackdropClick={loading}
      disableEscapeKeyDown={loading}
      classes={{
        paper: classes.dialogPaper,
        paperScrollPaper: classes.dialogPaperScrollPaper
      }}
      hideBackdrop={hideBackdrop ? hideBackdrop : false}
    >
      <div style={{width: '100%'}}>
      <DialogTitle>{headline}
      {closeButton && (
        <IconButton edge="start" color="inherit" style={{float: 'right'}} onClick={handleClose} aria-label="close">
          <Close />
        </IconButton>)}
      </DialogTitle>
        
      </div>
      
      <DialogContent className={classes.dialogContent}>
        
        <form onSubmit={onFormSubmit}>
          <div>{content}</div>
          <Box width="100%" className={classes.actions}>
            {actions}
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}

FormDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  headline: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  onFormSubmit: PropTypes.func.isRequired,
  content: PropTypes.element.isRequired,
  actions: PropTypes.element.isRequired,
  hideBackdrop: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(FormDialog);
