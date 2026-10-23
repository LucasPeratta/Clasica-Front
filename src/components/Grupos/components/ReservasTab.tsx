import { useState } from "react";
import { Box, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { formatMoney } from "../../File/utils/totals";
import { PAYMENT_STATUS } from "../../File/paymentsHandler";
import { iGrupo, ROOM_TYPES } from "../model";
import { NewReservaDialog } from "./NewReservaDialog";

const headSx = { fontWeight: 700, color: "#0D5B75" };

/**
 * Reservas del grupo: cada una con sus pasajeros, lo que cuesta y lo que falta cobrar.
 * Al tocarla se abre (es como un file: pagos, recibos, facturación)
 */
export const ReservasTab = ({ grupo, onChange }: { grupo: iGrupo; onChange: () => void }) => {
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const planName = (id: string | null) => grupo.planes.find((p) => p.id === id)?.nombre;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0D5B75" }}>
          Reservas
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAdding(true)} sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
          Agregar reserva
        </Button>
      </Box>

      {grupo.reservas.length === 0 ? (
        <Typography color="text.secondary">
          Todavía no hay reservas. Cada familia, pareja o persona que se anota es una reserva, con su precio y sus pagos.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={headSx}>Reserva</TableCell>
              <TableCell sx={headSx}>Pasajeros</TableCell>
              <TableCell sx={headSx} align="right">
                Total
              </TableCell>
              <TableCell sx={headSx}>Cobro</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {grupo.reservas.map((r) => {
              const status = PAYMENT_STATUS[r.estado];
              return (
                <TableRow key={r.id} hover onClick={() => navigate(`/files/profile/${r.id}`)} sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f2f8fa" } }}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{r.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {planName(r.planId) ? `Plan ${planName(r.planId)}` : "Plan automático"}
                      {r.habitacionTipo ? ` · ${ROOM_TYPES.find((t) => t.value === r.habitacionTipo)?.label}` : ""}
                    </Typography>
                  </TableCell>
                  <TableCell>{r.pasajeros.map((p) => `${p.firstname} ${p.lastname}`).join(", ")}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {r.porMoneda.map((m) => (
                      <Typography key={m.moneda} sx={{ fontWeight: 600 }}>
                        {formatMoney(m.total, m.moneda)}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {r.estado !== "SIN_PLAN" && <Chip size="small" color={status.color} label={status.label} sx={{ fontWeight: 600 }} />}
                      {r.facturado && <Chip size="small" color="success" variant="outlined" label="Facturado" sx={{ fontWeight: 600 }} />}
                    </Box>
                    {r.porMoneda
                      .filter((m) => m.falta > 0)
                      .map((m) => (
                        <Typography key={m.moneda} variant="body2" color="text.secondary">
                          Debe {formatMoney(m.falta, m.moneda)}
                        </Typography>
                      ))}
                  </TableCell>
                  <TableCell align="right" sx={{ width: 48 }}>
                    <ChevronRightIcon sx={{ color: "#9db1b8" }} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {adding && (
        <NewReservaDialog
          grupo={grupo}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            onChange();
          }}
        />
      )}
    </>
  );
};
