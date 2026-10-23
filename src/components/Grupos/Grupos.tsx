import { useState } from "react";
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import HistoryIcon from "@mui/icons-material/History";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { LoadingScreen } from "../LoadingScreen";
import { PageHeader } from "../common/PageHeader";
import { SearchBox } from "../common/SearchBox";
import { CountTabs } from "../common/CountTabs";
import { usePaginatedList } from "../common/Pagination/usePaginatedList";
import { TablePaginationBar } from "../common/Pagination/TablePaginationBar";
import { formatMoney } from "../File/utils/totals";
import { PAYMENT_STATUS } from "../File/paymentsHandler";
import { getGrupoPage } from "./handler";
import { GrupoDialog } from "./components/GrupoDialog";
import { iGrupoListItem } from "./model";

// La pestaña va en la URL (?tab=finished); por defecto, vigentes
const TAB_FILTER = { key: "tab", defaultValue: "current" };

const headSx = { fontWeight: 700, fontSize: "0.95rem", color: "#0D5B75", backgroundColor: "#f2f8fa" };

// Lugares ocupados del cupo
const Seats = ({ grupo }: { grupo: iGrupoListItem }) => {
  if (!grupo.cupo) {
    return <Typography sx={{ fontWeight: 600 }}>{grupo.pasajeros} pasajeros</Typography>;
  }
  const libres = grupo.cupo - grupo.pasajeros;
  return (
    <Box sx={{ minWidth: 130 }}>
      <Typography sx={{ fontWeight: 600 }}>
        {grupo.pasajeros} de {grupo.cupo}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.min((grupo.pasajeros / grupo.cupo) * 100, 100)}
        color={libres < 0 ? "error" : libres === 0 ? "success" : "primary"}
        sx={{ height: 6, borderRadius: 3, my: 0.5 }}
      />
      <Typography variant="body2" color={libres < 0 ? "error" : "text.secondary"}>
        {libres > 0 ? `Quedan ${libres} lugar${libres === 1 ? "" : "es"}` : libres === 0 ? "Completo" : `${-libres} de más`}
      </Typography>
    </Box>
  );
};

/**
 * Salidas grupales: viajes que se venden por persona, con sus reservas
 */
export const Grupos = (): JSX.Element => {
  const { items, total, totalPages, pageSize, page, setPage, search, searchInput, setSearchInput, filter, setFilter, counts, initialLoading, loading } =
    usePaginatedList(getGrupoPage, TAB_FILTER);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  if (initialLoading) return <LoadingScreen />;

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 3,
        backgroundImage:
          "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%), " +
          "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), " +
          "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Box sx={{ maxWidth: 1300, mx: "auto" }}>
        <PageHeader
          title="Salidas grupales"
          description="Viajes que se venden por persona. Cada familia o pareja es una reserva con su precio y sus pagos."
          action={{ label: "Crear salida grupal", icon: <GroupAddIcon />, onClick: () => setCreating(true) }}
        />
        <SearchBox value={searchInput} onChange={setSearchInput} placeholder="Buscá por nombre de la salida, destino o pasajero" />
        <CountTabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "current", label: "Vigentes", icon: <FlightTakeoffIcon />, count: counts?.current },
            { value: "finished", label: "Finalizadas", icon: <HistoryIcon />, count: counts?.finished },
          ]}
        />

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)", opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}
        >
          <Table aria-label="Salidas grupales">
            <TableHead>
              <TableRow>
                <TableCell sx={headSx}>Salida</TableCell>
                <TableCell sx={headSx}>Fechas</TableCell>
                <TableCell sx={headSx}>Pasajeros</TableCell>
                <TableCell sx={headSx}>Cobro</TableCell>
                <TableCell sx={headSx} />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      {search
                        ? `No hay salidas para "${search}".`
                        : filter === "current"
                          ? "Todavía no hay salidas grupales. Creá la primera con el botón de arriba."
                          : "No hay salidas finalizadas."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((g) => {
                  const days = dayjs(g.fechaSalida).startOf("day").diff(dayjs().startOf("day"), "day");
                  const status = PAYMENT_STATUS[g.estado];
                  return (
                    <TableRow key={g.id} hover onClick={() => navigate(`/grupos/${g.id}`)} sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f2f8fa" } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{g.titulo}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {g.destino} · {g.reservas === 1 ? "1 reserva" : `${g.reservas} reservas`}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {dayjs(g.fechaSalida).format("DD/MM/YYYY")}
                          {g.fechaRegreso ? ` al ${dayjs(g.fechaRegreso).format("DD/MM/YYYY")}` : ""}
                        </Typography>
                        {days >= 0 && (
                          <Typography variant="body2" color="text.secondary">
                            {days === 0 ? "Sale hoy" : days === 1 ? "Sale mañana" : `Sale en ${days} días`}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Seats grupo={g} />
                      </TableCell>
                      <TableCell>
                        {g.dinero.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Sin reservas
                          </Typography>
                        ) : (
                          <>
                            {g.dinero.map((d) => (
                              <Typography key={d.moneda} variant="body2" sx={{ whiteSpace: "nowrap" }}>
                                <strong>{formatMoney(d.cobrado, d.moneda)}</strong> de {formatMoney(d.total, d.moneda)}
                                {d.falta > 0 && (
                                  <Box component="span" sx={{ color: "text.secondary" }}>
                                    {" "}
                                    · falta {formatMoney(d.falta, d.moneda)}
                                  </Box>
                                )}
                              </Typography>
                            ))}
                            {g.estado !== "SIN_PLAN" && (
                              <Chip size="small" color={status.color} label={status.label} sx={{ fontWeight: 600, mt: 0.5 }} />
                            )}
                          </>
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ width: 48 }}>
                        <ChevronRightIcon sx={{ color: "#9db1b8" }} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />
      </Box>

      {creating && <GrupoDialog onClose={() => setCreating(false)} onSaved={(id) => navigate(`/grupos/${id}`)} />}
    </Box>
  );
};
