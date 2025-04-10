import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NotFound404 from '../pages/NotFound404/NotFound404';
import Home from '../pages/Home/Home';
import MapaRotas from '../pages/MapaRotas/MapaRotas';
import TestePage from '../pages/teste'

function Rotas(){
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home/>} />
                <Route path="/mapa-rotas" element={<MapaRotas/>} />                
                <Route path='teste' element={<TestePage/>} />
                <Route path="*" element={<NotFound404/>}/>
            </Routes>
        </BrowserRouter>
    )
}
export default Rotas