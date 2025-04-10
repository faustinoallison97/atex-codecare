import React from "react";
import style from "./Topbar.module.css";
import logo from "../../assets/LogoCode&CareBranco.png";
import { useNavigate } from "react-router";
function Topbar() {
  const navigate = useNavigate();

  function navegarParaMapaRotas() {
    navigate("/mapa-rotas");
  }
  function navegarParaHome() {
    navigate("/");
  }

  return (
    <nav className={style.containernav}>
      <img onClick={navegarParaHome} src={logo} alt="" />
      <ul>
        <li onClick={navegarParaMapaRotas}>Rotas</li>
        <li>Informações</li>
        <li>Contato</li>
      </ul>
    </nav>
  );
}

export default Topbar;
