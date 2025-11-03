import { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Box,
  Paper,
  Grid,
  Stack,
  Typography,
  Divider,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import NotesIcon from "@mui/icons-material/Notes";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { getPaxById } from "./handler";
import type { iPax } from "./model";
import { LoadingScreen } from "../LoadingScreen";

function safeFormatDate(value?: string | Date | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD-MM-YYYY") : "—";
}

function display(value?: string | null) {
  return value && value.trim() ? value : "—";
}

function initials(lastname = "", firstname = "") {
  const a = (lastname || "").trim()[0] ?? "";
  const b = (firstname || "").trim()[0] ?? "";
  return (a + b).toUpperCase();
}

export const PaxProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [pax, setPax] = useState<iPax | null>(null);
  const [loading, setLoading] = useState(true);

  // 👇 si vengo desde un file, acá lo tengo
  const fromFileId = (location.state as { fromFileId?: string })?.fromFileId;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPaxById(id)
      .then((data) => setPax(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!pax) return <Typography>Error</Typography>;

  const handleBack = () => {
    if (fromFileId) {
      // volver al file del que vine
      navigate(`/files/profile/${fromFileId}`);
    } else {
      // comportamiento de siempre
      navigate("/paxs");
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 3,
        background: "linear-gradient(135deg, #e3f2fd 0%, #dbeeff 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
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
              onClick={handleBack} // 👈 ahora usa la función
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
      </Paper>

      {/* Datos */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          {/* DNI */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BadgeIcon color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                DNI
              </Typography>
            </Stack>
            <Typography mt={0.5} sx={{ fontWeight: 600 }}>
              {display(pax.dni)}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
          </Grid>

          {/* Pasaporte */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CreditCardIcon color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Pasaporte
              </Typography>
            </Stack>
            <Typography mt={0.5} sx={{ fontWeight: 600 }}>
              {display(pax.passport)}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
          </Grid>

          {/* Fecha de nacimiento */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonthIcon color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Fecha de Nacimiento
              </Typography>
            </Stack>
            <Typography mt={0.5} sx={{ fontWeight: 600 }}>
              {safeFormatDate(pax.dob as any)}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
          </Grid>

          {/* Dirección */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HomeIcon color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Dirección
              </Typography>
            </Stack>
            <Typography mt={0.5} sx={{ fontWeight: 600 }}>
              {display(pax.adress)}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
          </Grid>

          {/* Email */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EmailIcon color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
            </Stack>
            <Typography mt={0.5} sx={{ fontWeight: 600 }}>
              {display(pax.email)}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
          </Grid>

          {/* Celular */}
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PhoneIphoneIcon color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Celular
              </Typography>
            </Stack>
            <Typography mt={0.5} sx={{ fontWeight: 600 }}>
              {display(pax.phoneNumber)}
            </Typography>
            <Divider sx={{ mt: 1.5 }} />
          </Grid>

          {/* Observaciones */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} alignItems="center">
              <NotesIcon color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Observaciones
              </Typography>
            </Stack>
            <Typography
              mt={0.5}
              sx={{ fontWeight: 600, whiteSpace: "pre-wrap" }}
            >
              {display(pax.obs)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
