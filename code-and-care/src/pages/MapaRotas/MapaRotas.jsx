import React, { useEffect, useState } from "react";
import style from "./MapaRotas.module.css";
import Topbar from "../../components/Topbar/Topbar";
import MapComponent from "../../components/MapComponent/MapComponent";

function MapaRotas() {
  const [points, setPoints] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  return (
    <div>
      <Topbar />
      <div className={style.container_total}>
        <div className={style.container_mapa}>
          <MapComponent
            points={points}
            setPoints={setPoints}
            setRouteInfo={setRouteInfo}
            setAddresses={setAddresses} 
          />
        </div>

        <div className={style.container_info_total}>
          <div className={style.container_resumo_total}>
            <h3 className={style.titulos}>Resumo da rota</h3>

            <div className={style.container_linha_info_rota}>
              <div className={style.container_info_rota}>
                Tempo Estimado
                <div>
                  {routeInfo ? `${(routeInfo.duration / 60).toFixed(1)} min` : "--"}
                </div>
              </div>
              <div className={style.container_info_rota}>
                Distância Total
                <div>
                  {routeInfo ? `${(routeInfo.distance / 1000).toFixed(2)} km` : "--"}
                </div>
              </div>
              <div className={style.container_info_rota}>
                Cestas Básicas
                <div>{addresses.length}</div> {/* Número de endereços */}
              </div>
            </div>
          </div>

          <div className={style.container_endereco_total}>
            <div className={style.container_linha_endereco}>
              <h3 className={style.titulos}>Endereços de entrega</h3>
              <h3 className={style.titulos}>{addresses.length} locais</h3>
            </div>

            <div className={style.container_colum_enderecos}>
              {addresses.map((address, idx) => (
                <div key={idx} className={style.container_enderecos}>
                  {address}
                </div>
              ))}
            </div>

            <button className={style.botao_entrega}>Em entrega...</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaRotas;
