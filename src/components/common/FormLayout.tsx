import { ReactNode } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

/**
 * Fondo y ancho de las pantallas de carga (pasajero, file)
 */
export const FormPage = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      px: { xs: 2, md: 6 },
      py: 3,
      backgroundImage:
        "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%), " +
        "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), " +
        "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
      minHeight: "calc(100vh - 64px)",
    }}
  >
    <Box sx={{ maxWidth: 1000, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>{children}</Box>
  </Box>
);

/**
 * Encabezado: título grande, una línea de ayuda y el botón Volver
 */
export const FormHeader = ({ title, description, onBack }: { title: string; description: ReactNode; onBack: () => void }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 3 },
      borderRadius: 3,
      backgroundColor: "#fff",
      boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: { xs: "flex-start", sm: "center" },
      justifyContent: "space-between",
      gap: 2,
    }}
  >
    <Box>
      <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", md: "1.9rem" }, lineHeight: 1.2 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "#5b6d74", fontSize: "1.05rem", mt: 0.5 }}>{description}</Typography>
    </Box>
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      onClick={onBack}
      sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 600, borderRadius: 2, px: 2.5, flexShrink: 0 }}
    >
      Volver
    </Button>
  </Paper>
);

/**
 * Barra de abajo con Cancelar y Guardar; queda pegada al pie mientras se baja
 */
export const FormActions = ({
  saveLabel,
  saving,
  onCancel,
  formId,
  onSave,
  note,
}: {
  saveLabel: string;
  saving?: boolean;
  onCancel: () => void;
  // Si el botón envía un <form>, su id; si no, onSave
  formId?: string;
  onSave?: () => void;
  // Texto chico a la izquierda (ej. "Los campos con * son obligatorios")
  note?: ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      position: "sticky",
      bottom: 12,
      zIndex: 5,
      p: 2,
      borderRadius: 3,
      backgroundColor: "#fff",
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      flexWrap: "wrap",
    }}
  >
    <Typography sx={{ color: "#5b6d74" }}>{note}</Typography>
    <Box sx={{ display: "flex", gap: 1.5, ml: "auto" }}>
      <Button onClick={onCancel} disabled={saving} sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 600 }}>
        Cancelar
      </Button>
      <Button
        type={formId ? "submit" : "button"}
        form={formId}
        onClick={onSave}
        variant="contained"
        disabled={saving}
        startIcon={<SaveIcon />}
        sx={{
          textTransform: "none",
          fontSize: "1.05rem",
          fontWeight: 700,
          borderRadius: 2,
          px: 3,
          py: 1,
          backgroundColor: "#0D5B75",
          "&:hover": { backgroundColor: "#0a4a5e" },
        }}
      >
        {saving ? "Guardando..." : saveLabel}
      </Button>
    </Box>
  </Paper>
);
