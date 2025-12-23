import { Link } from "react-router-dom";
import { Box, Typography, Button, Divider } from "@mui/material";

interface FileProfileHeaderProps {
  fileId: string;
}

export const FileProfileHeader = ({ fileId }: FileProfileHeaderProps) => {
  return (
    <>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 3, color: "#0d47a1", textAlign: "center" }}
      >
        Detalles del File
      </Typography>

      <Box display="flex" justifyContent="center" gap={2} sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/files"
          variant="outlined"
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          Volver
        </Button>
        <Button
          component={Link}
          to={`/files/update/${fileId}`}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            background: "linear-gradient(135deg, #007bff 0%, #6f42c1 100%)",
          }}
        >
          Editar
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />
    </>
  );
};
