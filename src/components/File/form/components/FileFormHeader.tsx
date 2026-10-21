import { Box, Typography } from "@mui/material";

interface FileFormHeaderProps {
  id?: string;
  // Número automático ya formateado (ej. "55-2026"), solo al editar
  fileNumber?: string;
}

export const FileFormHeader = ({ id, fileNumber }: FileFormHeaderProps) => {
  return (
    <Box sx={{ textAlign: "center", mb: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#0d47a1" }}>
        {id ? `Editar File${fileNumber ? ` ${fileNumber}` : ""}` : "Crear File"}
      </Typography>
      {!id && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          El número de file se asigna automáticamente al guardar
        </Typography>
      )}
    </Box>
  );
};
