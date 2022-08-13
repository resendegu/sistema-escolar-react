import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function SimpleCard({title, textAboveBody, body, textUnderBody, buttonText, buttonAction, buttonStartIcon}) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" component="p">
          {textAboveBody}
        </Typography>
        {body}
        <Typography variant="body2" component="p">
          {textUnderBody}
        </Typography>
      </CardContent>
      <CardActions>
        <Button onClick={buttonAction} size="small" startIcon={buttonStartIcon}>{buttonText}</Button>
      </CardActions>
    </Card>
  );
}
