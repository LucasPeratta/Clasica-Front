import { useEffect, useState, ReactNode } from "react";
import { Box, Chip, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import PersonIcon from "@mui/icons-material/Person"; // pasajeros
import AssignmentIcon from "@mui/icons-material/Assignment"; // files
import GroupsIcon from "@mui/icons-material/Groups"; // salidas grupales
import RoomServiceIcon from "@mui/icons-material/RoomService"; // servicios
import PaymentsIcon from "@mui/icons-material/Payments"; // pagos
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import BadgeIcon from "@mui/icons-material/Badge";
import { getHome, iHome } from "./inicioHandler";
import { formatFileNumber } from "./File/utils/fileNumber";
import { formatMoney } from "./File/utils/totals";
import { LIQUIDATION_URGENT_DAYS } from "./File/utils/liquidation";

const sections = [
  { title: "PASAJEROS", icon: <PersonIcon />, route: "/paxs", color: "#0077b6" },
  { title: "FILES", icon: <AssignmentIcon />, route: "/files", color: "#0096c7" },
  { title: "SERVICIOS", icon: <RoomServiceIcon />, route: "/services", color: "#0369a1" },
  { title: "PAGOS", icon: <PaymentsIcon />, route: "/pagos", color: "#0D5B75" },
  // Sección todavía no desarrollada
  { title: "GRUPALES", icon: <GroupsIcon />, route: "/groups", color: "#023e8a", comingSoon: true },
];

const TYPE_LABEL: Record<string, string> = { AEREO: "✈️", HOTEL: "🏨", EXCURSION: "🎒", TRASLADO: "🚗" };

const fileLabel = (file: { numero?: number | null; anio?: number | null; destino: string }) =>
  [formatFileNumber(file), file.destino].filter(Boolean).join(" · ");

// "Vencido hace 3 días" / "Hoy" / "En 5 días"
const daysText = (days: number, past = "Vencido hace", future = "En") =>
  days < 0 ? `${past} ${-days} día${days === -1 ? "" : "s"}` : days === 0 ? "Hoy" : `${future} ${days} día${days === 1 ? "" : "s"}`;

const DaysChip = ({ days, warnFrom = 7, past }: { days: number; warnFrom?: number; past?: string }) => {
  const color = days < 0 ? "error" : days <= warnFrom ? "warning" : "default";
  return (
    <Chip
      size="small"
      color={color}
      variant={color === "default" ? "outlined" : "filled"}
      label={daysText(days, past)}
      sx={{ fontWeight: 600 }}
    />
  );
};

/* ---------- Recuadro del tablero ---------- */

interface PanelProps {
  title: string;
  icon: JSX.Element;
  summary?: ReactNode;
  link?: string;
  empty: string;
  children: ReactNode[];
}

const Panel = ({ title, icon, summary, link, empty, children }: PanelProps) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      height: "100%",
      borderRadius: 3,
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#0D5B75" }}>
        {icon}
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      </Box>
      {link && (
        <Typography component={Link} to={link} variant="body2" sx={{ color: "#0D5B75", fontWeight: 600, textDecoration: "none" }}>
          Ver todo →
        </Typography>
      )}
    </Box>
    {summary && <Box sx={{ mb: 1 }}>{summary}</Box>}
    {children.length === 0 ? (
      <Typography sx={{ color: "success.main", fontWeight: 600, py: 1 }}>✓ {empty}</Typography>
    ) : (
      children
    )}
  </Paper>
);

const Row = ({ to, left, right }: { to: string; left: ReactNode; right: ReactNode }) => {
  const navigate = useNavigate();
  return (
    <Box
      onClick={() => navigate(to)}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
        py: 0.75,
        px: 1,
        mx: -1,
        borderRadius: 1.5,
        cursor: "pointer",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        "&:hover": { backgroundColor: "rgba(13, 91, 117, 0.06)" },
      }}
    >
      <Box sx={{ minWidth: 0 }}>{left}</Box>
      <Box sx={{ textAlign: "right", flexShrink: 0 }}>{right}</Box>
    </Box>
  );
};

const Primary = ({ children }: { children: ReactNode }) => (
  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
    {children}
  </Typography>
);
const Secondary = ({ children, color = "text.secondary" }: { children: ReactNode; color?: string }) => (
  <Typography variant="caption" sx={{ color, display: "block" }} noWrap>
    {children}
  </Typography>
);

/* ---------- Inicio ---------- */

