import Router from "./components/Router";
import "./App.scss";
import { AuthProvider } from "./components/hooks/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
