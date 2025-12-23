import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";

function ResponsiveAppBar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteButtonClick = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#0D5B75" }}>
      <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", marginLeft: "16px" }}>
          <img
            src="/clasicalogo.jpg"
            alt="Clásica Moderna"
            style={{
              height: "40px",
              width: "auto",
              borderRadius: "6px",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </Link>

        <Box sx={{ display: "flex", alignItems: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          {isLoggedIn && (
            <>
              <Button
                color="inherit"
                sx={{ 
                  mx: 1.5, 
                  fontSize: "0.9rem", 
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => {
                  navigate("/paxs");
                }}
              >
                PAXS
              </Button>

              <Button
                color="inherit"
                sx={{ 
                  mx: 1.5, 
                  fontSize: "0.9rem", 
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => {
                  navigate("/files");
                }}
              >
                FILES
              </Button>

              <Button
                color="inherit"
                sx={{ 
                  mx: 1.5, 
                  fontSize: "0.9rem", 
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => {
                  navigate("/grupales");
                }}
              >
                GRUPALES
              </Button>
            </>
          )}
        </Box>
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirmacion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas salir?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              CANCELAR
            </Button>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                logout();
              }}
              color="error"
            >
              SALIR
            </Button>
          </DialogActions>
        </Dialog>

        {isLoggedIn && (
          <Box sx={{ marginRight: 2 }}>
            <Button 
              color="inherit" 
              onClick={handleDeleteButtonClick}
              sx={{
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
                  transform: "scale(1.05)",
                },
              }}
            >
              EXIT
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
