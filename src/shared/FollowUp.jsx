import { Fragment } from "react";
import FullScreenDialog from "./FullscreenDialog";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { LocaleText } from './DataGridLocaleText';
import { Container, Divider, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import { useEffect } from "react";
import { useState } from "react";
import { followUpRef } from "../services/databaseRefs";

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
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
      width: "300px",
    },
  }));

const FollowUp = ({isOpen, onClose}) => {

    const classes = useStyles();

    const [followUps, setFollowUps] = useState([]);
    const [filterModel, setFilterModel] = useState({
        items: [],
    });

    useEffect(() => {
        getData();
    }, [])

    const getData = async () => {
        const data = (await followUpRef.once('value')).val();
        setFollowUps(data);
        console.log(data)
    }

    const onRowClick = (e) => {
        console.log(e)
    }

    return (
        <Fragment>
            <FullScreenDialog
                    isOpen={isOpen}
                    onClose={onClose}
                    
                    onSave={() => {
                        
                        console.log(`Save clicked`)
                    }}
                    title={"FollowUp"}
                    saveButton={"Salvar"}
                    hideSaveButton
            >
                <div className={classes.container}>
                    
                        <div style={{ height: "80vh", width: '70vw',  }}>
                            <DataGrid 
                                filterModel={filterModel}
                                onFilterModelChange={(model) => setFilterModel(model)}
                                rows={followUps} 
                                columns={[
                                    {field: "id", headerName: "ID", width: 92, filterable: true},
                                    {field: "matricula", headerName: 'Matrícula', width: 140, filterable: true},
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
                            
                        
                            <Paper elevation={3} className={classes.paper}>
                                <Typography component={"h5"} variant={"h5"}>Título </Typography>
                                <Typography variant="body2" component="p" gutterBottom>
                                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatem sunt ratione dolorum fugit explicabo accusantium nam fuga voluptatibus placeat, magni aliquam optio deleniti itaque aut nulla doloremque. Velit, vitae adipisci?
                                </Typography>
                                <Divider />
                                <Typography variant="body2" color="textSecondary" component="p">
                                   Nome do Aluno
                                </Typography>
                                <Typography variant="body2" component="p" gutterBottom>
                                    Fulano da silva
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                   N° de Matrícula
                                </Typography>
                                <Typography variant="body2" component="p" gutterBottom>
                                    00000
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                   Autor
                                </Typography>
                                <Typography variant="body2" component="p" gutterBottom>
                                    Ciclano da Silva Sauros
                                </Typography>
                            </Paper>
                        
                </div>
                
            </FullScreenDialog>
        </Fragment>
    );
}
 
export default FollowUp;