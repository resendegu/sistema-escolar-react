import AttendanceTabs from './components/Tabpanel'
import { useHistory } from 'react-router-dom';

import { FormEvent, Fragment, useEffect, useState } from 'react';
import LoginDialog from '../login/LoginDialog';
import { useAuth } from '../hooks/useAuth';

const Attendance = () => {
    const { user } = useAuth();


    return ( 
        <Fragment>
            <AttendanceTabs/>
            {!user && (<LoginDialog />)}
        </Fragment>
        
    );
}
 
export default Attendance;