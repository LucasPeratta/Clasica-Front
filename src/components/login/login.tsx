import React, { useState } from "react";
import { loginHandler } from "./handler";
import { useAuth } from "../hooks/useAuth";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const errorMessage = (status?: number) => {
  if (status === 401) return "El email o la contraseña no son correctos. Revisalos y probá de nuevo.";
  if (status === 429) return "Hubo muchos intentos seguidos. Esperá unos minutos y probá de nuevo.";
  return "No se pudo conectar con el sistema. Revisá internet y probá de nuevo.";
};

/**
 * Pantalla de entrada al sistema
 */
export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const response = await loginHandler(email, password);

    if (response?.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      login(data.token);
      return;
    }
    setLoading(false);
    setError(errorMessage(response?.status));
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        backgroundImage:
          "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%), " +
          "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), " +
          "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          backgroundColor: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            component="img"
            src="/clasicalogo.jpg"
            alt="Clásica Moderna"
            sx={{ height: 72, maxWidth: "100%", objectFit: "contain", mb: 1.5 }}
          />
          <Typography component="h1" sx={{ fontWeight: 700, fontSize: "1.6rem" }}>
            ¡Hola!
          </Typography>
          <Typography sx={{ color: "#5b6d74", fontSize: "1.05rem" }}>Ingresá con tu email y tu contraseña.</Typography>
        </Box>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <Alert severity="error" sx={{ fontSize: "0.95rem" }}>
              {error}
            </Alert>
          )}
          <TextField
            required
            fullWidth
            autoFocus
            id="email"
            type="email"
            autoComplete="username"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            required
            fullWidth
            id="password"
            label="Contraseña"
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.4,
              textTransform: "none",
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 2,
              backgroundColor: "#0D5B75",
              "&:hover": { backgroundColor: "#0a4a5e" },
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};