export const Inicio = () => {
  const [home, setHome] = useState<iHome | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getHome().then((data) => {
      if (data) setHome(data);
      else setError(true);
    });
  }, []);

  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundImage:
          "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%), " +
          "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), " +
          "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
        px: { xs: 2, md: 6 },
        py: 3,
      }}
    >
      <Box sx={{ maxWidth: 1300, mx: "auto" }}>
        {/* Encabezado */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box sx={{ backgroundColor: "#fff", borderRadius: 2, p: 0.75, display: "flex", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
            <img src="/clasicalogo.jpg" alt="Clásica Moderna" style={{ height: 44, borderRadius: 6 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
              ¡Hola! 👋
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", textTransform: "capitalize" }}>{today}</Typography>
          </Box>
        </Box>

        {/* Accesos directos */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {sections.map((section) => {
            const card = (
              <Paper
                elevation={4}
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  borderRadius: 3,
                  color: "#fff",
                  backgroundColor: section.color,
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  opacity: section.comingSoon ? 0.55 : 1,
                  cursor: section.comingSoon ? "default" : "pointer",
                  transition: "all 0.3s ease",
                  "& svg": { fontSize: 30 },
                  "&:hover": section.comingSoon
                    ? {}
                    : { transform: "translateY(-4px)", boxShadow: "0 10px 24px rgba(0,0,0,0.35)" },
                }}
              >
                {section.icon}
                <Box>
                  <Typography sx={{ fontWeight: 700, letterSpacing: 0.5 }}>{section.title}</Typography>
                  {section.comingSoon && <Typography variant="caption">Próximamente</Typography>}
                </Box>
              </Paper>
            );
            return (
              <Grid item xs={6} sm={4} md key={section.title}>
                {section.comingSoon ? (
                  card
                ) : (
                  <Link to={section.route} style={{ textDecoration: "none" }}>
                    {card}
                  </Link>
                )}
              </Grid>
            );
          })}
        </Grid>

        {/* Tablero */}
        {error ? (
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Typography color="error">No se pudo cargar el resumen del día.</Typography>
          </Paper>
        ) : !home ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#fff" }} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Próximas salidas */}
            <Grid item xs={12} md={6}>
              <Panel
                title="Próximas salidas (15 días)"
                icon={<FlightTakeoffIcon />}
                link="/files"
                empty="No hay salidas en los próximos 15 días."
              >
                {home.proximasSalidas.map((f) => (
                  <Row
                    key={f.id}
                    to={`/files/profile/${f.id}`}
                    left={
                      <>
                        <Primary>{fileLabel(f)}</Primary>
                        <Secondary>
                          {f.primerPasajero ? `${f.primerPasajero.lastname} ${f.primerPasajero.firstname}` : "Sin pasajeros"}
                          {f.pasajeros > 1 ? ` +${f.pasajeros - 1}` : ""}
                        </Secondary>
                        {f.sinLiquidar > 0 && (
                          <Secondary color="error.main">
                            ⚠ {f.sinLiquidar} servicio{f.sinLiquidar === 1 ? "" : "s"} sin liquidar
                          </Secondary>
                        )}
                      </>
                    }
                    right={
                      <>
                        <Chip
                          size="small"
                          color={f.diasParaSalida === 0 ? "warning" : "primary"}
                          label={f.diasParaSalida === 0 ? "Sale hoy" : `En ${f.diasParaSalida} día${f.diasParaSalida === 1 ? "" : "s"}`}
                          sx={{ fontWeight: 600 }}
                        />
                        <Secondary>{dayjs(f.fechaSalida).format("DD/MM/YYYY")}</Secondary>
                      </>
                    }
                  />
                ))}
              </Panel>
            </Grid>

            {/* Cobros a pasajeros */}
            <Grid item xs={12} md={6}>
              <Panel
                title="Cobros a pasajeros"
                icon={<AccountBalanceWalletIcon />}
                link="/pagos"
                empty="No hay cobros vencidos ni que venzan esta semana."
                summary={
                  (home.cobros.vencidos > 0 || home.cobros.semana > 0) && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {home.cobros.vencidos > 0 && <Chip size="small" color="error" label={`${home.cobros.vencidos} vencidos`} />}
                      {home.cobros.semana > 0 && <Chip size="small" color="warning" label={`${home.cobros.semana} vencen esta semana`} />}
                    </Box>
                  )
                }
              >
                {home.cobros.items.map((c) => (
                  <Row
                    key={c.id}
                    to={`/files/profile/${c.id}`}
                    left={
                      <>
                        <Primary>{fileLabel(c)}</Primary>
                        <Secondary>
                          {c.pasajero ? `${c.pasajero.lastname} ${c.pasajero.firstname} · ` : ""}
                          {c.proximoVencimiento?.concepto}
                        </Secondary>
                      </>
                    }
                    right={
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "error.main" }}>
                          {formatMoney(c.proximoVencimiento?.falta ?? c.falta, c.moneda)}
                        </Typography>
                        {c.proximoVencimiento && <DaysChip days={c.proximoVencimiento.diasParaVencer} />}
                      </>
                    }
                  />
                ))}
              </Panel>
            </Grid>

            {/* Pagos a mayoristas */}
            <Grid item xs={12} md={6}>
              <Panel
                title="Pagos a mayoristas"
                icon={<StorefrontIcon />}
                link="/pagos?seccion=mayoristas"
                empty="No hay pagos a mayoristas vencidos ni que venzan esta semana."
                summary={
                  (home.mayoristas.vencidos > 0 || home.mayoristas.semana > 0) && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {home.mayoristas.vencidos > 0 && <Chip size="small" color="error" label={`${home.mayoristas.vencidos} vencidos`} />}
                      {home.mayoristas.semana > 0 && <Chip size="small" color="warning" label={`${home.mayoristas.semana} vencen esta semana`} />}
                    </Box>
                  )
                }
              >
                {home.mayoristas.items.map((s) => (
                  <Row
                    key={s.id}
                    to={s.file ? `/files/profile/${s.file.id}` : "/pagos?seccion=mayoristas"}
                    left={
                      <>
                        <Primary>
                          {TYPE_LABEL[s.type]} {s.nombre || "Sin nombre"}
                        </Primary>
                        <Secondary>
                          {s.provider || "Sin mayorista"}
                          {s.file ? ` · ${fileLabel(s.file)}` : ""}
                        </Secondary>
                      </>
                    }
                    right={
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "error.main" }}>
                          {formatMoney(s.falta, s.currency)}
                        </Typography>
                        {s.diasParaVencer !== null && <DaysChip days={s.diasParaVencer} />}
                      </>
                    }
                  />
                ))}
              </Panel>
            </Grid>

            {/* Servicios sin liquidar */}
            <Grid item xs={12} md={6}>
              <Panel
                title={`Servicios sin liquidar${home.sinLiquidar.total ? ` (${home.sinLiquidar.total})` : ""}`}
                icon={<AssignmentLateIcon />}
                empty="Todos los servicios de los próximos 30 días están liquidados."
              >
                {home.sinLiquidar.items.map((s) => (
                  <Row
                    key={s.id}
                    to={`/files/profile/${s.file.id}`}
                    left={
                      <>
                        <Primary>
                          {TYPE_LABEL[s.type]} {s.nombre || "Sin nombre"}
                        </Primary>
                        <Secondary>
                          {s.provider ? `${s.provider} · ` : ""}
                          {fileLabel(s.file)}
                        </Secondary>
                      </>
                    }
                    right={
                      <Chip
                        size="small"
                        color={s.diasParaSalida <= LIQUIDATION_URGENT_DAYS ? "error" : "warning"}
                        label={s.diasParaSalida === 0 ? "Sale hoy" : `Sale en ${s.diasParaSalida} días`}
                        sx={{ fontWeight: 600 }}
                      />
                    }
                  />
                ))}
              </Panel>
            </Grid>

            {/* Documentos */}
            <Grid item xs={12}>
              <Panel
                title={`Documentos por vencer o con problemas${home.documentos.total ? ` (${home.documentos.total})` : ""}`}
                icon={<BadgeIcon />}
                link="/paxs"
                empty="No hay documentos por vencer en los próximos 6 meses."
              >
                {home.documentos.items.map((d) => (
                  <Row
                    key={`${d.paxId}-${d.documento}`}
                    to={`/paxs/profile/${d.paxId}`}
                    left={
                      <>
                        <Primary>{d.pasajero}</Primary>
                        <Secondary>
                          {d.documento} · vence el {dayjs(d.vencimiento).format("DD/MM/YYYY")}
                        </Secondary>
                        {d.problema && <Secondary color="error.main">⚠ {d.problema}</Secondary>}
                      </>
                    }
                    right={
                      d.problema ? (
                        <Chip size="small" color="error" label={d.diasParaVencer < 0 ? "Vencido" : "Antes del viaje"} sx={{ fontWeight: 600 }} />
                      ) : (
                        <DaysChip days={d.diasParaVencer} warnFrom={60} />
                      )
                    }
                  />
                ))}
              </Panel>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};
