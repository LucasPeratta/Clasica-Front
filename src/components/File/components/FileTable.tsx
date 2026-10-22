import { MouseEvent, ReactNode } from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { getDocumentAlerts } from "../../Pax/utils/documentAlerts";
import { getLiquidationAlert } from "../utils/liquidation";
import dayjs from "dayjs";
import { iFile } from "../model";
import { formatMoney, getAlternativeTariff, getTotalsByCurrency } from "../utils/totals";
import { formatFileNumber } from "../utils/fileNumber";

interface FileTableProps {
  files: iFile[];
  // Qué mostrar cuando no hay files
  emptyMessage: ReactNode;
  // Pestaña de vigentes: avisos y cuánto falta para salir
  showTripStatus?: boolean;
  onView: (id: string) => void;
  onDeleteConfirm: (id: string, e?: MouseEvent) => void;
}

const headSx = { fontWeight: 700, fontSize: "0.95rem", color: "#0D5B75", backgroundColor: "#f2f8fa" };

// Cuándo sale, en palabras
const DepartureText = ({ fechaSalida }: { fechaSalida: iFile["fechaSalida"] }) => {
  const days = dayjs(fechaSalida).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days === 0) return <Chip label="Sale hoy" size="small" color="warning" sx={{ fontWeight: 600 }} />;
  if (days < 0) return <Chip label="En viaje" size="small" color="success" sx={{ fontWeight: 600 }} />;
  return (
    <Typography variant="body2" color="text.secondary">
      Sale {days === 1 ? "mañana" : `en ${days} días`}
    </Typography>
  );
};

// Estado de lo que el pasajero tiene que pagar
const PaymentStatus = ({ cobro }: { cobro: iFile["cobro"] }) => {
  if (!cobro || cobro.estado === "SIN_PLAN" || !cobro.moneda) {
    return <Chip label="Sin importe" size="small" variant="outlined" />;
  }
  if (cobro.estado === "PAGADO") {
    return <Chip label="Pagado ✓" size="small" color="success" sx={{ fontWeight: 600 }} />;
  }
  const debe = `Debe ${formatMoney(cobro.falta, cobro.moneda)}`;
  if (cobro.estado === "VENCIDO") {
    return (
      <Box>
        <Chip label={debe} size="small" color="error" sx={{ fontWeight: 600 }} />
        <Typography variant="caption" display="block" color="error">
          Tiene un pago vencido
        </Typography>
      </Box>
    );
  }
  return (
    <Chip
      label={debe}
      size="small"
      color={cobro.estado === "POR_VENCER" ? "warning" : "default"}
      variant={cobro.estado === "POR_VENCER" ? "filled" : "outlined"}
      sx={{ fontWeight: 600 }}
    />
  );
};

/**
 * Lista de files: toda la fila lleva al file
 */
export const FileTable = ({ files, emptyMessage, showTripStatus, onView, onDeleteConfirm }: FileTableProps) => {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
      <Table aria-label="Files">
        <TableHead>
          <TableRow>
            <TableCell sx={headSx}>N° de file</TableCell>
            <TableCell sx={headSx}>Viaje</TableCell>
            <TableCell sx={headSx}>Salida</TableCell>
            <TableCell sx={headSx}>Cobro</TableCell>
            <TableCell sx={headSx} align="right">
              Total
            </TableCell>
            <TableCell sx={headSx} />
          </TableRow>
        </TableHead>

        <TableBody>
          {files.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            files.map((row) => {
              const clients = row.clients ?? [];
              const firstPax = clients[0];
              const paxText = firstPax
                ? `${firstPax.firstname} ${firstPax.lastname}${clients.length > 1 ? ` y ${clients.length - 1} más` : ""}`
                : "Sin pasajeros";
              // Una línea por cada moneda que tenga el file
              const tarifas = getTotalsByCurrency(row.services).filter((t) => t.tarifa !== 0);
              const alternative = getAlternativeTariff(row);
              // Avisos (solo vigentes): documentos y servicios sin liquidar cerca de la salida
              const unsettled = showTripStatus
                ? (row.services ?? []).filter((s) => getLiquidationAlert(s, row.fechaSalida)).length
                : 0;
              const warnings = showTripStatus
                ? [
                    ...clients.flatMap((client) =>
                      getDocumentAlerts(client, [row.fechaSalida]).map((a) => `${client.firstname} ${client.lastname}: ${a.short}`)
                    ),
                    ...(unsettled > 0 ? [`${unsettled} servicio${unsettled === 1 ? "" : "s"} sin liquidar`] : []),
                  ]
                : [];

              return (
                <TableRow key={row.id} hover onClick={() => onView(row.id)} sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f2f8fa" } }}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography sx={{ fontWeight: 700, color: "#0D5B75", fontSize: "1.05rem" }}>
                      {formatFileNumber(row) || "—"}
                    </Typography>
                    {row.nro && (
                      <Typography variant="caption" color="text.secondary">
                        Ref: {row.nro}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{row.destino}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {paxText}
                    </Typography>
                    {warnings.length > 0 && (
                      <Tooltip
                        title={warnings.map((w) => (
                          <div key={w}>• {w}</div>
                        ))}
                      >
                        <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                          <WarningAmberIcon sx={{ fontSize: 18 }} />
                          {warnings.length === 1 ? warnings[0] : `${warnings.length} cosas para revisar`}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography sx={{ fontWeight: 600 }}>{dayjs(row.fechaSalida).format("DD/MM/YYYY")}</Typography>
                    {showTripStatus && <DepartureText fechaSalida={row.fechaSalida} />}
                  </TableCell>

                  <TableCell>
                    <PaymentStatus cobro={row.cobro} />
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {alternative?.currency ? (
                      <Typography sx={{ fontWeight: 600 }}>{formatMoney(alternative.amount, alternative.currency)}</Typography>
                    ) : tarifas.length === 0 ? (
                      "—"
                    ) : (
                      tarifas.map((t) => (
                        <Typography key={t.currency} sx={{ fontWeight: 600 }}>
                          {formatMoney(t.tarifa, t.currency)}
                        </Typography>
                      ))
                    )}
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Eliminar file">
                      <IconButton color="error" onClick={(e) => onDeleteConfirm(row.id, e)} aria-label="Eliminar file">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={() => onView(row.id)} aria-label="Ver file">
                      <ChevronRightIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
