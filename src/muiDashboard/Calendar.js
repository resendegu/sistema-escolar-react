import FullCalendar from '@fullcalendar/react';
import { Fragment } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import brLocale from '@fullcalendar/core/locales/pt-br';
import interactionPlugin from '@fullcalendar/interaction';
import Title from './Title';
import useCalendar from '../hooks/useCalendar'
import { makeStyles } from '@material-ui/core';
import { useEffect } from 'preact/hooks';

const useStyles = makeStyles((theme) => ({
    div: {
        position: 'absolute',
        zIndex: 9,
        backgroundColor: '#f1f1f1',
        border: '1px solid #d3d3d3',
        textAlign: 'center',
    },

    header: {
        padding: '10px',
        cursor: 'move',
        zIndex: 10,
        backgroundColor: '#2196F3',
        color: '#fff',
    }
  }));

const CalendarComponent = () => {
    const { events } = useCalendar('sistemaEscolar/infoEscola/calendarioGeral');
    const classes = useStyles();

    const handleDateClick = (e) => {
        console.log(e)
    }

    const handleEventClick = (e) => {
        console.log(e)
    }

    const handleSelection = (e) => {
        console.log(e)
    }

    const handleViewChange = (e) => {
        console.log(e.view.type)
        localStorage.setItem('view', e.view.type)
    }

    const initialView = localStorage.getItem('view') || 'dayGridMonth';

    

    return (
        <Fragment>
            {/* <div className={classes.div} id="popup">
                <div className={classes.header} id="popupheader">Click here to move</div>
                <p>Move</p>
                <p>this</p>
                <p>DIV</p>
            </div> */}
            <Title>Calendário da escola</Title>
            <FullCalendar 
               plugins={[ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin ]}
               initialView={initialView}
               headerToolbar={{
                 left: 'prevYear,prev,next,nextYear today',
                 center: 'title',
                 right: 'dayGridMonth,timeGridWeek,listWeek',

               }}
                locale={brLocale}
                eventSources={events}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                selectable
                select={handleSelection}
                viewDidMount={handleViewChange}
                editable={true}
            />
        </Fragment>
    );
}
 
export default CalendarComponent;