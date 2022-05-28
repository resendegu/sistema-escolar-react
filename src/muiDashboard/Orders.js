import React, { useEffect, useState } from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';
import { quickDataRef } from '../services/databaseRefs';
import { TableFooter } from '@material-ui/core';

// Generate Order Data
function createData(id, date, name, since, email) {
  return { id, date, name, since, email };
}


function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Orders() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let localRows = []
    quickDataRef.child('aniversaries').once('value').then((snapshot) => {
      let aniver = snapshot.val()
      if (snapshot.exists()) {
        setRows([...aniver])
      } else {
        setRows([])
      }
      
      console.log(localRows)
    })
    
  }, [])


  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Aniversariantes do mês 🥳</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Dia</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Na escola desde</TableCell>
            <TableCell>E-mail</TableCell>
            {/* <TableCell align="right">Sale Amount</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.birthDate.split('-')[2]}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.studentSince}</TableCell>
              <TableCell>{row.email}</TableCell>
              {/* <TableCell align="right">{row.amount}</TableCell> */}
            </TableRow>
          ))}
          {rows.length === 0 && <TableFooter>Não foram encontrados alunos aniversariantes neste mês.</TableFooter>}
        </TableBody>
      </Table>
      {/* <div className={classes.seeMore}>
        <Link color="primary" href="#" onClick={preventDefault}>
          See more orders
        </Link>
      </div> */}
    </React.Fragment>
  );
}