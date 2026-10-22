import { Avatar, Box, Button, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useGoBack } from "../../../common/useGoBack";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { initials } from "../../utils/formatters";
import { iPax } from "../../model";

interface PaxProfileHeaderProps {
  pax: iPax;
  fromFileId?: string;
}

/**
 * Encabezado del perfil: nombre grande, DNI y edad, y los botones Volver / Editar datos
 */
export const PaxProfileHeader = ({ pax, fromFileId }: PaxProfileHeaderProps) => {
  // Vuelve a la pantalla anterior (si se entró desde un file, a ese file)
  const handleBack = useGoBack(fromFileId ? `/files/profile/${fromFileId}` : "/paxs");
  const age = pax.dob ? dayjs().diff(dayjs(pax.dob), "year") : null;
  const subtitle = [pax.dni && `DNI ${pax.dni}`, age !== null && `${age} años`].filter(Boolean).join(" · ");

  return (
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: "#0D5B75", width: 64, height: 64, fontSize: 24 }}>
          {initials(pax.lastname, pax.firstname)}
        </Avatar>
        <Box>
          <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: "1.5rem", md: "1.9rem" }, lineHeight: 1.2 }}>
            {pax.firstname} {pax.lastname}
          </Typography>
          <Typography sx={{ color: "#5b6d74", fontSize: "1.05rem" }}>{subtitle || "Pasajero"}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 600, borderRadius: 2, px: 2.5 }}
        >
          Volver
        </Button>
        <Button
          component={Link}
          to={`/paxs/update/${pax.id}`}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ textTransform: "none", fontSize: "1rem", fontWeight: 700, borderRadius: 2, px: 2.5, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
        >
          Editar datos
        </Button>
      </Box>
    </Paper>
  );
};
