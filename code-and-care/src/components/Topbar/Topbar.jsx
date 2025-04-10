import React from "react";
import style from "./Topbar.module.css";
import logo from "../../assets/LogoCode&CareBranco.png";
import { useNavigate } from "react-router";
function Topbar() {
  const navigate = useNavigate();

  function navegarHome() {
    navigate("/");
  }
  function navegarMapaRotas() {
    navigate("/mapa-rotas");
  }
  function navegarSessao2() {
    window.location.href = "/#sessao2";
  }
  function navegarSessao3() {
    window.location.href = "/#sessao3";
  }
  function navegarSessao4() {
    window.location.href = "/#sessao4";
  }
  

  return (
    <nav className={style.containernav}>
      <img onClick={navegarHome} src={logo} alt="" />
      <ul>
        <li onClick={navegarMapaRotas}>Rotas</li>
        <li onClick={navegarSessao2}>Sobre o Projeto</li>
        <li onClick={navegarSessao3}>Como Funciona</li>
        <li onClick={navegarSessao4}>Contato</li>
      </ul>
    </nav>
  );
}

export default Topbar;
