import { Fragment } from "react";
import FullScreenDialog from "./FullscreenDialog";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { LocaleText } from './DataGridLocaleText';
import { Avatar, Box, Card, CardActions, CardContent, CardHeader, Collapse, Container, DialogTitle, Divider, Grid, IconButton, makeStyles, Paper, TextField, Tooltip, Typography } from "@material-ui/core";
import { useEffect } from "react";
import { useState } from "react";
import { followUpRef, studentsRef } from "../services/databaseRefs";
import { Add, AttachFile, ExpandMore, Favorite, More, MoreVert, Person, Share } from "@material-ui/icons";
import clsx from 'clsx'
import { set } from "date-fns/esm";
import { useAuth } from "../hooks/useAuth";
import { useConfirmation } from "../contexts/ConfirmContext";

const useStyles = makeStyles((theme) => ({
    root: {
      width: "100%",
      maxWidth: "70vw",
      minWidth: 350,
      
      height: "85vh",
    },
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      padding: "10px",
      flexWrap: "wrap",
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    smallCards: {
      minWidth: 275,
      maxWidth: 350,
      height: "84vh",
      marginLeft: "10px",
      width: "fit-content",
      marginBottom: "10px",
    },
    bigCards: {
      minWidth: 275,
      maxWidth: 600,
      height: "84vh",
      marginLeft: "10px",
      width: "100%",
      marginBottom: "10px",
    },
    textField: {
      minWidth: '99.8px',
      width: 'min-content'
    },
    fieldsContainer: {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: '10px',
      flexWrap: "wrap",
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    grades: {
      marginBottom: 3,
    },
    grid: {
      marginTop: 10,
      width: "100%",
    },
    list: {
      fontSize: 10,
    },
    avatar: {
      backgroundColor: '#3f51b5',
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    paper: {
      padding: theme.spacing(0.1),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
      width: "300px",
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
  }));

const FollowUp = ({isOpen, onClose, studentId}) => {

    const { user } = useAuth();
    const confirm = useConfirmation();
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);
    const handleExpandClick = (open=false) => {
      if (open === true) {
        setExpanded(open)
      } else {
        setExpanded(!expanded);
      }
      
    };

    const [followUps, setFollowUps] = useState([]);
    const [filterModel, setFilterModel] = useState({
        items: [{id: 55942, columnField: 'matricula', operatorValue: 'equals', value: studentId}],
    });
    const [selection, setSelection] = useState();
    const [disabled, setDisabled] = useState(true);
    const [avatarSrc, setAvatarSrc] = useState();
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        getData();
    }, [])

    useEffect(() => {
      console.log(filterModel)
  }, [filterModel])

    const getData = async () => {
        const snap = await followUpRef.once('value');
        const data = snap.val();
        if (snap.exists()) {
          setFollowUps(data);
        }
        
        console.log(data)
        setFilterModel({
          items: [{id: 55942, columnField: 'matricula', operatorValue: 'equals', value: studentId}],
        })
        //const info = (await studentsRef.child(studentId).once('value')).val();
    }

    const onRowClick = async (e) => {
        console.log(e)
        setSelection(e.row)
        const info = await studentsRef.child(e.row.matricula).once('value')
        const src = info.child('fotoAluno').val()
        console.log(src)
        setAvatarSrc(src)
        
        handleExpandClick(true)
        document.getElementById('title').value = e.row.titulo
        document.getElementById('description').value = e.row.descricao
        document.getElementById('author').value = e.row.autor
    }

    const handleEditing = async () => {
      if (editing) {
        setEditing(false)
        let followContent = selection;
        followContent.titulo = document.getElementById('title').value;
        followContent.descricao = document.getElementById('description').value;

        await followUpRef.child(selection.id).set(followContent)
        getData();
      } else {
        try {
          setEditing(true)
          handleExpandClick(true)
          let whichStudent = studentId
          if (!studentId) {
            whichStudent = await confirm({
              variant: "danger",
              catchOnCancel: true,
              title: "Confirmação",
              description: "Escolha o aluno para lançar o follow up.",
              promptStudent: true
          });
          console.log(whichStudent)
          }
          const studentName = (await studentsRef.child(whichStudent).child('nomeAluno').once('value')).val();
          setSelection({
            autor: user.name,
            descricao: "",
            id: followUps.length,
            matricula: whichStudent,
            nome: studentName,
            titulo: ""
          })
          document.getElementById('title').value = ''
          document.getElementById('description').value = ''
        } catch (error) {
            console.log(error)
        }
        
      }
    }

    return (
        <Fragment>
            <FullScreenDialog
                    isOpen={isOpen}
                    onClose={onClose}
                    
                    onSave={() => {
                        
                        handleEditing()
                    }}
                    title={"FollowUp"}
                    saveButton={editing ? "Salvar" : "Novo FollowUp"}
                    
            >
                <div className={classes.container}>
                    
                        <div style={{ height: "80vh", width: '70vw',  }}>
                            <DataGrid 
                                key={'354'}
                                filterModel={filterModel}
                                onFilterModelChange={(model) => setFilterModel(model)}
                                rows={followUps} 
                                columns={[
                                    {field: "id", headerName: "ID", width: 92, filterable: true},
                                    {field: "matricula", headerName: 'Matrícula', width: 140, filterable: true,},
                                    {field: "nome", width: 250, headerName: 'Nome', filterable: true},
                                    {field: "titulo", width: 250, headerName: 'Título', filterable: true},
                                    {field: "descricao", width: 250, headerName: 'Descrição', filterable: true},
                                    {field: "autor", width: 250, headerName: 'Autor', filterable: true},
                                ]} 
                                //rowHeight={rowHeight} 
                                components={{
                                    Toolbar: GridToolbar

                                }}
                                checkboxSelection
                                disableSelectionOnClick
                                
                                onRowClick={onRowClick} 
                                //disableColumnFilter={disableColmunFilter}
                                //disableColumnMenu={disableColumnMenu}
                                //disableColumnSelector={disableColumnSelector}
                                //disableExtendRowFullWidth={disableExtendRowFullWidth}
                                //disableSelectionOnClick={disableSelectionOnClick}
                                //hideFooter={hideFooter}
                                localeText={LocaleText}
                            />
                        </div>
                            
                              <Card className={classes.paper}>
                                
                                <CardHeader
                                  avatar={
                                    <Tooltip title={selection && selection.matricula}>
                                      <Avatar aria-label="recipe" className={classes.avatar} src={avatarSrc}>
                                        <Person />
                                      </Avatar>
                                    </Tooltip>
                                    
                                  }
                                  action={
                                    <IconButton aria-label="settings">
                                      <MoreVert />
                                    </IconButton>
                                  }
                                  title={selection && selection.nome}
                                  subheader={selection && selection.timestamp && new Date(selection.timestamp._seconds * 1000).toLocaleString()}
                                />
                                
                                <CardActions disableSpacing>
                                  {/* <Tooltip title="Anexar arquivo">
                                    <IconButton aria-label="share" disabled={!selection}>
                                      <AttachFile />
                                    </IconButton>
                                  </Tooltip> */}
                                  
                                 
                                  <IconButton
                                    className={clsx(classes.expand, {
                                      [classes.expandOpen]: expanded,
                                    })}
                                    onClick={handleExpandClick}
                                    aria-expanded={expanded}
                                    aria-label="show more"
                                  >
                                    <ExpandMore />
                                  </IconButton>
                                </CardActions>
                                <Collapse in={expanded} timeout="auto" unmountOnExit>
                                  <CardContent>
                                    <Box m={1}>
                                      <TextField InputProps={{readOnly: !editing}} id="title" InputLabelProps={{shrink: true}} fullWidth multiline label={'Título'}/>
                                    </Box>
                                    <Box m={1}>
                                      <TextField InputProps={{readOnly: !editing}} id="description" InputLabelProps={{shrink: true}} fullWidth multiline label={'Descrição'}/>
                                    </Box>
                                    <Box m={1}>
                                      <TextField InputProps={{readOnly: true}} id="author" InputLabelProps={{shrink: true}} fullWidth multiline label={'Autor'}/>
                                    </Box>
                                  </CardContent>
                                </Collapse>
                              </Card>
                            
                        
                </div>
                
            </FullScreenDialog>
        </Fragment>
    );
}
 
export default FollowUp;