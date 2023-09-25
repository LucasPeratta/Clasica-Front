import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
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
      <Toolbar disableGutters>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              ml: 2,
            }}
          >
            LOGO
          </Typography>
        </Link>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isLoggedIn && (
            <>
              <Button
                color="inherit"
                sx={{ mx: 0.2, fontSize: "0.8rem" }}
                onClick={() => {
                  navigate("/paxs");
                }}
              >
                Paxs
              </Button>
              <Button
                color="inherit"
                sx={{ mx: 0.2, fontSize: "0.8rem" }}
                onClick={() => {
                  navigate("/services");
                }}
              >
                Services
              </Button>
              <Button
                color="inherit"
                sx={{ mx: 0.2, fontSize: "0.8rem" }}
                onClick={() => {
                  navigate("/files");
                }}
              >
                Files
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
          <Box sx={{ marginLeft: "auto", marginRight: 2 }}>
            <Button color="inherit" onClick={handleDeleteButtonClick}>
              EXIT
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
