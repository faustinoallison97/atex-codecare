import React from "react";
import { useNavigate } from "react-router-dom";
import style from "./NotFound404.module.css"; 

function NotFound404() {

  const navigate = useNavigate();

  const voltarHome = () => {
    navigate("/"); 
  };

  return (
    <div className={style.page404}>
      <div className={style.container_total}>
        <h1 className={style.titulo}>404</h1>
        <p className={style.mensagem}>Ops! A página que você procura não existe.</p>
        <button onClick={voltarHome} className={style.botao_voltar}>Voltar para a Home</button>
      </div>
    </div>
  );
};

export default NotFound404;
