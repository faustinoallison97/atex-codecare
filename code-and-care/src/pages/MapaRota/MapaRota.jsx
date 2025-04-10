import style from "./MapaRota.module.css";
import Topbar from "../../components/Topbar/Topbar";

function MapaRota() {
  return (
    <>
      <Topbar />
      <div className={style.container_total}>
        
        <div className={style.container_mapa}>
          <div className={style.mapa}>Mapa</div>
        </div>
        <div className={style.container_info_total}>
          <div className={style.container_resumo_rota}>
            <h1>Resumo da rota</h1>
            <div className={style.container_resumo_rota_info}>
              <div className={style.info}></div>
              <div className={style.info}></div>
              <div className={style.info}></div>
            </div>
          </div>

          <div className={style.container_mapa_total}>
            <h1>Endereços de entrega</h1>

            <div className={style.list_box}>
              <div className={style.list}></div>
              <div className={style.list}></div>
              <div className={style.list}></div>
              <div className={style.list}></div>
              <div className={style.list}></div>
              <div className={style.list}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MapaRota;
