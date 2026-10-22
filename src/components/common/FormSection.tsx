import { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface FormSectionProps {
  title: string;
  icon: JSX.Element;
  // Una línea de ayuda debajo del título
  description?: ReactNode;
  // Botón u otra cosa a la derecha del título
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Tarjeta blanca de un formulario: título con ícono, ayuda opcional y los campos
 */
export const FormSection = ({ title, icon, description, action, children }: FormSectionProps) => (
  <Paper
    elevation={0}
    sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 2 }}>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#0D5B75", "& svg": { fontSize: 26 } }}>
          {icon}
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
            {title}
          </Typography>
        </Box>
        {description && (
          <Typography sx={{ color: "#5b6d74", mt: 0.5 }}>{description}</Typography>
        )}
      </Box>
      {action}
    </Box>
    {children}
  </Paper>
);
