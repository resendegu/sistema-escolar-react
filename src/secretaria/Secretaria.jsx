import SecretariaTabs from './components/Tabpanel'
import { useHistory } from 'react-router-dom';

import { FormEvent, Fragment, useEffect, useState } from 'react';
import LoginDialog from '../login/LoginDialog';
import { useAuth } from '../hooks/useAuth';

const Secretaria = () => {
    const { user } = useAuth();


    return ( 
        <Fragment>
            <SecretariaTabs/>
            {!user && (<LoginDialog />)}
        </Fragment>
        
    );
}
 
export default Secretaria;