import { useEffect, useState, ReactNode } from "react";
import { Box, Button, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PaymentsIcon from "@mui/icons-material/Payments";
import StorefrontIcon from "@mui/icons-material/Storefront";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import BadgeIcon from "@mui/icons-material/Badge";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { LIQUIDATION_WARNING_DAYS } from "./File/utils/liquidation";
import { getHome, iHome } from "./inicioHandler";
import { formatFileNumber } from "./File/utils/fileNumber";
import { formatMoney } from "./File/utils/totals";

// Pagos a mayoristas que se muestran en el inicio (el resto, con el botón "Ver los restantes")
const HOME_SUPPLIER_ITEMS = 4;
// Servicios sin liquidar que se muestran antes de "Ver los restantes"
const HOME_LIST_ITEMS = 4;

/* ---------- Textos ---------- */

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Buen día" : hour < 20 ? "Buenas tardes" : "Buenas noches";
};

const fullName = (p?: { firstname: string; lastname: string } | null) => (p ? `${p.firstname} ${p.lastname}` : "");

// "hoy", "mañana", "en 5 días", "hace 3 días"
const whenText = (days: number) =>
  days === 0 ? "hoy" : days === 1 ? "mañana" : days === -1 ? "ayer" : days > 0 ? `en ${days} días` : `hace ${-days} días`;

const plural = (n: number, singular: string, pluralWord: string) => `${n} ${n === 1 ? singular : pluralWord}`;

/* ---------- Colores del semáforo ---------- */

type Level = "red" | "orange" | "blue" | "green";
const LEVEL: Record<Level, { main: string; soft: string }> = {
  red: { main: "#c62828", soft: "#fdecea" },
  orange: { main: "#b45309", soft: "#fff4e5" },
  blue: { main: "#0D5B75", soft: "#e6f1f5" },
  green: { main: "#2e7d32", soft: "#edf7ed" },
};

/* ---------- 1. Tareas ---------- */

const TASKS = [
  { title: "Cargar un pasajero", text: "Sus datos, documentos y fotos", icon: <PersonAddIcon />, to: "/paxs/create" },
  { title: "Crear un file", text: "Un viaje con sus pasajeros y servicios", icon: <NoteAddIcon />, to: "/files/create" },
  { title: "Registrar un cobro", text: "Cuando un pasajero nos paga", icon: <PaymentsIcon />, to: "/pagos" },
  { title: "Pagar a un mayorista", text: "Anotar lo que le pagamos", icon: <StorefrontIcon />, to: "/pagos?seccion=mayoristas" },
];

const TaskCard = ({ task }: { task: (typeof TASKS)[number] }) => (
  <Paper
    component={Link}
    to={task.to}
    elevation={0}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2.5,
      height: "100%",
      // El alto incluye el margen interno (si no, la tarjeta se sale de su lugar y tapa lo de abajo)
      boxSizing: "border-box",
      borderRadius: 3,
      textDecoration: "none",
      color: "inherit",
      backgroundColor: "#fff",
      border: "2px solid transparent",
      boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
      transition: "all 0.2s ease",
      "&:hover, &:focus-visible": { borderColor: "#0D5B75", transform: "translateY(-3px)", boxShadow: "0 10px 24px rgba(0,0,0,0.18)" },
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        flexShrink: 0,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        backgroundColor: "#e6f1f5",
        color: "#0D5B75",
        "& svg": { fontSize: 30 },
      }}
    >
      {task.icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#123" }}>{task.title}</Typography>
      <Typography sx={{ color: "#4a5b63", fontSize: "0.95rem" }}>{task.text}</Typography>
    </Box>
  </Paper>
);

/* ---------- 2. Resumen "para revisar hoy" ---------- */

interface Summary {
  key: string;
  icon: JSX.Element;
  level: Level;
  title: string;
  detail: string;
}

const SummaryCard = ({ summary, onClick }: { summary: Summary; onClick: () => void }) => {
  const color = LEVEL[summary.level];
  return (
    <Paper
      component="button"
      onClick={onClick}
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        cursor: "pointer",
        font: "inherit",
        p: 2,
        borderRadius: 3,
        border: "none",
        borderLeft: `6px solid ${color.main}`,
        backgroundColor: "#fff",
        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        transition: "transform 0.2s ease",
        "&:hover, &:focus-visible": { transform: "translateY(-2px)" },
      }}
    >
      <Box sx={{ color: color.main, backgroundColor: color.soft, borderRadius: 2, p: 1, display: "flex", "& svg": { fontSize: 26 } }}>
        {summary.level === "green" ? <CheckCircleIcon /> : summary.icon}
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: color.main, lineHeight: 1.3 }}>{summary.title}</Typography>
        <Typography sx={{ color: "#4a5b63", fontSize: "0.9rem", mt: 0.25 }}>{summary.detail}</Typography>
      </Box>
    </Paper>
  );
};

