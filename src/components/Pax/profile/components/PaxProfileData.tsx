import { Grid, Stack, Typography, Divider } from "@mui/material";
import dayjs from "dayjs";
import BadgeIcon from "@mui/icons-material/Badge";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HomeIcon from "@mui/icons-material/Home";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import NotesIcon from "@mui/icons-material/Notes";
import { iPax } from "../../model";
import { safeFormatDate, display } from "../../utils/formatters";

interface PaxProfileDataProps {
  pax: iPax;
}

export const PaxProfileData = ({ pax }: PaxProfileDataProps) => {
  return (
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
          {pax.dob ? safeFormatDate(dayjs(pax.dob).toDate()) : "—"}
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
        <Typography mt={0.5} sx={{ fontWeight: 600, whiteSpace: "pre-wrap" }}>
          {display(pax.obs)}
        </Typography>
      </Grid>
    </Grid>
  );
};
