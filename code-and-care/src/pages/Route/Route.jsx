import style from "./Route.module.css";
import Topbar from "../../components/Topbar/Topbar"

function Route(){

    return(
        <div>
            {/*INSERIR A TOPBAR*/}
            <div className={style.container}>
                <div className={style.map}>
                    <div className={style.MapContainer}></div>
                </div>
                <div className={style.direita}>
                    <div className={style.direitah1}>
                        <h1>Resumo da rota</h1>
                    </div>
                    <div className={style.resumoRota}>
                        <div className={style.info}></div>
                        <div className={style.info}></div>
                        <div className={style.info}></div>
                    </div>
                    <div className={style.enderecos}>
                        <div className={style.direitah1}>
                            <h1>Endereços de entrega</h1>
                        </div>
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
        </div>
    );
}

export default Route