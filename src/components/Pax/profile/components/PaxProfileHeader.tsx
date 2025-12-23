import { Stack, Avatar, Box, Typography, Chip, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { initials } from "../../utils/formatters";
import { iPax } from "../../model";

interface PaxProfileHeaderProps {
  pax: iPax;
  fromFileId?: string;
}

export const PaxProfileHeader = ({
  pax,
  fromFileId,
}: PaxProfileHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (fromFileId) {
      navigate(`/files/profile/${fromFileId}`);
    } else {
      navigate("/paxs");
    }
  };

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
          {initials(pax.lastname, pax.firstname)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            {pax.firstname} {pax.lastname}
          </Typography>
          <Stack direction="row" spacing={1} mt={0.5}>
            <Chip size="small" color="primary" label="Pasajero" />
          </Stack>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Volver
        </Button>
        <Button
          component={Link}
          to={`/paxs/update/${pax.id}`}
          variant="contained"
          startIcon={<EditIcon />}
        >
          Editar
        </Button>
      </Stack>
    </Stack>
  );
};
