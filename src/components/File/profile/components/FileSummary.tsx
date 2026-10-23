import { ReactNode } from "react";
import { Alert, AlertTitle, Box, Chip, Paper, Typography } from "@mui/material";
import dayjs from "dayjs";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GroupIcon from "@mui/icons-material/Group";
import PaymentsIcon from "@mui/icons-material/Payments";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { iFile } from "../../model";
import { formatMoney } from "../../utils/totals";
import { getLiquidationAlert, hasLiquidation } from "../../utils/liquidation";
import { getDocumentAlerts } from "../../../Pax/utils/documentAlerts";
import { iPaymentsSummary, PAYMENT_STATUS } from "../../paymentsHandler";

interface FileSummaryProps {
  file: iFile;
  // Estado de los cobros (null mientras carga)
  payments: iPaymentsSummary | null;
  // Lleva a la pestaña correspondiente
  onSelect: (seccion: string) => void;
}

// Un cuadrito del resumen: título chico, dato grande y un detalle; se puede apretar
const Tile = ({
  icon,
  label,
  value,
  detail,
  onClick,
}: {
  icon: JSX.Element;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  onClick: () => void;
}) => (
  <Box
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    sx={{
      p: 2,
      borderRadius: 2,
      backgroundColor: "#f2f8fa",
      cursor: "pointer",
      minWidth: 0,
      transition: "background-color 0.15s",
      "&:hover, &:focus-visible": { backgroundColor: "#e3f0f4", outline: "none" },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#0D5B75", mb: 0.5, "& svg": { fontSize: 20 } }}>
      {icon}
      <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>{label}</Typography>
    </Box>
    <Typography component="div" sx={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.3 }}>
      {value}
    </Typography>
    {detail && (
      <Typography component="div" variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
        {detail}
      </Typography>
    )}
  </Box>
);

const departureDetail = (fechaSalida: iFile["fechaSalida"]) => {
  const days = dayjs(fechaSalida).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days === 0) return "Sale hoy";
  if (days === 1) return "Sale mañana";
  if (days > 1) return `Sale en ${days} días`;
  return "Ya salió";
};

const PaymentsValue = ({ payments }: { payments: iPaymentsSummary | null }) => {
  if (!payments) return <>…</>;
  if (!payments.moneda || payments.estado === "SIN_PLAN") return <>Sin importe</>;
  if (payments.estado === "PAGADO") return <Box sx={{ color: "success.dark" }}>Pagado ✓</Box>;
  // Reservas de grupos: lo que falta en cada moneda
  const owing = payments.porMoneda.filter((p) => p.falta > 0 && p.moneda);
  return (
    <Box sx={{ color: payments.estado === "VENCIDO" ? "error.main" : "text.primary" }}>
      {owing.length > 1
        ? owing.map((p) => <div key={p.moneda}>Falta {formatMoney(p.falta, p.moneda ?? "")}</div>)
        : `Falta ${formatMoney(owing[0]?.falta ?? payments.falta, owing[0]?.moneda ?? payments.moneda)}`}
    </Box>
  );
};

/**
 * Resumen del viaje arriba de todo: lo importante de un vistazo y los avisos
 */
export const FileSummary = ({ file, payments, onSelect }: FileSummaryProps) => {
  const clients = file.clients ?? [];
  const services = file.services ?? [];
  // Los aéreos no se liquidan (se pagan al emitirlos)
  const unsettled = services.filter((s) => hasLiquidation(s) && !s.liquidado).length;

  // Avisos: documentos de los pasajeros y servicios por liquidar cerca de la salida
  const documentWarnings = clients.flatMap((c) =>
    getDocumentAlerts(c, [file.fechaSalida]).map((a) => ({ level: a.level, text: `${c.firstname} ${c.lastname}: ${a.detail}` }))
  );
  const liquidationAlerts = services.map((s) => getLiquidationAlert(s, file.fechaSalida)).filter((a): a is NonNullable<typeof a> => a !== null);
  const warnings = [
    ...documentWarnings,
    ...(liquidationAlerts.length > 0
      ? [
          {
            level: liquidationAlerts.some((a) => a.level === "error") ? "error" : "warning",
            text: `${liquidationAlerts.length === 1 ? "Hay 1 servicio" : `Hay ${liquidationAlerts.length} servicios`} para liquidar ya (fecha vencida o dentro de esta semana): mirá la pestaña Servicios.`,
          },
        ]
      : []),
    ...(payments?.estado === "VENCIDO" && payments.moneda
      ? [{ level: "error", text: `Hay un pago del pasajero vencido (falta cobrar ${formatMoney(payments.falta, payments.moneda)}).` }]
      : []),
  ];

  const status = payments ? PAYMENT_STATUS[payments.estado] : null;

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" } }}>
        <Tile
          icon={<FlightTakeoffIcon />}
          label="Salida"
          value={file.fechaSalida ? dayjs(file.fechaSalida).format("DD/MM/YYYY") : "Sin fecha"}
          detail={file.fechaSalida ? departureDetail(file.fechaSalida) : undefined}
          onClick={() => onSelect("servicios")}
        />
        <Tile
          icon={<GroupIcon />}
          label="Pasajeros"
          value={clients.length === 0 ? "Ninguno" : clients.length === 1 ? "1 pasajero" : `${clients.length} pasajeros`}
          detail={
            clients.length > 0
              ? clients.slice(0, 3).map((c) => c.firstname).join(", ") + (clients.length > 3 ? ` y ${clients.length - 3} más` : "")
              : "Agregá quién viaja"
          }
          onClick={() => onSelect("pasajeros")}
        />
        <Tile
          icon={<PaymentsIcon />}
          label="Cobro al pasajero"
          value={<PaymentsValue payments={payments} />}
          detail={
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.25 }}>
              {status && payments?.moneda && payments.estado !== "SIN_PLAN" && (
                <Chip size="small" color={status.color} label={status.label} sx={{ fontWeight: 600 }} />
              )}
              {file.facturadoAt ? (
                <Chip size="small" color="success" variant="outlined" label="Facturado" sx={{ fontWeight: 600 }} />
              ) : payments?.estado === "PAGADO" ? (
                <Chip size="small" color="warning" variant="outlined" label="Falta facturar" sx={{ fontWeight: 600 }} />
              ) : null}
            </Box>
          }
          onClick={() => onSelect("pagos")}
        />
        <Tile
          icon={<ListAltIcon />}
          label="Servicios"
          value={services.length === 0 ? "Ninguno" : services.length === 1 ? "1 servicio" : `${services.length} servicios`}
          detail={
            services.length === 0
              ? "Agregá aéreos, hoteles..."
              : unsettled === 0
                ? "Todos liquidados ✓"
                : `${unsettled} sin liquidar`
          }
          onClick={() => onSelect("servicios")}
        />
      </Box>

      {file.obs?.trim() && (
        <Box>
          <Typography sx={{ fontSize: "0.85rem", color: "#5b6d74" }}>Observaciones</Typography>
          <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{file.obs}</Typography>
        </Box>
      )}

      {warnings.length > 0 && (
        <Alert severity={warnings.some((w) => w.level === "error") ? "error" : "warning"} sx={{ borderRadius: 2, fontSize: "1rem" }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Para revisar</AlertTitle>
          {warnings.map((w) => (
            <div key={w.text}>• {w.text}</div>
          ))}
        </Alert>
      )}
    </Paper>
  );
};
