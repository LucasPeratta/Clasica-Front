import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./Layout";
import { Inicio } from "./Main";
import { Pax, PaxProfile, PaxForm } from "./Pax";
import { Service } from "./Service";
import { Files, FilesProfile, FileForm } from "./File/index";
import { Login } from "./login/login";
import { Pagos } from "./Pagos/Pagos";
import { useAuth } from "./hooks/useAuth";

function Router() {
  const { isLoggedIn } = useAuth();
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {isLoggedIn ? (
            <>
              <Route path="/login" element={<Navigate to="/" />} />
              <Route path="/" element={<Inicio></Inicio>} />
              <Route path="/paxs" element={<Pax />} />
              <Route path="/paxs/profile/:id" element={<PaxProfile />} />
              <Route path="/paxs/create" element={<PaxForm />} />
              <Route path="/paxs/update/:id" element={<PaxForm />} />
              <Route path="/services" element={<Service />} />
              <Route path="/files" element={<Files />} />
              <Route path="/files/profile/:id" element={<FilesProfile />} />
              <Route path="/files/create" element={<FileForm />} />
              <Route path="/pagos" element={<Pagos />} />
              {/* Cualquier dirección que no existe vuelve al inicio */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default Router;
