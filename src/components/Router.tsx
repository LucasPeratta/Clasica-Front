import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./Layout";
import { Inicio } from "./Main";
import { Pax } from "./pax/Pax";
import { CreatePaxForm } from "./pax/methods/form/CreatePaxForm";
import { GetById } from "./pax/methods/GetById";
import { UpdatePax } from "./pax/methods/UpdatePax";
import { Service } from "./service/index";
import { CreateService } from "./service/createService";

function Router() {
  const auth = true;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {auth ? (
            <>
              <Route path="/" element={<Inicio></Inicio>} />

              <Route path="/paxs" element={<Pax></Pax>} />

              <Route
                path="/paxs/create"
                element={<CreatePaxForm></CreatePaxForm>}
              />

              <Route
                path="/paxs/allAboutPax/:id"
                element={<GetById></GetById>}
              />

              <Route
                path="/paxs/updatePax/:id"
                element={<UpdatePax></UpdatePax>}
              />

              <Route path="/files" element={<p>FILES</p>} />

              <Route path="/service" element={<Service></Service>} />
              <Route
                path="/service/create"
                element={<CreateService></CreateService>}
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
