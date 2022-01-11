import Calendar from '@toast-ui/react-calendar';
import { useEffect } from 'react';
import { useRef } from 'react';
import { Fragment } from 'react';
import 'tui-calendar/dist/tui-calendar.css';

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';


const TuiCalendar = () => {
    const calendarRef = useRef();

    // register templates
  

    useEffect(() => {
      console.log(calendarRef.current)
    }, [calendarRef])

  const handleSelect = (e) => {
    console.log(e)
  }

    return (
        <Fragment>

            <Calendar
                ref={calendarRef}
                height="600px"
                onClickDayname={handleSelect}
                calendars={[
                  {
                    id: '0',
                    name: 'Private',
                    bgColor: '#9e5fff',
                    borderColor: '#9e5fff'
                  },
                  {
                    id: '1',
                    name: 'Company',
                    bgColor: '#00a9ff',
                    borderColor: '#00a9ff'
                  }
                ]}
                disableDblClick={true}
                disableClick={false}
                isReadOnly={false}
                
                month={{
                  startDayOfWeek: 0
                }}
                schedules={[
                  {
                    id: '1',
                    calendarId: '0',
                    title: 'TOAST UI Calendar Study',
                    category: 'time',
                    dueDateClass: '',
                    start: '',
                    end: ''
                  },
                  {
                    id: '2',
                    calendarId: '0',
                    title: 'Practice',
                    category: 'milestone',
                    dueDateClass: '',
                    start: '',
                    end: '',
                    isReadOnly: true
                  },
                  {
                    id: '3',
                    calendarId: '0',
                    title: 'FE Workshop',
                    category: 'allday',
                    dueDateClass: '',
                    start: '',
                    end: '',
                    isReadOnly: true,
                    
                  },
                  {
                    id: '4',
                    calendarId: '0',
                    title: 'Report',
                    category: 'time',
                    
                    recurrenceRule: 'every week on Wednesday, Friday for 30 times'
                  }
                ]}
                scheduleView
                taskView
                
                template={{
                  milestone(schedule) {
                    return `<span style="color:#fff;background-color: ${schedule.bgColor};">${
                      schedule.title
                    }</span>`;
                  },
                  milestoneTitle() {
                    return 'Milestone';
                  },
                  allday(schedule) {
                    return `${schedule.title}<i class="fa fa-refresh"></i>`;
                  },
                  alldayTitle() {
                    return 'All Day';
                  },
                  popupIsAllDay: function() {
                    return 'Dia todo';
                  },
                  popupStateFree: function() {
                    return 'Free';
                  },
                  popupStateBusy: function() {
                    return 'Busy';
                  },
                  titlePlaceholder: function() {
                    return 'Subject';
                  },
                  locationPlaceholder: function() {
                    return 'Location';
                  },
                  startDatePlaceholder: function() {
                    return 'Start date';
                  },
                  endDatePlaceholder: function() {
                    return 'End date';
                  },
                  popupSave: function() {
                    return 'Save';
                  },
                  popupUpdate: function() {
                    return 'Update';
                  },
                  // popupDetailDate: function(isAllDay, start, end) {
                  //   var isSameDate = moment(start).isSame(end);
                  //   var endFormat = (isSameDate ? '' : 'YYYY.MM.DD ') + 'hh:mm a';
              
                  //   if (isAllDay) {
                  //     return moment(start).format('YYYY.MM.DD') + (isSameDate ? '' : ' - ' + moment(end).format('YYYY.MM.DD'));
                  //   }
              
                  //   return (moment(start).format('YYYY.MM.DD hh:mm a') + ' - ' + moment(end).format(endFormat));
                  // },
                  popupDetailLocation: function(schedule) {
                    return 'Location : ' + schedule.location;
                  },
                  popupDetailUser: function(schedule) {
                    return 'User : ' + (schedule.attendees || []).join(', ');
                  },
                  popupDetailState: function(schedule) {
                    return 'State : ' + schedule.state || 'Busy';
                  },
                  popupDetailRepeat: function(schedule) {
                    return 'Repeat : ' + schedule.recurrenceRule;
                  },
                  popupDetailBody: function(schedule) {
                    return 'Body : ' + schedule.body;
                  },
                  popupEdit: function() {
                    return 'Edit';
                  },
                  popupDelete: function() {
                    return 'Delete';
                  }
                }}
                // theme={myTheme}
                timezones={[
                  {
                    timezoneOffset: 540,
                    displayLabel: 'GMT+09:00',
                    tooltip: 'Seoul'
                  },
                  {
                    timezoneOffset: -420,
                    displayLabel: 'GMT-08:00',
                    tooltip: 'Los Angeles'
                  }
                ]}
                useDetailPopup
                useCreationPopup
                
                //view={''} // You can also set the `defaultView` option.
                week={{
                  showTimezoneCollapseButton: true,
                  timezonesCollapsed: true
                }}
                
            />
        </Fragment>
    );
}
 
export default TuiCalendar;