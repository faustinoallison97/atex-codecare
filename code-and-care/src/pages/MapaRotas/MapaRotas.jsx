import React, { useEffect, useState } from "react";
import style from "./MapaRotas.module.css";
import Topbar from "../../components/Topbar/Topbar";
import MapComponent from "../../components/MapComponent/MapComponent";
import { optimizeRouteWithIndices } from "../../services/routeOptimizer";
import { FiLayers } from "react-icons/fi";
import { MdClose } from "react-icons/md";

function MapaRotas() {
  const [points, setPoints] = useState([
    // [-45.948898, -21.445104], // Av. José Paulino da Costa, 950 – Centro
    [-45.9475, -21.4256], // Rua Gabriela da Costa Santos, 379 – Bairro Pinheirinho
    [-45.95, -21.42], // Rua Juscelino Barbosa, 1438 – Centro
    [-45.952, -21.421], // Rua Benjamim Contant, 432 – Centro
    [-45.955, -21.423], // Rua Fany Enguel, 137 – Campos Elísios
    [-45.96, -21.428], // Rua Barão de Alfenas, 1637 – Residencial Itaparica
    [-45.961, -21.429], // Rua Barão de Alfenas, 204 – Residencial Itaparica
    [-45.965, -21.43], // Rua Onofre Gomes Pereira, 400 Bloco 1 - AP 24 – Recreio Vale do Sol
    [-45.97, -21.435], // Rua Cafezinho, 297 – Recreio
    [-45.9398, -21.4055], // Rua Elízio Ayer, 679 – Campos Elísios
    [-45.9391, -21.4042], // Rua Elízio Ayer, 413 – Campos Elísios
    [-45.9391, -21.4042], // Rua Elízio Ayer, 470 – Campos Elísios
    [-45.9495, -21.3994], // Rua Antônio Generoso, 61 – Campos Elísios
    [-45.9398, -21.4055], // Rua Elízio Ayer, 293 – Campos Elísios
  ]);

  const [addresses, setAddresses] = useState([
    //"Av. José Paulino da Costa, 950 – Centro",
    "Rua Gabriela da Costa Santos, 379 – Bairro Pinheirinho",
    "Rua Juscelino Barbosa, 1438 – Centro",
    "Rua Benjamim Contant, 432 – Centro",
    "Rua Fany Enguel, 137 – Campos Elísios",
    "Rua Barão de Alfenas, 1637 – Residencial Itaparica",
    "Rua Barão de Alfenas, 204 – Residencial Itaparica",
    "Rua Onofre Gomes Pereira, 400 Bloco 1 - AP 24 – Recreio Vale do Sol",
    "Rua Cafezinho, 297 – Recreio",
    "Rua Elízio Ayer, 679 – Campos Elísios",
    "Rua Elízio Ayer, 413 – Campos Elísios",
    "Rua Elízio Ayer, 470 – Campos Elísios",
    "Rua Antônio Generoso, 61 – Campos Elísios",
    "Rua Elízio Ayer, 293 – Campos Elísios",
  ]);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleRemoveAddress = (index) => {
    const newPoints = points.filter((_, idx) => idx !== index);
    setPoints(newPoints);

    const newAddresses = addresses.filter((_, idx) => idx !== index);
    setAddresses(newAddresses);

    if (newPoints.length < 2) {
      setRouteInfo(null);
    }

    setForceRouteUpdate((prev) => !prev);
  };

  const [forceRouteUpdate, setForceRouteUpdate] = useState(false);

  useEffect(() => {
    if (points.length >= 2) {
      const fetchRoute = async () => {
        try {
          const { getRouteFromPoints } = await import(
            "../../services/mapboxService"
          );
          const routeData = await getRouteFromPoints(points);
          setRouteInfo(routeData.info);
        } catch (error) {
          console.error("Erro ao recalcular rota:", error);
        }
      };

      fetchRoute();
    }
  }, [points, forceRouteUpdate]);

  const handleOptimizeRoute = () => {
    if (points.length < 3) return;

    const { points: optimizedPoints, indices: optimizedIndices } =
      optimizeRouteWithIndices(points, 0);

    setPoints(optimizedPoints);

    const optimizedAddresses = optimizedIndices.map(
      (index) => addresses[index]
    );
    setAddresses(optimizedAddresses);

    setForceRouteUpdate((prev) => !prev);
  };

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
            <div className={style.container_linha_resumo}>
              <h3 className={style.titulos}>Resumo da rota</h3>

              <button
                onClick={handleOptimizeRoute}
                className={style.botao_otimizar_rota}
                disabled={points.length < 3}
                title="Otimizar rota (calcular caminho mais curto)"
              >
                <FiLayers />
                Otimizar Rota
              </button>
            </div>

            <div className={style.container_linha_info_rota}>
              <div className={style.container_info_rota}>
                <div>
                  Tempo Estimado
                  <div className={style.info}>
                    {routeInfo
                      ? `${(routeInfo.duration / 60).toFixed(1)} min`
                      : "--"}
                  </div>
                </div>
              </div>
              <div className={style.container_info_rota}>
                <div>
                  Distância Total
                  <div className={style.info}>
                    {routeInfo
                      ? `${(routeInfo.distance / 1000).toFixed(2)} km`
                      : "--"}
                  </div>
                </div>
              </div>
              <div className={style.container_info_rota}>
                <div>
                  Cestas Básicas
                  <div className={style.info}>{addresses.length}</div>
                </div>
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
                  <div
                   className={style.container_endereco_remover}
                  >
                    <div>{address}</div>
                    <button
                    className={style.botao_remover_endereco }
                      onClick={() => handleRemoveAddress(idx)}
                      title="Remover endereço"
                    >
                      <MdClose />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaRotas;
