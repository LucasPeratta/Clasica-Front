import { MouseEvent, ReactNode } from "react";
import {
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
import dayjs from "dayjs";
import { iFile } from "../model";
import { formatMoney, getTotalsByCurrency } from "../utils/totals";
import { formatFileNumber } from "../utils/fileNumber";

interface FileTableProps {
  files: iFile[];
  // Qué mostrar cuando no hay files
  emptyMessage: ReactNode;
  // Marcar los viajes que salen hoy o ya salieron (pestaña de vigentes)
  showTripStatus?: boolean;
  onView: (id: string) => void;
  onDeleteConfirm: (id: string, e?: MouseEvent) => void;
}

const TripStatus = ({ fechaSalida }: { fechaSalida: iFile["fechaSalida"] }) => {
  const salida = dayjs(fechaSalida);
  if (salida.isSame(dayjs(), "day")) {
    return <Chip label="Sale hoy" size="small" color="warning" sx={{ mt: 0.5, fontWeight: 600 }} />;
  }
  if (salida.isBefore(dayjs(), "day")) {
    return <Chip label="En curso" size="small" color="success" sx={{ mt: 0.5, fontWeight: 600 }} />;
  }
  return null;
};

export const FileTable = ({
  files,
  emptyMessage,
  showTripStatus,
  onView,
  onDeleteConfirm,
}: FileTableProps) => {
  return (
    <TableContainer
      component={Paper}
      elevation={3}
      sx={{
        borderRadius: 3,
        overflowY: "auto",
        maxHeight: "70vh",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>N°</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Destino</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Primer pasajero
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Fecha de salida
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Tarifa total
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
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
            files.map((row, i) => {
              const firstPax = row.clients?.[0];
              const paxName = firstPax
                ? `${firstPax.lastname} ${firstPax.firstname}`
                : "—";
              // Una línea por cada moneda que tenga el file
              const tarifas = getTotalsByCurrency(row.services).filter(
                (t) => t.tarifa !== 0
              );

              return (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onView(row.id)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      i % 2 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(2,136,209,0.08)",
                    },
                  }}
                >
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <Typography sx={{ fontWeight: 700, color: "#0D5B75" }}>
                      {formatFileNumber(row) || "—"}
                    </Typography>
                    {row.nro && (
                      <Typography variant="caption" color="text.secondary">
                        Ref: {row.nro}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.destino}</TableCell>
                  <TableCell align="center">{paxName}</TableCell>
                  <TableCell align="center">
                    {dayjs(row.fechaSalida).format("DD-MM-YYYY")}
                    {showTripStatus && (
                      <div>
                        <TripStatus fechaSalida={row.fechaSalida} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {tarifas.length === 0
                      ? "—"
                      : tarifas.map((t) => (
                          <Typography
                            key={t.currency}
                            variant="body2"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {formatMoney(t.tarifa, t.currency)}
                          </Typography>
                        ))}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Eliminar file">
                      <IconButton
                        color="error"
                        onClick={(e) => onDeleteConfirm(row.id, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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
