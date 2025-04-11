import React, { useEffect, useState } from "react";
import style from "./MapaRotas.module.css";
import Topbar from "../../components/Topbar/Topbar";
import MapComponent from "../../components/MapComponent/MapComponent";

function MapaRotas() {
  const [points, setPoints] = useState([
    [-45.9475, -21.4256], // Rua Gabriela da Costa Santos, 379 – Bairro Pinheirinho
    [-45.9500, -21.4200], // Rua Juscelino Barbosa, 1438 – Centro
    [-45.9520, -21.4210], // Rua Benjamim Contant, 432 – Centro
    [-45.9550, -21.4230], // Rua Fany Enguel, 137 – Campos Elísios
    [-45.9600, -21.4280], // Rua Barão de Alfenas, 1637 – Residencial Itaparica
    [-45.9610, -21.4290], // Rua Barão de Alfenas, 204 – Residencial Itaparica
    [-45.9650, -21.4300], // Rua Onofre Gomes Pereira, 400 Bloco 1 - AP 24 – Recreio Vale do Sol
    [-45.9700, -21.4350], // Rua Cafezinho, 297 – Recreio
  ]);
  const [addresses, setAddresses] = useState([
    "Rua Gabriela da Costa Santos, 379 – Bairro Pinheirinho",
    "Rua Juscelino Barbosa, 1438 – Centro",
    "Rua Benjamim Contant, 432 – Centro",
    "Rua Fany Enguel, 137 – Campos Elísios",
    "Rua Barão de Alfenas, 1637 – Residencial Itaparica",
    "Rua Barão de Alfenas, 204 – Residencial Itaparica",
    "Rua Onofre Gomes Pereira, 400 Bloco 1 - AP 24 – Recreio Vale do Sol",
    "Rua Cafezinho, 297 – Recreio",
  ]);
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
