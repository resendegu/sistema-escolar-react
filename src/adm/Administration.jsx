import AdministrationTabs from './components/Tabpanel'
import { useHistory } from 'react-router-dom';

import { FormEvent, Fragment, useEffect, useState } from 'react';
import LoginDialog from '../login/LoginDialog';
import { useAuth } from '../hooks/useAuth';

const Administration = () => {
    const { user } = useAuth();


    return ( 
        <Fragment>
            <AdministrationTabs/>
            {!user && (<LoginDialog />)}
        </Fragment>
        
    );
}
 
export default Administration;