const buildSummaries = (home: iHome): Summary[] => {
  const salidas = home.proximasSalidas.length;
  const cobrosVencidos = home.cobros.vencidos;
  const cobrosSemana = home.cobros.semana;
  const mayVencidos = home.mayoristas.vencidos;
  const maySemana = home.mayoristas.semana;
  const nextSupplier = home.mayoristas.items[0];
  const liquidar = home.sinLiquidar.total;
  // Urgencia por su fecha de liquidación: vencida o es hoy (rojo), dentro de una semana (naranja)
  const liquidarUrgente = home.sinLiquidar.items.filter((s) => s.diasParaLiquidar <= 0).length;
  const liquidarPronto = home.sinLiquidar.items.filter((s) => s.diasParaLiquidar <= LIQUIDATION_WARNING_DAYS).length;
  const docProblems = home.documentos.items.filter((d) => d.problema).length;
  const docs = home.documentos.total;

  return [
    {
      key: "salidas",
      icon: <FlightTakeoffIcon />,
      level: salidas > 0 ? "blue" : "green",
      title: salidas > 0 ? `${plural(salidas, "viaje sale", "viajes salen")} pronto` : "No hay salidas próximas",
      detail: "En los próximos 15 días",
    },
    {
      key: "cobros",
      icon: <AccountBalanceWalletIcon />,
      level: cobrosVencidos > 0 ? "red" : cobrosSemana > 0 ? "orange" : "green",
      title:
        cobrosVencidos > 0
          ? `${plural(cobrosVencidos, "cobro vencido", "cobros vencidos")}`
          : cobrosSemana > 0
            ? `${plural(cobrosSemana, "cobro vence", "cobros vencen")} esta semana`
            : "Cobros al día",
      detail: "Lo que nos tienen que pagar los pasajeros",
    },
    {
      key: "mayoristas",
      icon: <StorefrontIcon />,
      level: mayVencidos > 0 ? "red" : maySemana > 0 ? "orange" : nextSupplier ? "blue" : "green",
      title:
        mayVencidos > 0
          ? `${plural(mayVencidos, "pago vencido", "pagos vencidos")} a mayoristas`
          : maySemana > 0
            ? `${plural(maySemana, "pago a mayorista vence", "pagos a mayoristas vencen")} esta semana`
            : nextSupplier
              ? "Próximo pago a mayorista"
              : "Nada para pagar a mayoristas",
      // Si no hay nada urgente, cuál es el próximo que se viene
      detail:
        mayVencidos === 0 && maySemana === 0 && nextSupplier && nextSupplier.diasParaVencer !== null
          ? `${nextSupplier.mayorista || "Mayorista"}: ${formatMoney(nextSupplier.falta, nextSupplier.currency)}, vence ${whenText(nextSupplier.diasParaVencer)}`
          : "Lo que tenemos que pagar nosotros",
    },
    {
      key: "liquidar",
      icon: <AssignmentLateIcon />,
      level: liquidarUrgente > 0 ? "red" : liquidarPronto > 0 ? "orange" : liquidar > 0 ? "blue" : "green",
      title:
        liquidarPronto > 0
          ? `${plural(liquidarPronto, "servicio para liquidar ya", "servicios para liquidar ya")}`
          : liquidar > 0
            ? `${plural(liquidar, "servicio sin liquidar", "servicios sin liquidar")}`
            : "Todo liquidado",
      detail:
        liquidarUrgente > 0
          ? "Su fecha para liquidar ya llegó"
          : liquidarPronto > 0
            ? "Hay que liquidarlos esta semana"
            : liquidar > 0
              ? `El próximo se liquida ${whenText(home.sinLiquidar.items[0].diasParaLiquidar)}`
              : "Todos los servicios están liquidados",
    },
    {
      key: "facturar",
      icon: <ReceiptIcon />,
      level: home.facturar.total > 0 ? "orange" : "green",
      title: home.facturar.total > 0 ? plural(home.facturar.total, "file para facturar", "files para facturar") : "Facturación al día",
      detail: home.facturar.total > 0 ? "Los pasajeros ya pagaron todo" : "No hay files pagados sin facturar",
    },
    {
      key: "documentos",
      icon: <BadgeIcon />,
      level: docProblems > 0 ? "red" : docs > 0 ? "orange" : "green",
      title:
        docProblems > 0
          ? `${plural(docProblems, "documento traba", "documentos traban")} un viaje`
          : docs > 0
            ? `${plural(docs, "documento vence", "documentos vencen")} pronto`
            : "Documentos en orden",
      detail: "DNI y pasaportes de los pasajeros",
    },
  ];
};

