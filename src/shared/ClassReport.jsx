import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';
import { functions } from '../services/firebase';
import { classesRef, performanceGradesRef, schoolInfoRef } from '../services/databaseRefs';

const useStyles = makeStyles({
 table: {
   
 }
  
});



export default function ClassReport({classCode, open, onClose}) {
  const classes = useStyles();

  const [timeString, setTimeString] = useState('');
  const [performanceTotalSum, setPerformanceTotalSum] = useState(0);
  const rows = [
      {num: 1, name: 'Gustavo Resende Almeida', notas1: 54, notas2: 46, total: 100, faltas: 2}
  ];

  const getData = async () => {
    let timestampFunction = functions.httpsCallable('timestamp');
    const data = (await timestampFunction()).data;
    console.log(data.timestamp);
    let now = new Date(data.timestamp._seconds * 1000);
    const string = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    setTimeString(string);
    const classRef = classesRef.child(classCode);
    
    const schoolInfo = (await schoolInfoRef.once('value')).val();
    const classInfo = (await classRef.once('value')).val();
    const performanceGrades = (await performanceGradesRef.once('value')).val()
    let localPerformanceSum = 0;
    for (const gradeName in performanceGrades) {
        if (Object.hasOwnProperty.call(performanceGrades, gradeName)) {
            const grade = performanceGrades[gradeName];
            localPerformanceSum += grade;
        }
    }
    setPerformanceTotalSum(localPerformanceSum);
  }

  useEffect(() => {getData()}, [classCode])
  
  

  return (
      <Dialog open={open} fullScreen>
          <DialogTitle>
            NOTAS E FALTAS LANÇADAS PARA A TURMA
            <label style={{float: "right", fontSize: "x-small"}}>Data e hora de emissão: {timeString}</label>
          </DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table className={classes.table} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                        <TableCell>Nº</TableCell>
                        <TableCell>Aluno</TableCell>
                        <TableCell align="right">Notas1</TableCell>
                        <TableCell align="right">Notas2</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Faltas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.num}>
                        <TableCell component="th" scope="row">
                            {row.num}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.notas1}</TableCell>
                        <TableCell align="right">{row.notas2}</TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                        <TableCell align="right">{row.faltas}</TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </TableContainer>
          </DialogContent>
        
        <DialogActions><Button id='noprint' onClick={() => window.print()}>Imprimir/PDF</Button><Button id='noprint' onClick={() => onClose(false)}>Fechar</Button></DialogActions>
      </Dialog>
    
  );
}
