import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';

export default function DateTimePicker(props) {
  // The first commit of Material-UI
  const [selectedDate, setSelectedDate] = React.useState(null);

  const { type, label, format, width, name, id, onChange, required, shrink } = props;

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onChange(date)
  };


  switch (type) {
      case 'date':
          return (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
              disableToolbar
              required={required}
              variant="dialog"
              format={format}
              margin="normal"
              id={id}
              label={label}
              name={name}
              style={{
                width: width,
              }}
              value={selectedDate}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
              InputLabelProps={{shrink: shrink,}}
            />
            </MuiPickersUtilsProvider>
          )
          
      
      case 'time':
        return (
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardTimePicker
              margin="normal"
              id="time-picker"
              label={label}
              value={selectedDate}
              style={{
                width: width,
              }}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label' : 'change time',
              }}
            />
          </MuiPickersUtilsProvider>
        )
  
      default:
          break;
  }

  // return (
  //   <MuiPickersUtilsProvider utils={DateFnsUtils}>
        
  //     <Grid container justifyContent="space-around">
        
  //       <KeyboardDatePicker
  //         margin="normal"
  //         id="date-picker-dialog"
  //         label="Date picker dialog"
  //         format="MM/dd/yyyy"
  //         value={selectedDate}
  //         onChange={handleDateChange}
  //         KeyboardButtonProps={{
  //           'aria-label': 'change date',
  //         }}
  //       />
  //       
  //     </Grid>
  //   </MuiPickersUtilsProvider>
  // );
}
