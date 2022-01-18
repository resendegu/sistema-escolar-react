import { database } from '../services/firebase'
import { useEffect, useState } from "react";

const useCalendar = (ref) => {
    const [eventsSources, setEvents] = useState([]);

    useEffect(() => {
        const calendarRef = database.ref(ref);

        calendarRef.on('value', snapshot => {
            let eventsSources = snapshot.val();
            console.log(eventsSources)
            if (eventsSources.hasOwnProperty('length')) {
                setEvents(eventsSources)
            } else {
                setEvents([eventsSources])
            }
        })

        return () => {
            calendarRef.off('value');
        }
    }, [ref])
    
    return { eventsSources };
}
 
export default useCalendar;