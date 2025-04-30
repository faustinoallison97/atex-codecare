import React, { useEffect, useState } from "react";
import style from "./MapaRotas.module.css";
import Topbar from "../../components/Topbar/Topbar";
import MapComponent from "../../components/MapComponent/MapComponent";

function MapaRotas() {
  const [points, setPoints] = useState([
    // [-45.948898, -21.445104], // Av. José Paulino da Costa, 950 – Centro
    [-45.9475, -21.4256], // Rua Gabriela da Costa Santos, 379 – Bairro Pinheirinho
    [-45.9500, -21.4200], // Rua Juscelino Barbosa, 1438 – Centro
    [-45.9520, -21.4210], // Rua Benjamim Contant, 432 – Centro
    [-45.9550, -21.4230], // Rua Fany Enguel, 137 – Campos Elísios
    [-45.9600, -21.4280], // Rua Barão de Alfenas, 1637 – Residencial Itaparica
    [-45.9610, -21.4290], // Rua Barão de Alfenas, 204 – Residencial Itaparica
    [-45.9650, -21.4300], // Rua Onofre Gomes Pereira, 400 Bloco 1 - AP 24 – Recreio Vale do Sol
    [-45.9700, -21.4350], // Rua Cafezinho, 297 – Recreio
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

  // Modificar a função de remoção de endereço para garantir sincronização
  const handleRemoveAddress = (index) => {
    // Create new arrays without the removed point
    const newPoints = points.filter((_, idx) => idx !== index);
    setPoints(newPoints);
    
    // Also remove the address from the addresses list
    const newAddresses = addresses.filter((_, idx) => idx !== index);
    setAddresses(newAddresses);
    
    // If we remove all points, clear the route
    if (newPoints.length < 2) {
      setRouteInfo(null);
    }
    
    // Forçar a atualização da rota - podemos fazer isso definindo
    // um estado temporário que serve apenas para disparar um efeito
    setForceRouteUpdate(prev => !prev);
  };
  
  // Estado auxiliar para forçar a atualização da rota
  const [forceRouteUpdate, setForceRouteUpdate] = useState(false);
  
  // Efeito para recalcular a rota quando os pontos mudarem
  useEffect(() => {
    // Só recalculamos se houver pelo menos 2 pontos
    if (points.length >= 2) {
      // Precisamos chamar o mesmo serviço que o MapComponent usa
      const fetchRoute = async () => {
        try {
          const { getRouteFromPoints } = await import('../../services/mapboxService');
          const routeData = await getRouteFromPoints(points);
          
          // Atualizar a rota diretamente
          setRouteInfo(routeData.info);
        } catch (error) {
          console.error('Erro ao recalcular rota:', error);
        }
      };
      
      fetchRoute();
    }
  }, [points, forceRouteUpdate]); // Depende de points e do estado força-atualização
  
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
                <div>
                  Tempo Estimado
                  <div className={style.info}>{routeInfo ? `${(routeInfo.duration / 60).toFixed(1)} min` : "--"}</div>
                </div>
              </div>
              <div className={style.container_info_rota}>
                <div>
                  Distância Total
                  <div className={style.info}>{routeInfo ? `${(routeInfo.distance / 1000).toFixed(2)} km` : "--"}</div>
                </div>
              </div>
              <div className={style.container_info_rota}>
                <div>
                  Cestas Básicas
                  <div className={style.info}>{addresses.length}</div> {/* Número de endereços */}
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
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}>
                    <div>{address}</div>
                    <button
                      onClick={() => handleRemoveAddress(idx)}
                      style={{
                        backgroundColor: '#FF3B30',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: 0,
                        marginLeft: '8px',
                        flexShrink: 0
                      }}
                      title="Remover endereço"
                    >
                      ×
                    </button>
                  </div>
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
