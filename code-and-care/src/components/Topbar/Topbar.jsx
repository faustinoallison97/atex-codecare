import React from 'react';
import style from './Topbar.module.css';
import logo from '../../assets/LogoCode&CareBranco.png'
function Topbar(){

    return(
        <nav className={style.containernav}>
            <img src={logo} alt="" />
            <ul>
                <li>Rotas</li>
                <li>Informações</li>
                <li>Contato</li>
            </ul>
        </nav>
    );
   
};

export default Topbar;