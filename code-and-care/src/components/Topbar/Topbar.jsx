import React, { useState } from "react";
import style from "./Topbar.module.css";
import logo from "../../assets/LogoCode&CareBranco.png";
import { useNavigate } from "react-router";
import { FaBars, FaTimes } from "react-icons/fa";

function Topbar() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function navegarHome() {
    navigate("/");
    setMenuAberto(false);
  }
  function navegarMapaRotas() {
    navigate("/mapa-rotas");
    setMenuAberto(false);
  }
  function navegarSessao2() {
    window.location.href = "/#sessao2";
    setMenuAberto(false);
  }
  function navegarSessao3() {
    window.location.href = "/#sessao3";
    setMenuAberto(false);
  }
  function navegarSessao4() {
    window.location.href = "/#sessao4";
    setMenuAberto(false);
  }

  return (
    <>
      <nav className={style.containernav}>
        <img onClick={navegarHome} src={logo} alt="Logo" />
        <ul className={style.menuDesktop}>
          <li onClick={navegarMapaRotas}>Rotas</li>
          <li onClick={navegarSessao2}>Sobre o Projeto</li>
          <li onClick={navegarSessao3}>Como Funciona</li>
          <li onClick={navegarSessao4}>Contato</li>
        </ul>
        <button
          className={style.menuToggle}
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? <FaTimes /> : <FaBars />}
        </button>
      </nav>

      {menuAberto && (
        <div className={style.menuMobile}>
          <ul>
            <li onClick={navegarMapaRotas}>Rotas</li>
            <li onClick={navegarSessao2}>Sobre o Projeto</li>
            <li onClick={navegarSessao3}>Como Funciona</li>
            <li onClick={navegarSessao4}>Contato</li>
          </ul>
        </div>
      )}
    </>
  );
}

export default Topbar;
