import style from "./MapaRotas.module.css";
import Topbar from "../../components/Topbar/Topbar"

function MapaRotas() {
  return (
    <div>
      <Topbar/>
      <div className={style.container_total}>
        <div className={style.container_mapa}>
          <div className={style.mapa}></div>
        </div>

        <div className={style.container_info_total}>
          <div className={style.container_resumo_total}>
            <h3 className={style.titulos}>Resumo da rota</h3>

            <div className={style.container_linha_info_rota}>
              <div className={style.container_info_rota}>Tempo Estimado</div>
              <div className={style.container_info_rota}>Distancia Total</div>
              <div className={style.container_info_rota}>Cestas Basicas</div>
            </div>

            <div className={style.info_progresso}>
              <p>Progresso</p>
              <p>20%</p>
            </div>
            <div className={style.barra_progresso}>
              <div className={style.progresso}></div>
            </div>
          </div>

          <div className={style.container_endereco_total}>
            <div className={style.container_linha_endereco}>
              <h3 className={style.titulos}>Endereços de entrega</h3>
              <h3 className={style.titulos}> 10 locais</h3>
            </div>

            <div className={style.container_colum_enderecos}>
              <div className={style.container_enderecos}>Endereço 1</div>
              <div className={style.container_enderecos}>Endereço 2</div>
              <div className={style.container_enderecos}>Endereço 3</div>
              <div className={style.container_enderecos}>Endereço 4</div>
              <div className={style.container_enderecos}>Endereço 5</div>
              <div className={style.container_enderecos}>Endereço 6</div>
              <div className={style.container_enderecos}>Endereço 7</div>
              <div className={style.container_enderecos}>Endereço 8</div>
              <div className={style.container_enderecos}>Endereço 9</div>
              <div className={style.container_enderecos}>Endereço 10</div>
            </div>

            <button className={style.botao_entrega}>Em entrega...</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaRotas;
