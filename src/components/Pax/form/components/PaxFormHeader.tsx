import { Stack, Avatar, Box, Typography, Chip, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { initials } from "../../utils/formatters";
import { iPax } from "../../model";

interface PaxFormHeaderProps {
  formData: iPax;
  id?: string;
}

export const PaxFormHeader = ({ formData, id }: PaxFormHeaderProps) => {
  const navigate = useNavigate();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      spacing={2}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 56,
            height: 56,
            fontSize: 22,
          }}
        >
          {initials(formData.lastname, formData.firstname)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            {formData.firstname || formData.lastname
              ? `${formData.firstname} ${formData.lastname}`.trim()
              : id
              ? "Editar pasajero"
              : "Nuevo pasajero"}
          </Typography>
          <Stack direction="row" spacing={1} mt={0.5}>
            <Chip size="small" color="primary" label="Pasajero" />
            {id ? (
              <Chip size="small" label="Edición" color="warning" />
            ) : (
              <Chip size="small" label="Creación" color="success" />
            )}
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          onClick={() =>
            id ? navigate(`/paxs/profile/${id}`) : navigate("/paxs")
          }
        >
          Volver
        </Button>
        <Button type="submit" form="pax-form" variant="contained">
          {id ? "Guardar cambios" : "Crear pasajero"}
        </Button>
      </Stack>
    </Stack>
  );
};
