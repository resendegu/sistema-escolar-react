import { AppBar, Backdrop, Button, Container, Dialog, IconButton, makeStyles, Slide, Toolbar, Typography } from "@material-ui/core";
import { Close, CloudDownload, Favorite, FileCopy, FontDownload, Print, Save, Share } from "@material-ui/icons";
import { forwardRef, Fragment, useState } from "react";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';


const useStyles = makeStyles((theme) => ({
    root: {
      height: 380,
      transform: 'translateZ(0px)',
      flexGrow: 1,
    },
    speedDial: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    appBar: {
        position: 'relative',
      },
    title: {
    marginLeft: theme.spacing(2),
    flex: 1,
    },
    iframe: {
        width: "100%",
        height: "80vh",
    },
    container: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        padding: "10px",
        flexWrap: "wrap",
    },
  }));

const actions = [
    { icon: <FileCopy />, name: 'Copy' },
    { icon: <CloudDownload />, name: 'Download' },
    { icon: <Print />, name: 'Imprimir' },
    { icon: <Share />, name: 'Compartilhar' },
    { icon: <Favorite />, name: 'Like' },
  ];

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ShowFiles = (props) => {

    const classes = useStyles()
    const { open, onClose, hideButton, onSave, url} = props

    console.log(url)

    const [openDial, setOpenDial] = useState(false);
    const [hidden, setHidden] = useState(false);

    const handleVisibility = () => {
        setHidden((prevHidden) => !prevHidden);
    };

    const handleOpen = () => {
        setOpenDial(true);
    };

    const handleClick = (action) => {
        if (action === 'Imprimir') {
            const fileIframe = document.getElementById('fileIframe')
            
            fileIframe.contentWindow.focus()
            fileIframe.contentWindow.print()
        }

        handleClose()
    }

    const handleClose = () => {
        setOpenDial(false);
    };
    return (
        <Fragment>
            <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                    <Close />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                    Visualizando arquivo
                    </Typography>

                   
                </Toolbar>
            </AppBar>
            <Fragment>
                <Container className={classes.container}>
                    <iframe src={url} frameborder="0" className={classes.iframe} title="Arquivo" name="fileIframe" id="fileIframe"></iframe>
                </Container>
               
            </Fragment>
            {!hideButton && (
            <div>
                <Backdrop open={openDial} />
                <SpeedDial
                    ariaLabel="Ações"
                    className={classes.speedDial}
                    hidden={hidden}
                    icon={<SpeedDialIcon />}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    open={openDial}
                >
                    {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipOpen
                        onClick={() => handleClick(action.name)}
                    />
                    ))}
                </SpeedDial>
            </div>
            )}
            </Dialog>
        </Fragment>
    );
}
 
export default ShowFiles;