import { Avatar, Box, Button, Card, CardActions, CardContent, Container, Divider, Grid, List, ListItem, ListItemText, makeStyles, Typography } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { AccountBox, Assignment, Assistant, AttachFile, ChromeReaderMode, Description, DoneAll, Edit, Person, Print, School, SupervisedUserCircle, TransferWithinAStation } from "@material-ui/icons";
import { Fragment, useEffect, useState } from "react";

import { classesRef } from '../services/databaseRefs'
import StudentFiles from "./StudentFiles";

const useStyles = makeStyles({
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
    }
  });

const StudentInfo = (props) => {

    const { studentData } = props;
    const classes = useStyles();

    const classCode = studentData.turmaAluno


    const [academicData, setAcademicData] = useState();
    const [currentGrade, setCurrentGrade] = useState('Notas não lançadas');

    useEffect(() => {
      const getData = async () => {
        try {
          let data = await classesRef.child(classCode).child('alunos').child(studentData.matriculaAluno).once('value');
          console.log(data.val());
          data.val().notas && setAcademicData(data.val());
          data.val().notas && calculateGrade(data.val().notas)
        } catch (error) {
          console.log(error)
        }
        
      }
      getData();
      
    })

    const calculateGrade = (grades) => {
      let finalGrade = 0;
      for (const name in grades) {
        if (Object.hasOwnProperty.call(grades, name)) {
          const grade = grades[name];
          finalGrade += Number(grade);
        }
      }
      setCurrentGrade(finalGrade);
    }



    return ( 
        <Fragment>
            
              <div className={classes.container}>
                <Card className={classes.smallCards} variant="outlined" >
                  <CardContent>
                  <Grid 
                      justifyContent="flex-start"
                      direction="row"
                      container
                      spacing={1}
                    >
                      <Grid item>
                        <Avatar className={classes.orange} className={classes.avatar}>
                          <AccountBox />
                        </Avatar>
                      </Grid>

                      <Grid item>
                        <Typography variant="h5" component="h2">
                          Dados do Aluno
                        </Typography>
                        
                        
                      </Grid>
                    </Grid>
                    <hr />
                    <Typography className={classes.title} color="textPrimary" gutterBottom>
                      {studentData.nomeAluno}
                    </Typography>
                    <Grid 
                      justifyContent="flex-start"
                      direction="row"
                      container
                      spacing={1}
                    >
                      <Grid item>
                        <Avatar alt={studentData.nomeAluno} variant="rounded" src={studentData.fotoAluno} style={{width: '3cm', height: '4cm',}} className={classes.orange} />
                      </Grid>

                      <Grid item>
                        <Typography className={classes.pos} color="textSecondary">
                          Matrícula: {studentData.matriculaAluno}
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">
                          Nascimento: {studentData.dataNascimentoAluno.split('-').reverse().join('/')}
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">
                          CPF: {studentData.cpfAluno}
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">
                          RG: {studentData.rgAluno}
                        </Typography>
                        
                      </Grid>
                    </Grid>
                    
             
                    <List component="nav" aria-label="informações adicionais do aluno">
                      <ListItem>
                        <ListItemText className={classes.list}>Email: {studentData.emailAluno} </ListItemText>
                      </ListItem>
                      <Divider />
                      <ListItem divider>
                        <ListItemText>Telefone: {studentData.telefoneAluno}</ListItemText>
                      </ListItem>
                      <ListItem>
                        <ListItemText>Celular: {studentData.celularAluno}</ListItemText>
                      </ListItem>
                      <Divider light />
                      <ListItem>
                        <ListItemText> Endereço: {studentData.enderecoAluno}, {studentData.numeroAluno}, {studentData.bairroAluno}, {studentData.cidadeAluno}, {studentData.estadoAluno}, CEP: {studentData.cepAluno} </ListItemText>
                      </ListItem>
                    </List>

                    
                  </CardContent>
                  
                </Card>
             
                
                  
                    <Card className={classes.smallCards} variant="outlined">
                      <CardContent>
                      <Grid 
                      justifyContent="flex-start"
                      direction="row"
                      container
                      spacing={1}
                    >
                      <Grid item>
                        <Avatar className={classes.orange} className={classes.avatar}>
                          <Assistant />
                        </Avatar>
                      </Grid>

                      <Grid item>
                        <Typography variant="h5" component="h2">
                          Ações
                        </Typography>
                        
                        
                      </Grid>
                    </Grid>
                      <hr />
                      <Box  m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<TransferWithinAStation />}>Transferir</Button>
                      </Box>
                      <Box  m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Edit />}>Editar dados</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<DoneAll />}>Checklist</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Description />}>Contratos</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Print />}>Ficha de Matrícula</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<Assignment />}>Follow Up</Button>
                      </Box>
                      <Box m={1}>
                        <Button fullWidth size="large" variant="contained" color="primary" startIcon={<SupervisedUserCircle />}>Responsáveis</Button>
                      </Box>
                      
                      
                      </CardContent>
                      
                    </Card>
                  

                  
                    <Card className={classes.smallCards} variant="outlined">
                      <CardContent>
                      <Grid 
                        justifyContent="flex-start"
                        direction="row"
                        container
                        spacing={1}
                      >
                        <Grid item>
                          <Avatar className={classes.orange} className={classes.avatar}>
                            <School />
                          </Avatar>
                        </Grid>

                        <Grid item>
                          <Typography variant="h5" component="h2">
                            Dados acadêmicos
                          </Typography>
                          
                          
                        </Grid>
                      </Grid>
                      <hr />
                        
                        
                        <Typography className={classes.pos} color="textSecondary">
                          Turma atual: {classCode}
                        </Typography>
                        
                        <Typography variant="h6" component="h6">
                            Notas de Desempenho
                        </Typography>
                        {academicData ? Object.keys(academicData.desempenho).map((name, i) => (
                          <Typography className={classes.grades} color="textSecondary">
                            {name}: {academicData.desempenho[name]}
                          </Typography>
                        )) : 'Notas não lançadas'}
                        <Typography variant="h6" component="h6">
                            Somatório Geral
                        </Typography>
                        <Typography className={classes.grades} color="textSecondary">
                            Nota final: {currentGrade}
                        </Typography>
                        <Typography variant="h6" component="h6">
                            Faltas Registradas
                        </Typography>
                        {academicData ? Object.keys(academicData.frequencia).map((name, i) => {
                          let date = new Date(name)
                          let dateConverted = date.toISOString().substring(0, 10).split('-').reverse().join('/')
                          return (
                          <Typography className={classes.grades} color="textSecondary">
                            {i + 1}: {dateConverted}
                          </Typography>
                        )}) : 'Não há registro de faltas'}
                      </CardContent>
                      <CardActions>
                        <Button size="small" variant='outlined' color="primary" fullWidth startIcon={<ChromeReaderMode />}>Acessar histórico escolar</Button>
                      </CardActions>
                    </Card>
                  
                  
                  
                    <Card className={classes.smallCards} variant="outlined">
                      <CardContent>
                      <Grid 
                        justifyContent="flex-start"
                        direction="row"
                        container
                        spacing={1}
                      >
                        <Grid item>
                          <Avatar className={classes.orange} className={classes.avatar}>
                            <AttachFile />
                          </Avatar>
                        </Grid>

                        <Grid item>
                          <Typography variant="h5" component="h2">
                            Arquivos
                          </Typography>
                          
                          
                        </Grid>
                      </Grid>
                      <hr />
                      
                        <StudentFiles studentId={studentData.matriculaAluno} />
                        
                      </CardContent>
                      <CardActions>
                        <Button size="small"></Button>
                      </CardActions>
                    </Card>
                  

                  
                  
                
              
             </div>
         
            
          
          
            
            
            
        </Fragment>
     );
}
 
export default StudentInfo;