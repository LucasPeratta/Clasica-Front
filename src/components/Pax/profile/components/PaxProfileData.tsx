import { ReactNode } from "react";
import { Box, Chip, Grid, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import BadgeIcon from "@mui/icons-material/Badge";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import PersonIcon from "@mui/icons-material/Person";
import { iPax } from "../../model";

interface PaxProfileDataProps {
  pax: iPax;
}

// Tarjeta de un tema (Documentos, Contacto, ...)
export const InfoCard = ({ title, icon, children }: { title: string; icon: JSX.Element; children: ReactNode }) => (
  <Paper elevation={0} sx={{ p: 2.5, height: "100%", boxSizing: "border-box", borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#0D5B75", mb: 1.5, "& svg": { fontSize: 26 } }}>
      {icon}
      <Typography sx={{ fontWeight: 700, fontSize: "1.15rem" }}>{title}</Typography>
    </Box>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>{children}</Box>
  </Paper>
);

// Un dato: etiqueta chica arriba, valor grande abajo
const Field = ({ label, value, extra }: { label: string; value?: ReactNode; extra?: ReactNode }) => (
  <Box>
    <Typography sx={{ fontSize: "0.85rem", color: "#5b6d74" }}>{label}</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <Typography sx={{ fontSize: "1.05rem", fontWeight: 600, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {value || <Box component="span" sx={{ color: "#9db1b8", fontWeight: 400 }}>Sin cargar</Box>}
      </Typography>
      {extra}
    </Box>
  </Box>
);

// Estado de un documento según su vencimiento
const ExpiryStatus = ({ expiry }: { expiry: iPax["dniVto"] }) => {
  if (!expiry) return null;
  const days = dayjs(expiry).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days < 0) return <Chip size="small" color="error" label="Vencido" sx={{ fontWeight: 600 }} />;
  if (days <= 183) {
    const when = days < 31 ? `${days} día${days === 1 ? "" : "s"}` : `${Math.floor(days / 30)} mes${Math.floor(days / 30) === 1 ? "" : "es"}`;
    return <Chip size="small" color="warning" label={`Vence en ${when}`} sx={{ fontWeight: 600 }} />;
  }
  return <Chip size="small" color="success" variant="outlined" label="Vigente" sx={{ fontWeight: 600 }} />;
};

const formatDate = (value: iPax["dniVto"]) => (value ? dayjs(value).format("DD/MM/YYYY") : "");

/**
 * Datos del pasajero ordenados por tema
 */
export const PaxProfileData = ({ pax }: PaxProfileDataProps) => {
  const age = pax.dob ? dayjs().diff(dayjs(pax.dob), "year") : null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <InfoCard title="Documentos" icon={<BadgeIcon />}>
          <Field label="DNI" value={pax.dni} />
          <Field
            label="Vencimiento del DNI"
            value={formatDate(pax.dniVto)}
            extra={<ExpiryStatus expiry={pax.dniVto} />}
          />
          <Field label="Pasaporte" value={pax.passport} />
          <Field
            label="Vencimiento del pasaporte"
            value={formatDate(pax.passportVto)}
            extra={<ExpiryStatus expiry={pax.passportVto} />}
          />
          {(pax.visaUsa || pax.visaUsaVto) && (
            <Field
              label="Visa de EE.UU."
              value={[pax.visaUsa, pax.visaUsaVto && `vence el ${formatDate(pax.visaUsaVto)}`].filter(Boolean).join(" · ")}
              extra={<ExpiryStatus expiry={pax.visaUsaVto ?? null} />}
            />
          )}
        </InfoCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <InfoCard title="Contacto" icon={<ContactPhoneIcon />}>
          <Field label="Celular" value={pax.phoneNumber} />
          <Field label="Email" value={pax.email} />
          <Field label="Dirección" value={pax.adress} />
        </InfoCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <InfoCard title="Datos personales" icon={<PersonIcon />}>
          <Field
            label="Fecha de nacimiento"
            value={pax.dob ? `${formatDate(pax.dob)}${age !== null ? ` (${age} años)` : ""}` : ""}
          />
          <Field label="Observaciones" value={pax.obs} />
        </InfoCard>
      </Grid>
    </Grid>
  );
};
