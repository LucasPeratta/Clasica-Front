import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import PaymentsIcon from "@mui/icons-material/Payments";
import LogoutIcon from "@mui/icons-material/Logout";

// Secciones del menú; `match` = rutas que cuentan como "estás acá"
const SECTIONS = [
  { label: "Inicio", to: "/", icon: <HomeIcon />, match: (path: string) => path === "/" },
  { label: "Pasajeros", to: "/paxs", icon: <PersonIcon />, match: (path: string) => path.startsWith("/paxs") },
  { label: "Files", to: "/files", icon: <AssignmentIcon />, match: (path: string) => path.startsWith("/files") },
  { label: "Servicios", to: "/services", icon: <RoomServiceIcon />, match: (path: string) => path.startsWith("/services") },
  { label: "Pagos", to: "/pagos", icon: <PaymentsIcon />, match: (path: string) => path.startsWith("/pagos") },
];

function ResponsiveAppBar() {
  const { isLoggedIn, logout } = useAuth();
  const { pathname } = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  return (
    <AppBar position="sticky" elevation={0} sx={{ backgroundColor: "#0D5B75", zIndex: 1000, top: 0, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
      <Toolbar sx={{ gap: 2, minHeight: { xs: 64, md: 68 } }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }} aria-label="Ir al inicio">
          <img
            src="/clasicalogo.jpg"
            alt="Clásica Moderna"
            style={{ height: 42, width: "auto", borderRadius: 6, display: "block" }}
          />
        </Link>

        {isLoggedIn && (
          <Box component="nav" sx={{ display: "flex", gap: 0.5, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
            {SECTIONS.map((section) => {
              const active = section.match(pathname);
              return (
                <Button
                  key={section.to}
                  component={Link}
                  to={section.to}
                  startIcon={section.icon}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    color: "#fff",
                    textTransform: "none",
                    fontSize: "1.05rem",
                    fontWeight: active ? 700 : 500,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    // La sección donde estás queda resaltada
                    backgroundColor: active ? "rgba(255,255,255,0.18)" : "transparent",
                    boxShadow: active ? "inset 0 -3px 0 #fff" : "none",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
                    "& .MuiButton-startIcon svg": { fontSize: 24 },
                  }}
                >
                  {section.label}
                </Button>
              );
            })}
          </Box>
        )}

        {isLoggedIn && (
          <Button
            onClick={() => setLogoutDialogOpen(true)}
            startIcon={<LogoutIcon />}
            sx={{
              color: "#fff",
              textTransform: "none",
              fontSize: "1rem",
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: 2,
              px: 2,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
            }}
          >
            Salir
          </Button>
        )}

        <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
          <DialogTitle>¿Querés salir del sistema?</DialogTitle>
          <DialogContent>
            <DialogContentText>Para volver a entrar vas a necesitar tu email y contraseña.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoutDialogOpen(false)}>Quedarme</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setLogoutDialogOpen(false);
                logout();
              }}
            >
              Salir
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
