import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./Layout";
import { Pax } from "./pax/Pax";

function Router() {
  const auth = true;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {auth ? (
            <>
              <Route path="/" element={<Navigate to="/paxs" />} />
              <Route path="/files" element={<p>FILES</p>} />
              <Route path="/paxs" element={<Pax></Pax>} />
              <Route path="/service" element={<p>Service</p>} />
            </>
          ) : (
            <>
              <Route path="/login" element={<p>Login</p>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default Router;

//navigate("/files"); indicamos a React Router que navegue a la ruta /files
//2do param de useEffect : pasamos [navigate] como dependencia para asegurarnos de que useEffect se ejecute nuevamente solo si navigate cambia. Esto evita que useEffect se ejecute en bucle.
