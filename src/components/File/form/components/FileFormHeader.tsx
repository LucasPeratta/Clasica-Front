import { Typography } from "@mui/material";

interface FileFormHeaderProps {
  id?: string;
}

export const FileFormHeader = ({ id }: FileFormHeaderProps) => {
  return (
    <Typography
      variant="h4"
      sx={{ fontWeight: 700, mb: 3, color: "#0d47a1", textAlign: "center" }}
    >
      {id ? "Editar File" : "Crear File"}
    </Typography>
  );
};
