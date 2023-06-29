import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./Layout";
import { Inicio } from "./Main";
import { Pax, PaxProfile, PaxForm } from "./Pax";
import { Service, ServiceForm, ServiceProfile } from "./Service";

function Router() {
  const auth = true;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {auth ? (
            <>
              <Route path="/" element={<Inicio></Inicio>} />
              <Route path="/paxs" element={<Pax />} />
              <Route path="/paxs/profile/:id" element={<PaxProfile />} />
              <Route path="/paxs/create" element={<PaxForm />} />
              <Route path="/paxs/update/:id" element={<PaxForm />} />
              <Route path="/files" element={<p>FILES</p>} />
              <Route path="/services" element={<Service />} />
              <Route path="/services/create" element={<ServiceForm />} />
              <Route path="/services/update/:id" element={<ServiceForm />} />
              <Route
                path="/services/profile/:id"
                element={<ServiceProfile />}
              />
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
