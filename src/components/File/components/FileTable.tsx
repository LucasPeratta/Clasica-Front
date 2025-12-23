import { MouseEvent } from "react";
import {
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

interface FileTableProps {
  files: iFile[];
  searchTerm: string;
  onView: (id: string) => void;
  onDeleteConfirm: (id: string, e?: MouseEvent) => void;
}

export const FileTable = ({
  files,
  searchTerm,
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
            <TableCell sx={{ fontWeight: 700 }}>Número</TableCell>
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
                <Typography variant="body1" color="text.secondary">
                  No se encontraron resultados para "{searchTerm}".
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            files.map((row, i) => {
              const firstPax = row.clients?.[0];
              const paxName = firstPax
                ? `${firstPax.lastname} ${firstPax.firstname}`
                : "—";

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
                  <TableCell>{row.nro || "—"}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.destino}</TableCell>
                  <TableCell align="center">{paxName}</TableCell>
                  <TableCell align="center">
                    {dayjs(row.fechaSalida).format("DD-MM-YYYY")}
                  </TableCell>
                  <TableCell align="center">
                    {row.tarifaTotal && !isNaN(Number(row.tarifaTotal))
                      ? `$${Number(row.tarifaTotal).toFixed(2)}`
                      : "—"}
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
