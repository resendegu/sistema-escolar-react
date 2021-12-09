import { database } from '../services/firebase'
import { useEffect, useState } from "react";

const useCalendar = (ref) => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const calendarRef = database.ref(ref);

        calendarRef.on('value', snapshot => {
            let events = snapshot.val();
            console.log(events)
            if (events.hasOwnProperty('length')) {
                setEvents(events)
            } else {
                setEvents([events])
            }
        })

        return () => {
            calendarRef.off('value');
        }
    }, [ref])
    
    return { events };
}
 
export default useCalendar;