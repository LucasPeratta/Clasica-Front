import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PaymentsIcon from "@mui/icons-material/Payments";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EventIcon from "@mui/icons-material/Event";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { usePaginatedList } from "../common/Pagination/usePaginatedList";
import { TablePaginationBar } from "../common/Pagination/TablePaginationBar";
import { iPaginated } from "../common/Pagination/types";
import { CountTabs } from "../common/CountTabs";
import { LoadingScreen } from "../LoadingScreen";
import {
  getCobranzasPage,
  getPaymentsHistoryPage,
  iCobranza,
  iPagoHistorial,
} from "../File/paymentsHandler";
import { PaymentDialog } from "../File/profile/components/FilePayments";
import { HistoryFilters, iHistoryFilter } from "./HistoryFilters";
import { useDebouncedValue } from "../common/useDebouncedValue";
import { formatFileNumber } from "../File/utils/fileNumber";
import { formatMoney } from "../File/utils/totals";

// El filtro va en la URL (?filtro=vencidos); por defecto, todos (los vencidos quedan primero)
const FILTER = { key: "filtro", defaultValue: "todos" };

const paperSx = {
  borderRadius: 3,
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const DueChip = ({ cobranza }: { cobranza: iCobranza }) => {
  const due = cobranza.proximoVencimiento;
  if (!due) return null;
  const days = due.diasParaVencer;
  const label =
    days < 0 ? `Vencido hace ${-days} día${days === -1 ? "" : "s"}` : days === 0 ? "Vence hoy" : `En ${days} día${days === 1 ? "" : "s"}`;
  const color = days < 0 ? "error" : days <= 7 ? "warning" : "default";
  return <Chip size="small" color={color} variant={color === "default" ? "outlined" : "filled"} label={label} />;
};

const fileLink = (file: { id: string; numero?: number | null; anio?: number | null; destino: string }) => (
  <MuiLink component={Link} to={`/files/profile/${file.id}`} underline="hover" sx={{ fontWeight: 700, color: "#0D5B75" }}>
    {formatFileNumber(file) || file.destino}
  </MuiLink>
);

/**
 * Cobros a pasajeros de todos los files: quién debe (por vencimiento) e historial de lo cobrado.
 * Desde acá se puede registrar un pago sin entrar al file.
 */
export const CobrosTab = () => {
  const {
    items,
    total,
    totalPages,
    pageSize,
    page,
    setPage,
    search,
    searchInput,
    setSearchInput,
    filter,
    setFilter,
    counts,
    initialLoading,
    loading,
    reload,
  } = usePaginatedList(getCobranzasPage, FILTER);

  const navigate = useNavigate();
  const [payingFile, setPayingFile] = useState<iCobranza | null>(null);
  const [savedOpen, setSavedOpen] = useState(false);

  // Historial de pagos recibidos: filtro propio (pasajero y rango de fechas) y paginación propia
  const [history, setHistory] = useState<(iPaginated<iPagoHistorial> & { totals?: Record<string, number> }) | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyKey, setHistoryKey] = useState(0);
  const [historyFilter, setHistoryFilter] = useState<iHistoryFilter>({ search: "", desde: "", hasta: "" });
  const historySearch = useDebouncedValue(historyFilter.search);

  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyFilter.desde, historyFilter.hasta]);

  useEffect(() => {
    let cancelled = false;
    getPaymentsHistoryPage(historyPage, historySearch, historyFilter.desde, historyFilter.hasta).then((res) => {
      if (!cancelled) setHistory(res);
    });
    return () => {
      cancelled = true;
    };
  }, [historyPage, historySearch, historyFilter.desde, historyFilter.hasta, historyKey]);

  if (initialLoading) return <LoadingScreen />;

  const filterName: Record<string, string> = {
    vencidos: "vencidos",
    semana: "que vencen esta semana",
    mes: "que vencen este mes",
    todos: "pendientes",
  };

  return (
    <>
      {/* Buscador */}
      <Paper elevation={3} sx={{ ...paperSx, p: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar en pendientes por pasajero, destino o número de file (ej. 55)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <CountTabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: "vencidos", label: "Vencidos", icon: <ErrorOutlineIcon />, count: counts?.vencidos },
          { value: "semana", label: "Esta semana", icon: <EventIcon />, count: counts?.semana },
          { value: "mes", label: "Este mes", icon: <DateRangeIcon />, count: counts?.mes },
          { value: "todos", label: "Todos", icon: <ListAltIcon />, count: counts?.todos },
        ]}
      />

      {/* Quién debe */}
      <TableContainer component={Paper} elevation={3} sx={{ ...paperSx, opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pasajero</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Salida</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Próximo vencimiento</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Falta</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">
                    {search ? `No hay cobros ${filterName[filter]} para "${search}".` : `No hay cobros ${filterName[filter]}. 🎉`}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                // Toda la fila lleva al file
                <TableRow key={row.id} hover onClick={() => navigate(`/files/profile/${row.id}`)} sx={{ cursor: "pointer" }}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {fileLink(row)}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {row.destino}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.pasajero ? `${row.pasajero.lastname} ${row.pasajero.firstname}` : "—"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{dayjs(row.fechaSalida).format("DD/MM/YYYY")}</TableCell>
                  <TableCell>
                    {row.proximoVencimiento && (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.proximoVencimiento.concepto} · {dayjs(row.proximoVencimiento.vencimiento).format("DD/MM/YYYY")}
                        </Typography>
                        <DueChip cobranza={row} />
                      </>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Typography sx={{ fontWeight: 700, color: "error.main" }}>{formatMoney(row.falta, row.moneda)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      cobrado {formatMoney(row.cobrado, row.moneda)} de {formatMoney(row.total, row.moneda)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" startIcon={<PaymentsIcon />} onClick={(e) => {
                        // Que el clic no llegue a la fila (que abre el file)
                        e.stopPropagation();
                        setPayingFile(row);
                      }}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Registrar pago
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />

      {/* Historial */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mt: 4, mb: 1 }}>
        Pagos recibidos
      </Typography>
      <HistoryFilters
        value={historyFilter}
        onChange={setHistoryFilter}
        placeholder="Buscar pagos por pasajero, destino o número de file"
        totals={history?.totals}
        totalLabel={historyFilter.desde || historyFilter.hasta ? "Total cobrado en el período" : "Total cobrado"}
      />
      <TableContainer component={Paper} elevation={3} sx={paperSx}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pasajero</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Importe</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Medio</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nota</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!history || history.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {historyFilter.search || historyFilter.desde || historyFilter.hasta
                      ? "No hay pagos con ese filtro."
                      : "Todavía no hay pagos registrados."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              history.data.map((pago) => (
                <TableRow key={pago.id} hover onClick={() => navigate(`/files/profile/${pago.file.id}`)} sx={{ cursor: "pointer" }}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{dayjs(pago.fecha).format("DD/MM/YYYY")}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {fileLink(pago.file)} <Typography component="span" variant="caption" color="text.secondary">{pago.file.destino}</Typography>
                  </TableCell>
                  <TableCell>{pago.pasajero ? `${pago.pasajero.lastname} ${pago.pasajero.firstname}` : "—"}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                    {formatMoney(pago.importe, pago.moneda)}
                    {pago.tipoCambio !== null && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        TC {pago.tipoCambio.toLocaleString("es-AR")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{pago.medio === "EFECTIVO" ? "Efectivo" : "Transferencia"}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{pago.nota || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {history && (
        <TablePaginationBar
          page={historyPage}
          totalPages={history.totalPages}
          total={history.total}
          pageSize={history.pageSize}
          onPageChange={setHistoryPage}
        />
      )}

      {payingFile && (
        <PaymentDialog
          fileId={payingFile.id}
          chargeCurrency={payingFile.moneda}
          pago={null}
          suggestedAmount={payingFile.proximoVencimiento?.falta ?? payingFile.falta}
          onClose={() => setPayingFile(null)}
          onSaved={() => {
            setPayingFile(null);
            setSavedOpen(true);
            reload();
            setHistoryKey((k) => k + 1);
          }}
        />
      )}

      <Snackbar
        open={savedOpen}
        autoHideDuration={3000}
        onClose={() => setSavedOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSavedOpen(false)}>
          Pago registrado
        </Alert>
      </Snackbar>
    </>
  );
};

export default CobrosTab;
