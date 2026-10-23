import { useState } from "react";
import { Alert, Box, Button, IconButton, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import HikingIcon from "@mui/icons-material/Hiking";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { formatMoney } from "../../File/utils/totals";
import { deleteGrupoServicio } from "../handler";
import { iGrupo, iGrupoServicio, ROOM_TYPES } from "../model";
import { GrupoServicioDialog } from "./GrupoServicioDialog";

const TYPE_ICONS: Record<string, JSX.Element> = {
  AEREO: <FlightIcon />,
  HOTEL: <HotelIcon />,
  EXCURSION: <HikingIcon />,
  TRASLADO: <AirportShuttleIcon />,
};

const headSx = { fontWeight: 700, color: "#0D5B75" };

const formatDates = (s: iGrupoServicio) => {
  const start = s.fechaInicio ? dayjs(s.fechaInicio).format("DD/MM/YYYY") : null;
  const end = s.fechaFin ? dayjs(s.fechaFin).format("DD/MM/YYYY") : null;
  return start && end && start !== end ? `${start} al ${end}` : start || end || "";
};

/**
 * Itinerario del grupo con su precio de lista por pasajero (cada reserva lo copia y lo puede cambiar)
 */
export const ServiciosTab = ({ grupo, onChange }: { grupo: iGrupo; onChange: () => void }) => {
  const [editing, setEditing] = useState<iGrupoServicio | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (s: iGrupoServicio) => {
    const result = await deleteGrupoServicio(grupo.id, s.id);
    if (result.ok) onChange();
    else setError(result.msg);
  };

  // Precio de lista por pasajero, sumado por moneda
  const perPax = new Map<string, { neto: number; tarifa: number }>();
  for (const s of grupo.servicios.filter((x) => x.modoPrecio === "POR_PASAJERO")) {
    const t = perPax.get(s.currency) ?? { neto: 0, tarifa: 0 };
    t.neto += s.netoPorPax;
    t.tarifa += s.tarifaPorPax;
    perPax.set(s.currency, t);
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0D5B75" }}>
          Servicios y precios por pasajero
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing("new")} sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
          Agregar servicio
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        El itinerario del grupo con el precio de lista de cada pasajero. Cada reserva nueva lo toma, y ahí se puede cambiar (ej. preventa).
      </Typography>

      {grupo.servicios.length === 0 ? (
        <Typography color="text.secondary">Todavía no hay servicios. Agregá el aéreo, los hoteles, los traslados...</Typography>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headSx}>Servicio</TableCell>
                <TableCell sx={headSx}>Mayorista</TableCell>
                <TableCell sx={headSx} align="right">
                  Costo por pax
                </TableCell>
                <TableCell sx={headSx} align="right">
                  Precio por pax
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {grupo.servicios.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ color: "#0D5B75", display: "flex" }}>{TYPE_ICONS[s.type]}</Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{s.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDates(s)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{s.provider}</TableCell>
                  {s.modoPrecio === "POR_HABITACION" ? (
                    <TableCell align="right" colSpan={2}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Según la habitación (por persona):
                      </Typography>
                      {ROOM_TYPES.flatMap((r) => {
                        const room = s.preciosHabitacion?.[r.value];
                        return room
                          ? [
                              <Typography key={r.value} variant="body2" sx={{ whiteSpace: "nowrap" }}>
                                {r.label}: {formatMoney(room.tarifa, s.currency)}{" "}
                                <Box component="span" sx={{ color: "text.secondary" }}>
                                  (costo {formatMoney(room.neto, s.currency)})
                                </Box>
                              </Typography>,
                            ]
                          : [];
                      })}
                    </TableCell>
                  ) : (
                    <>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        {formatMoney(s.netoPorPax, s.currency)}
                        {s.edadMenor !== null && (
                          <Typography variant="body2" color="text.secondary">
                            menor {formatMoney(s.netoMenor ?? 0, s.currency)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                        {formatMoney(s.tarifaPorPax, s.currency)}
                        {s.modoPrecio === "POR_RESERVA" && (
                          <Typography variant="body2" color="text.secondary">
                            por reserva
                          </Typography>
                        )}
                        {s.edadMenor !== null && (
                          <Typography variant="body2" color="text.secondary">
                            menores de {s.edadMenor}: {formatMoney(s.tarifaMenor ?? 0, s.currency)}
                          </Typography>
                        )}
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => setEditing(s)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar del grupo">
                      <IconButton color="error" onClick={() => handleDelete(s)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 2 }}>
            {[...perPax.entries()].map(([currency, t]) => (
              <Typography key={currency} sx={{ fontWeight: 600 }}>
                Por pasajero (sin contar habitación ni lo que va por reserva): {formatMoney(t.tarifa, currency)}{" "}
                <Box component="span" sx={{ color: "success.dark" }}>
                  (ganancia {formatMoney(t.tarifa - t.neto, currency)})
                </Box>
              </Typography>
            ))}
          </Box>
        </>
      )}

      {editing && (
        <GrupoServicioDialog
          grupoId={grupo.id}
          fechaSalida={grupo.fechaSalida}
          reservas={grupo.reservas.length}
          servicio={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChange();
          }}
        />
      )}
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
