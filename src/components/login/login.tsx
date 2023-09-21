import React, { useState } from "react";
import { loginHandler } from "./handler";
import { useAuth } from "../hooks/useAuth";

import {
  Button,
  TextField,
  Grid,
  Paper,
  Typography,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoggedIn, login } = useAuth();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);

  const openNotification = () => {
    setNotificationOpen(true);
  };

  const openErrorNotification = () => {
    setErrorNotificationOpen(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await loginHandler(email, password);

    if (response?.ok) {
      const data = await response.json();
      const token = data.token;

      localStorage.setItem("token", token);
      openNotification();
      setTimeout(() => {
        login(token);
        console.log(isLoggedIn);
      }, 1500);
    }
    if (response?.status == 401) openErrorNotification();
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "100px",
        }}
      >
        <Typography variant="h5">Iniciar sesión</Typography>
        <form
          onSubmit={handleLogin}
          style={{ width: "100%", marginTop: "16px" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="password"
                label="Contraseña"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
              >
                Iniciar sesión
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={5000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="success">
          Logeado con exito!
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorNotificationOpen}
        autoHideDuration={5000}
        onClose={() => setErrorNotificationOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert onClose={() => setErrorNotificationOpen(false)} severity="error">
          Usuario y contraseña no coinciden.
        </Alert>
      </Snackbar>
    </Container>
  );
};
