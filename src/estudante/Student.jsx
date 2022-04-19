import StudentTabs from './components/Tabpanel'
import { useHistory } from 'react-router-dom';

import { FormEvent, Fragment, useEffect, useState } from 'react';
import LoginDialog from '../login/LoginDialog';
import { useAuth } from '../hooks/useAuth';

const Student = () => {
    const { user } = useAuth();


    return ( 
        <Fragment>
            <StudentTabs/>
            {!user && (<LoginDialog />)}
        </Fragment>
        
    );
}
 
export default Student;