import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import dayjs from "dayjs";
import { iPax } from "../model";
import { initials } from "../utils/formatters";
import { getDocumentAlerts } from "../utils/documentAlerts";
import { DocumentAlertChips } from "./DocumentAlertChips";

interface PaxTableProps {
  pax: iPax[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

const headSx = { fontWeight: 700, fontSize: "0.95rem", color: "#0D5B75", backgroundColor: "#f2f8fa" };

// "hoy", "mañana", "en 5 días"
const whenText = (days: number) => (days === 0 ? "hoy" : days === 1 ? "mañana" : `en ${days} días`);

/**
 * Lista de pasajeros: toda la fila lleva a su perfil
 */
export const PaxTable = ({ pax, onView, onDelete }: PaxTableProps) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
    >
      <Table aria-label="Pasajeros">
        <TableHead>
          <TableRow>
            <TableCell sx={headSx}>Pasajero</TableCell>
            <TableCell sx={headSx}>Documento</TableCell>
            <TableCell sx={headSx}>Contacto</TableCell>
            <TableCell sx={headSx}>Próximo viaje</TableCell>
            <TableCell sx={headSx} />
          </TableRow>
        </TableHead>

        <TableBody>
          {pax.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                <Typography sx={{ fontSize: "1.05rem" }} color="text.secondary">
                  No encontramos pasajeros con esa búsqueda.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            pax.map((row) => {
              const nextTrip = row.File?.[0];
              const daysToTrip = nextTrip ? dayjs(nextTrip.fechaSalida).startOf("day").diff(dayjs().startOf("day"), "day") : null;
              return (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => onView(row.id)}
                  sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f2f8fa" } }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: "#0D5B75", width: 40, height: 40, fontSize: "1rem" }}>
                        {initials(row.lastname, row.firstname)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                          {row.lastname} {row.firstname}
                        </Typography>
                        <DocumentAlertChips alerts={getDocumentAlerts(row, row.File?.map((f) => f.fechaSalida))} />
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      <Box component="span" sx={{ color: "text.secondary" }}>DNI </Box>
                      {row.dni || "—"}
                    </Typography>
                    {row.passport && (
                      <Typography variant="body2">
                        <Box component="span" sx={{ color: "text.secondary" }}>Pasaporte </Box>
                        {row.passport}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {row.phoneNumber && (
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        {row.phoneNumber}
                      </Typography>
                    )}
                    {row.email && (
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.75, wordBreak: "break-all" }}>
                        <EmailIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        {row.email}
                      </Typography>
                    )}
                    {!row.phoneNumber && !row.email && (
                      <Typography variant="body2" color="text.secondary">
                        Sin datos de contacto
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {nextTrip && daysToTrip !== null ? (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {nextTrip.destino}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sale {whenText(daysToTrip)} ({dayjs(nextTrip.fechaSalida).format("DD/MM/YYYY")})
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin viajes próximos
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Eliminar pasajero">
                      <IconButton color="error" onClick={() => onDelete(row.id)} aria-label="Eliminar pasajero">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={() => onView(row.id)} aria-label="Ver pasajero">
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
