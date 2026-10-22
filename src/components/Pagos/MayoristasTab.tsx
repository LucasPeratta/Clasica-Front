import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { usePaginatedList } from "../common/Pagination/usePaginatedList";
import { TablePaginationBar } from "../common/Pagination/TablePaginationBar";
import { iPaginated } from "../common/Pagination/types";
import { LoadingScreen } from "../LoadingScreen";
import { formatFileNumber } from "../File/utils/fileNumber";
import { formatMoney } from "../File/utils/totals";
import {
  deleteSupplierPayment,
  getPendingSupplierPage,
  getSupplierPaymentsPage,
  iSupplierPayment,
} from "./mayoristasHandler";
import { NewSupplierPaymentDialog } from "./NewSupplierPaymentDialog";
import { HistoryFilters, iHistoryFilter } from "./HistoryFilters";
import { useDebouncedValue } from "../common/useDebouncedValue";

const TYPE_LABEL: Record<string, string> = {
  AEREO: "✈️",
  HOTEL: "🏨",
  EXCURSION: "🎒",
  TRASLADO: "🚗",
};

const paperSx = {
  borderRadius: 3,
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const fileLink = (file: { id: string; numero?: number | null; anio?: number | null; destino: string }) => (
  <MuiLink component={Link} to={`/files/profile/${file.id}`} underline="hover" sx={{ fontWeight: 700, color: "#0D5B75" }}>
    {formatFileNumber(file) || file.destino}
  </MuiLink>
);

const DueChip = ({ days }: { days: number | null }) => {
  if (days === null) return null;
  const label =
    days < 0 ? `Vencido hace ${-days} día${days === -1 ? "" : "s"}` : days === 0 ? "Vence hoy" : `En ${days} día${days === 1 ? "" : "s"}`;
  const color = days < 0 ? "error" : days <= 7 ? "warning" : "default";
  return <Chip size="small" color={color} variant={color === "default" ? "outlined" : "filled"} label={label} />;
};

/**
 * Pagos a mayoristas: lo pendiente de pagar (por vencimiento) y los pagos hechos.
 * Un pago se reparte entre servicios de uno o varios files.
 */
export const MayoristasTab = () => {
  const { items, total, totalPages, pageSize, page, setPage, search, searchInput, setSearchInput, initialLoading, loading, reload, response } =
    usePaginatedList(getPendingSupplierPage);
  // Total pendiente por moneda (de todo lo encontrado, no solo esta página)
  const totals = (response as { totals?: Record<string, number> } | null)?.totals ?? {};

  const navigate = useNavigate();
  const [newPaymentOpen, setNewPaymentOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<iSupplierPayment | null>(null);
  const [deleteError, setDeleteError] = useState(false);

  // Pagos hechos: filtro propio (mayorista / pasajero y rango de fechas) y paginación propia
  const [history, setHistory] = useState<(iPaginated<iSupplierPayment> & { totals?: Record<string, number> }) | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyKey, setHistoryKey] = useState(0);
  const [historyFilter, setHistoryFilter] = useState<iHistoryFilter>({ search: "", desde: "", hasta: "" });
  const historySearch = useDebouncedValue(historyFilter.search);

  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyFilter.desde, historyFilter.hasta]);

  useEffect(() => {
    let cancelled = false;
    getSupplierPaymentsPage(historyPage, historySearch, historyFilter.desde, historyFilter.hasta).then((res) => {
      if (!cancelled) setHistory(res);
    });
    return () => {
      cancelled = true;
    };
  }, [historyPage, historySearch, historyFilter.desde, historyFilter.hasta, historyKey]);

  if (initialLoading) return <LoadingScreen />;

  const refreshAll = () => {
    reload();
    setHistoryKey((k) => k + 1);
  };

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    const ok = await deleteSupplierPayment(paymentToDelete.id);
    setPaymentToDelete(null);
    if (ok) refreshAll();
    else setDeleteError(true);
  };

  return (
    <>
      {/* Buscador + nuevo pago */}
      <Paper elevation={3} sx={{ ...paperSx, p: 2, mb: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small"
          sx={{ flex: 1, minWidth: 240 }}
          placeholder="Buscar en pendientes por mayorista, pasajero, servicio o número de file"
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewPaymentOpen(true)}
          sx={{ background: "linear-gradient(135deg, #0D5B75 0%, #1a7a99 100%)", fontWeight: 600 }}
        >
          Nuevo pago a mayorista
        </Button>
      </Paper>

      {/* Pendiente de pagar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
          Pendiente de pagar
        </Typography>
        <Typography sx={{ color: "#fff", fontWeight: 600 }}>
          {Object.entries(totals).map(([currency, amount]) => formatMoney(amount, currency)).join("  ·  ")}
        </Typography>
      </Box>
      <TableContainer component={Paper} elevation={3} sx={{ ...paperSx, opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Vence</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Pendiente por mayorista</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Falta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {search ? `No hay pagos pendientes para "${search}".` : "No hay pagos pendientes a mayoristas. 🎉"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => {
                // Total que falta del file, por moneda
                const faltaPorMoneda: Record<string, number> = {};
                for (const m of row.mayoristas) faltaPorMoneda[m.currency] = (faltaPorMoneda[m.currency] ?? 0) + m.falta;
                return (
                  // Toda la fila lleva al file
                  <TableRow key={row.file.id} hover onClick={() => navigate(`/files/profile/${row.file.id}`)} sx={{ cursor: "pointer" }}>
                    <TableCell sx={{ whiteSpace: "nowrap", verticalAlign: "top" }}>
                      {row.vencimiento ? dayjs(row.vencimiento).format("DD/MM/YYYY") : "—"}
                      <Box>
                        <DueChip days={row.diasParaVencer} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap", verticalAlign: "top" }}>
                      <Typography sx={{ fontWeight: 700, color: "#0D5B75" }}>
                        {formatFileNumber(row.file) || row.file.destino}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {row.file.destino}
                        {row.file.pasajero ? ` · ${row.file.pasajero.lastname} ${row.file.pasajero.firstname}` : ""}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top" }}>
                      {row.mayoristas.map((m) => (
                        <Box key={`${m.mayorista}-${m.currency}`} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.25 }}>
                          <Tooltip
                            title={m.servicios.map((s) => (
                              <div key={s.id}>
                                {TYPE_LABEL[s.type]} {s.nombre} — {formatMoney(s.falta, m.currency)}
                              </div>
                            ))}
                          >
                            <Typography variant="body2">
                              <strong>{m.mayorista || "Sin mayorista"}</strong>{" "}
                              <Typography component="span" variant="caption" color="text.secondary">
                                · {m.servicios.map((s) => TYPE_LABEL[s.type]).join(" ")} {m.servicios.length} servicio
                                {m.servicios.length === 1 ? "" : "s"}
                              </Typography>
                            </Typography>
                          </Tooltip>
                          <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                            {formatMoney(m.falta, m.currency)}
                          </Typography>
                        </Box>
                      ))}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 700, color: "error.main", verticalAlign: "top" }}>
                      {Object.entries(faltaPorMoneda).map(([currency, amount]) => (
                        <div key={currency}>{formatMoney(amount, currency)}</div>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />

      {/* Pagos hechos */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mt: 4, mb: 1 }}>
        Pagos hechos
      </Typography>
      <HistoryFilters
        value={historyFilter}
        onChange={setHistoryFilter}
        placeholder="Buscar pagos por mayorista, pasajero o número de file"
        totals={history?.totals}
        totalLabel={historyFilter.desde || historyFilter.hasta ? "Total pagado en el período" : "Total pagado"}
      />
      <TableContainer component={Paper} elevation={3} sx={paperSx}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mayorista</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Importe</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cubre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Medio</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nota</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {!history || history.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {historyFilter.search || historyFilter.desde || historyFilter.hasta
                      ? "No hay pagos con ese filtro."
                      : "Todavía no hay pagos a mayoristas."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              history.data.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{dayjs(p.fecha).format("DD/MM/YYYY")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{p.mayorista}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                    {formatMoney(p.importe, p.moneda)}
                  </TableCell>
                  <TableCell>
                    {p.aplicaciones.map((a) => (
                      <Typography key={a.id} variant="body2">
                        {a.file ? fileLink(a.file) : "—"} {TYPE_LABEL[a.type]} {a.servicio}{" "}
                        <Typography component="span" variant="caption" color="text.secondary">
                          ({formatMoney(a.importe, p.moneda)})
                        </Typography>
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>{p.medio === "EFECTIVO" ? "Efectivo" : "Transferencia"}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{p.nota || "—"}</TableCell>
                  <TableCell>
                    <Tooltip title="Eliminar pago (si se cargó por error)">
                      <IconButton size="small" color="error" onClick={() => setPaymentToDelete(p)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
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

      {newPaymentOpen && (
        <NewSupplierPaymentDialog
          onClose={() => setNewPaymentOpen(false)}
          onSaved={() => {
            setNewPaymentOpen(false);
            setSavedOpen(true);
            refreshAll();
          }}
        />
      )}

      <Dialog open={paymentToDelete !== null} onClose={() => setPaymentToDelete(null)}>
        <DialogTitle>Eliminar pago a mayorista</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar el pago de {paymentToDelete && formatMoney(paymentToDelete.importe, paymentToDelete.moneda)} a{" "}
            {paymentToDelete?.mayorista}? Los servicios que cubría vuelven a quedar pendientes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentToDelete(null)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={savedOpen} autoHideDuration={3000} onClose={() => setSavedOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success" onClose={() => setSavedOpen(false)}>
          Pago a mayorista registrado
        </Alert>
      </Snackbar>
      <Snackbar open={deleteError} autoHideDuration={4000} onClose={() => setDeleteError(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setDeleteError(false)}>
          No se pudo eliminar el pago.
        </Alert>
      </Snackbar>
    </>
  );
};
