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

  function navegarParaSecao(hash) {
    // Navega para a página inicial primeiro se necessário
    if (window.location.pathname !== "/") {
      navigate("/", { state: { scrollTo: hash } });
    } else {
      // Se já estiver na home, apenas rola para a seção
      const elemento = document.querySelector(hash);
      if (elemento) {
        elemento.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMenuAberto(false);
  }

  return (
    <>
      <nav className={style.containernav}>
        <img onClick={navegarHome} src={logo} alt="Logo" />
        <ul className={style.menuDesktop}>
          <li onClick={navegarMapaRotas}>Rotas</li>
          <li onClick={() => navegarParaSecao("#sessao2")}>Sobre o Projeto</li>
          <li onClick={() => navegarParaSecao("#sessao3")}>Como Funciona</li>
          <li onClick={() => navegarParaSecao("#sessao4")}>Contato</li>
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
            <li onClick={() => navegarParaSecao("#sessao2")}>Sobre o Projeto</li>
            <li onClick={() => navegarParaSecao("#sessao3")}>Como Funciona</li>
            <li onClick={() => navegarParaSecao("#sessao4")}>Contato</li>
          </ul>
        </div>
      )}
    </>
  );
}

export default Topbar;