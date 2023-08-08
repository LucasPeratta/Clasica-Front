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
} from "@mui/material";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoggedIn, login } = useAuth();
  console.log(isLoggedIn);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await loginHandler(email, password);

    if (response?.ok) {
      const data = await response.json();
      console.log(data);
      const token = data.token;
      console.log(token);

      localStorage.setItem("token", token);
      login(token);
      console.log(isLoggedIn);
    }
    if (response?.status == 401) alert("Usuario y contraseña no coinciden");
    else {
      //   console.log(response);
    }
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
    </Container>
  );
};
