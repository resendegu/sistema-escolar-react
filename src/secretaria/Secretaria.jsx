import SecretariaTabs from './components/Tabpanel'
import { useHistory } from 'react-router-dom';

import { FormEvent, Fragment, useState } from 'react';
import LoginDialog from '../login/LoginDialog';
import { useAuth } from '../hooks/useAuth';

const Secretaria = () => {
    
    const { user } = useAuth();
    console.log(user)


    return ( 
        <Fragment>
            <SecretariaTabs/>
            {user ? null : (<LoginDialog />)}
        </Fragment>
        
    );
}
 
export default Secretaria;