/* ---------- 3. Detalle ---------- */

const Panel = ({ id, title, icon, link, linkText, footer, children }: { id: string; title: string; icon: JSX.Element; link?: string; linkText?: string; footer?: ReactNode; children: ReactNode[] }) =>
  children.length === 0 ? null : (
    <Paper id={id} elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)", scrollMarginTop: 90 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#0D5B75", "& svg": { fontSize: 26 } }}>
          {icon}
          <Typography sx={{ fontWeight: 700, fontSize: "1.15rem" }}>{title}</Typography>
        </Box>
        {link && (
          <Button component={Link} to={link} endIcon={<ChevronRightIcon />} sx={{ textTransform: "none", fontWeight: 600, color: "#0D5B75" }}>
            {linkText ?? "Ver todo"}
          </Button>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>{children}</Box>
      {footer}
    </Paper>
  );

// Una línea del detalle: frase a la izquierda, dato importante a la derecha; lleva al file o pasajero
const Line = ({ to, level, main, sub, right }: { to: string; level: Level; main: ReactNode; sub?: ReactNode; right: ReactNode }) => {
  const navigate = useNavigate();
  return (
    <Box
      role="link"
      tabIndex={0}
      onClick={() => navigate(to)}
      onKeyDown={(e) => e.key === "Enter" && navigate(to)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.25,
        px: 1,
        mx: -1,
        borderRadius: 2,
        cursor: "pointer",
        borderBottom: "1px solid #eef2f4",
        "&:last-of-type": { borderBottom: "none" },
        "&:hover, &:focus-visible": { backgroundColor: "#f2f8fa", outline: "none" },
      }}
    >
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: LEVEL[level].main, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 600, color: "#123" }}>{main}</Typography>
        {sub && <Typography sx={{ fontSize: "0.9rem", color: "#5b6d74" }}>{sub}</Typography>}
      </Box>
      <Box sx={{ textAlign: "right", flexShrink: 0 }}>{right}</Box>
      <ChevronRightIcon sx={{ color: "#9db1b8" }} />
    </Box>
  );
};

const Right = ({ strong, small, level }: { strong: ReactNode; small?: ReactNode; level?: Level }) => (
  <>
    <Typography sx={{ fontWeight: 700, color: level ? LEVEL[level].main : "#123", whiteSpace: "nowrap" }}>{strong}</Typography>
    {small && <Typography sx={{ fontSize: "0.85rem", color: "#5b6d74", whiteSpace: "nowrap" }}>{small}</Typography>}
  </>
);

const fileText = (file: { numero?: number | null; anio?: number | null; destino: string }) =>
  formatFileNumber(file) ? `${file.destino} (file ${formatFileNumber(file)})` : file.destino;

/* ---------- Inicio ---------- */

