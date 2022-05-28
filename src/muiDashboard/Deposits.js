import React, { useEffect, useState } from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Title from './Title';
import { quickDataRef } from '../services/databaseRefs';

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
});



export default function Deposits() {
  const classes = useStyles();

  const [data, setData] = useState({});

  useEffect(() => {
    quickDataRef.once('value').then((snapshot) => {
      setData(snapshot.val())
    }).catch(error => {
      console.log(error)
    })
  }, [])

  return (
    <React.Fragment>
      <Title>Dados rápidos</Title>
      <Typography component="p" variant="h6">
        {data.students}
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        alunos ativos
      </Typography>
      <Typography component="p" variant="h6">
        {data.classes}
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        turmas criadas
      </Typography>
      <Typography component="p" variant="h6">
        {data.disabledStudents}
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        alunos desativados
      </Typography>
      {/* <div>
        <Link color="primary" href="#" onClick={preventDefault}>
          View balance
        </Link>
      </div> */}
    </React.Fragment>
  );
}