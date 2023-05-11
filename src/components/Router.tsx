import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import "./Router.scss";

function Router() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" />
        <Route path="/paxs" />
        <Route path="/files" />
        <Route path="/service" />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