export const Inicio = () => {
  const [home, setHome] = useState<iHome | null>(null);
  const [error, setError] = useState(false);
  const [showAllUnsettled, setShowAllUnsettled] = useState(false);

  useEffect(() => {
    getHome().then((data) => {
      if (data) setHome(data);
      else setError(true);
    });
  }, []);

  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 68px)",
        backgroundImage: "linear-gradient(160deg, #0D5B75 0%, #1a7a99 45%, #89c2d9 100%)",
        px: { xs: 2, md: 6 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Saludo */}
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: { xs: "1.8rem", md: "2.2rem" } }}>{greeting()} 👋</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1.1rem", "&::first-letter": { textTransform: "uppercase" } }}>
            {today}
          </Typography>
        </Box>

        {/* 1. Tareas */}
        <Box component="section">
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.3rem", mb: 1.5 }}>¿Qué querés hacer?</Typography>
          <Grid container spacing={2}>
            {TASKS.map((task) => (
              <Grid item xs={12} sm={6} md={3} key={task.title}>
                <TaskCard task={task} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 2 y 3. Resumen y detalle */}
        {error ? (
          <Paper sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography color="error" sx={{ fontSize: "1.05rem" }}>
              No se pudo cargar el resumen del día. Probá recargar la página.
            </Typography>
          </Paper>
        ) : !home ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress sx={{ color: "#fff" }} />
          </Box>
        ) : (
          <>
            <Box component="section">
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.3rem", mb: 1.5 }}>Para revisar hoy</Typography>
              <Grid container spacing={2}>
                {buildSummaries(home).map((summary) => (
                  <Grid item xs={12} sm={6} md={4} key={summary.key}>
                    <SummaryCard summary={summary} onClick={() => scrollTo(`detalle-${summary.key}`)} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Panel id="detalle-salidas" title="Próximas salidas" icon={<FlightTakeoffIcon />} link="/files" linkText="Ir a files">
                {home.proximasSalidas.map((f) => (
                  <Line
                    key={f.id}
                    to={`/files/profile/${f.id}`}
                    level={f.sinLiquidar > 0 ? "orange" : "blue"}
                    main={fileText(f)}
                    sub={
                      <>
                        {fullName(f.primerPasajero) || "Sin pasajeros"}
                        {f.pasajeros > 1 ? ` y ${plural(f.pasajeros - 1, "persona más", "personas más")}` : ""}
                        {f.sinLiquidar > 0 && (
                          <Box component="span" sx={{ color: LEVEL.orange.main, fontWeight: 600 }}>
                            {" "}· {plural(f.sinLiquidar, "servicio sin liquidar", "servicios sin liquidar")}
                          </Box>
                        )}
                      </>
                    }
                    right={<Right strong={`Sale ${whenText(f.diasParaSalida)}`} small={dayjs(f.fechaSalida).format("DD/MM/YYYY")} />}
                  />
                ))}
              </Panel>

              <Panel id="detalle-cobros" title="Cobros a pasajeros" icon={<AccountBalanceWalletIcon />} link="/pagos" linkText="Ir a cobros">
                {home.cobros.items.map((c) => {
                  const due = c.proximoVencimiento;
                  const level: Level = due && due.diasParaVencer < 0 ? "red" : "orange";
                  return (
                    <Line
                      key={c.id}
                      to={`/files/profile/${c.id}`}
                      level={level}
                      main={`${fullName(c.pasajero) || "Sin pasajero"} debe ${formatMoney(due?.falta ?? c.falta, c.moneda)}`}
                      sub={`${due?.concepto ?? "Pago"} · ${fileText(c)}`}
                      right={
                        due && (
                          <Right
                            level={level}
                            strong={due.diasParaVencer < 0 ? `Venció ${whenText(due.diasParaVencer)}` : `Vence ${whenText(due.diasParaVencer)}`}
                            small={dayjs(due.vencimiento).format("DD/MM/YYYY")}
                          />
                        )
                      }
                    />
                  );
                })}
              </Panel>

              <Panel
                id="detalle-liquidar"
                title="Servicios sin liquidar"
                icon={<AssignmentLateIcon />}
                footer={
                  home.sinLiquidar.items.length > HOME_LIST_ITEMS && (
                    <Button
                      fullWidth
                      onClick={() => setShowAllUnsettled((v) => !v)}
                      endIcon={showAllUnsettled ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{ mt: 1, textTransform: "none", fontWeight: 600, fontSize: "0.95rem", color: "#0D5B75", backgroundColor: "#f2f8fa", borderRadius: 2 }}
                    >
                      {showAllUnsettled
                        ? "Ver menos"
                        : `Ver ${home.sinLiquidar.items.length - HOME_LIST_ITEMS === 1 ? "el servicio restante" : `los ${home.sinLiquidar.items.length - HOME_LIST_ITEMS} servicios restantes`}`}
                    </Button>
                  )
                }
              >
                {(showAllUnsettled ? home.sinLiquidar.items : home.sinLiquidar.items.slice(0, HOME_LIST_ITEMS)).map((s) => {
                  // Rojo: la fecha para liquidar ya llegó; naranja: dentro de una semana; azul: más adelante
                  const level: Level =
                    s.diasParaLiquidar <= 0 ? "red" : s.diasParaLiquidar <= LIQUIDATION_WARNING_DAYS ? "orange" : "blue";
                  return (
                    <Line
                      key={s.id}
                      to={`/files/profile/${s.file.id}`}
                      level={level}
                      main={s.nombre || "Servicio sin nombre"}
                      sub={`${s.provider ? `${s.provider} · ` : ""}${fileText(s.file)}`}
                      right={
                        <Right
                          level={level}
                          strong={s.diasParaLiquidar < 0 ? `Liquidar: venció ${whenText(s.diasParaLiquidar)}` : `Liquidar ${whenText(s.diasParaLiquidar)}`}
                          small={`antes del ${dayjs(s.fechaLiquidacion).format("DD/MM/YYYY")} · sale ${dayjs(s.file.fechaSalida).format("DD/MM")}`}
                        />
                      }
                    />
                  );
                })}
              </Panel>

              <Panel
                id="detalle-mayoristas"
                title="Pagos a mayoristas"
                icon={<StorefrontIcon />}
                link="/pagos?seccion=mayoristas"
                linkText="Ir a mayoristas"
                footer={
                  home.mayoristas.total > HOME_SUPPLIER_ITEMS && (
                    <Button
                      component={Link}
                      to="/pagos?seccion=mayoristas"
                      fullWidth
                      endIcon={<ChevronRightIcon />}
                      sx={{ mt: 1, textTransform: "none", fontWeight: 600, fontSize: "0.95rem", color: "#0D5B75", backgroundColor: "#f2f8fa", borderRadius: 2 }}
                    >
                      Ver {home.mayoristas.total - HOME_SUPPLIER_ITEMS === 1 ? "el pago restante" : `los ${home.mayoristas.total - HOME_SUPPLIER_ITEMS} pagos restantes`} en Pagos a mayoristas
                    </Button>
                  )
                }
              >
                {/* Solo los próximos 4; el resto, en Pagos a mayoristas */}
                {home.mayoristas.items.slice(0, HOME_SUPPLIER_ITEMS).map((m) => {
                  // Rojo vencido, naranja esta semana, azul los que vienen más adelante
                  const days = m.diasParaVencer;
                  const level: Level = days !== null && days < 0 ? "red" : days !== null && days <= 7 ? "orange" : "blue";
                  return (
                    <Line
                      key={m.id}
                      to={m.file ? `/files/profile/${m.file.id}` : "/pagos?seccion=mayoristas"}
                      level={level}
                      main={`Pagarle ${formatMoney(m.falta, m.currency)} a ${m.mayorista || "un mayorista sin nombre"}`}
                      sub={`${m.file ? fileText(m.file) : ""} · ${plural(m.servicios, "servicio", "servicios")}`}
                      right={
                        days !== null && (
                          <Right
                            level={level}
                            strong={days < 0 ? `Venció ${whenText(days)}` : `Vence ${whenText(days)}`}
                            small={m.vencimiento ? dayjs(m.vencimiento).format("DD/MM/YYYY") : undefined}
                          />
                        )
                      }
                    />
                  );
                })}
              </Panel>

              <Panel
                id="detalle-facturar"
                title="Files para facturar"
                icon={<ReceiptIcon />}
                link="/pagos?seccion=balance"
                linkText="Ir a facturación"
                footer={
                  home.facturar.total > home.facturar.items.length && (
                    <Button
                      component={Link}
                      to="/pagos?seccion=balance"
                      fullWidth
                      sx={{ mt: 1, textTransform: "none", fontWeight: 600, fontSize: "0.95rem", color: "#0D5B75", backgroundColor: "#f2f8fa", borderRadius: 2 }}
                    >
                      Ver los {home.facturar.total} files para facturar
                    </Button>
                  )
                }
              >
                {home.facturar.items.map((f) => (
                  <Line
                    key={f.id}
                    to={`/files/profile/${f.id}?seccion=pagos`}
                    level="orange"
                    main={`Facturar ${formatMoney(f.total, f.moneda)}${f.pasajero ? ` a ${fullName(f.pasajero)}` : ""}`}
                    sub={fileText(f)}
                    right={<Right level="orange" strong="Ya pagó todo" small={`viaje del ${dayjs(f.fechaSalida).format("DD/MM/YYYY")}`} />}
                  />
                ))}
              </Panel>

              <Panel id="detalle-documentos" title="Documentos de pasajeros" icon={<BadgeIcon />} link="/paxs" linkText="Ir a pasajeros">
                {home.documentos.items.map((d) => (
                  <Line
                    key={`${d.paxId}-${d.documento}`}
                    to={`/paxs/profile/${d.paxId}`}
                    level={d.problema ? "red" : "orange"}
                    main={`${d.documento === "DNI" ? "El DNI" : "El pasaporte"} de ${d.pasajero}`}
                    sub={d.problema ?? `Vence el ${dayjs(d.vencimiento).format("DD/MM/YYYY")}`}
                    right={
                      <Right
                        level={d.problema ? "red" : "orange"}
                        strong={d.diasParaVencer < 0 ? "Vencido" : `Vence ${whenText(d.diasParaVencer)}`}
                      />
                    }
                  />
                ))}
              </Panel>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};
