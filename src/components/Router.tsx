import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./Router.scss";

function Router() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/files" />} />
        <Route path="/files" element={<p>FILES</p>} />
        <Route path="/paxs" element={<p>Paxs</p>} />
        <Route path="/service" element={<p>Service</p>} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

//navigate("/files"); indicamos a React Router que navegue a la ruta /files
//2do param de useEffect : pasamos [navigate] como dependencia para asegurarnos de que useEffect se ejecute nuevamente solo si navigate cambia. Esto evita que useEffect se ejecute en bucle.
