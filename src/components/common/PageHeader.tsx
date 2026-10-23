import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  // Una frase que explica para qué es la pantalla
  description: string;
  // Botón principal de la pantalla (ej. "Cargar un pasajero")
  // Lleva a "to" o, si no tiene, ejecuta onClick (ej. abrir una ventana)
  action?: { label: string; icon: JSX.Element; to?: string; onClick?: () => void };
}

/**
 * Encabezado de una pantalla: título, explicación corta y la acción principal bien visible
 */
export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      flexDirection: { xs: "column", sm: "row" },
      gap: 2,
      mb: 2.5,
    }}
  >
    <Box>
      <Typography component="h1" sx={{ color: "#fff", fontWeight: 700, fontSize: { xs: "1.7rem", md: "2rem" } }}>
        {title}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1.05rem" }}>{description}</Typography>
    </Box>
    {action && (
      <Button
        {...(action.to ? { component: Link, to: action.to } : { onClick: action.onClick })}
        variant="contained"
        startIcon={action.icon}
        sx={{
          flexShrink: 0,
          textTransform: "none",
          fontSize: "1.05rem",
          fontWeight: 700,
          px: 3,
          py: 1.25,
          borderRadius: 3,
          color: "#0D5B75",
          backgroundColor: "#fff",
          boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
          "& .MuiButton-startIcon svg": { fontSize: 26 },
          "&:hover": { backgroundColor: "#f2f8fa" },
        }}
      >
        {action.label}
      </Button>
    )}
  </Box>
);
