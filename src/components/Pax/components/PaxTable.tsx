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
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { iPax } from "../model";
import { initials } from "../utils/formatters";

interface PaxTableProps {
  pax: iPax[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PaxTable = ({ pax, onView, onDelete }: PaxTableProps) => {
  return (
    <TableContainer
      component={Paper}
      elevation={3}
      sx={{
        maxHeight: "64vh",
        overflowY: "auto",
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <Table stickyHeader size="medium" aria-label="tabla de pasajeros">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, width: "40%" }}>
              APELLIDO & NOMBRE
            </TableCell>
            <TableCell sx={{ fontWeight: 700, width: "35%" }}>EMAIL</TableCell>
            <TableCell sx={{ fontWeight: 700, width: "15%" }}>
              TELÉFONO
            </TableCell>
            <TableCell sx={{ fontWeight: 700, width: "10%" }} align="right">
              ACCIONES
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {pax.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                <Typography variant="body1" color="text.secondary">
                  No hay resultados.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            pax.map((row, idx) => (
              <TableRow
                key={row.id}
                hover
                onClick={() => onView(row.id)}
                sx={{
                  backgroundColor:
                    idx % 2 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "rgba(2,136,209,0.08)" },
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 34, height: 34 }}
                    >
                      {initials(row.lastname, row.firstname)}
                    </Avatar>
                    <Typography sx={{ fontWeight: 600 }}>
                      {row.lastname} {row.firstname}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography sx={{ color: "text.primary" }}>
                    {row.email || "—"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ color: "text.secondary" }}>
                    {row.phoneNumber || "—"}
                  </Typography>
                </TableCell>

                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Ver detalles">
                    <IconButton color="primary" onClick={() => onView(row.id)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" onClick={() => onDelete(row.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
