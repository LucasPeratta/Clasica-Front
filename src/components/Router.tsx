import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./Layout";
import { Inicio } from "./Main";
import { Pax, PaxProfile, PaxForm } from "./Pax";
import { Service, ServiceForm, ServiceProfile } from "./Service";
import { Files, FilesProfile, FileForm } from "./File/index";
import { Login } from "./login/login";
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
              <Route path="/services/create" element={<ServiceForm />} />
              <Route path="/services/update/:id" element={<ServiceForm />} />
              <Route
                path="/services/profile/:id"
                element={<ServiceProfile />}
              />
              <Route path="/files" element={<Files />} />
              <Route path="/files/profile/:id" element={<FilesProfile />} />
              <Route path="/files/create" element={<FileForm />} />
              <Route path="/files/update/:id" element={<FileForm />} />
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
