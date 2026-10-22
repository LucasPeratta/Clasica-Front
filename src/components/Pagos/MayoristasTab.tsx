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
import { Link } from "react-router-dom";
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
  iServiceToPay,
  iSupplierPayment,
} from "./mayoristasHandler";
import { NewSupplierPaymentDialog } from "./NewSupplierPaymentDialog";

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

const DueChip = ({ service }: { service: iServiceToPay }) => {
  const days = service.diasParaVencer;
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

  const [newPaymentOpen, setNewPaymentOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<iSupplierPayment | null>(null);
  const [deleteError, setDeleteError] = useState(false);

  // Pagos hechos (misma búsqueda, paginación propia)
  const [history, setHistory] = useState<iPaginated<iSupplierPayment> | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyKey, setHistoryKey] = useState(0);

  useEffect(() => {
    setHistoryPage(1);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getSupplierPaymentsPage(historyPage, search).then((res) => {
      if (!cancelled) setHistory(res);
    });
    return () => {
      cancelled = true;
    };
  }, [historyPage, search, historyKey]);

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
          placeholder="Buscar por mayorista, pasajero, servicio o número de file"
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
              <TableCell sx={{ fontWeight: 700 }}>Mayorista</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Servicio</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Neto</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Falta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {search ? `No hay pagos pendientes para "${search}".` : "No hay pagos pendientes a mayoristas. 🎉"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {s.vencimiento ? dayjs(s.vencimiento).format("DD/MM/YYYY") : "—"}
                    <Box>
                      <DueChip service={s} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{s.provider}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {s.file ? fileLink(s.file) : "—"}
                    {s.file?.pasajero && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {s.file.pasajero.lastname} {s.file.pasajero.firstname}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {TYPE_LABEL[s.type]} {s.nombre}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {formatMoney(s.neto, s.currency)}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 700, color: "error.main" }}>
                    {formatMoney(s.falta, s.currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePaginationBar page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />

      {/* Pagos hechos */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mt: 4, mb: 1 }}>
        Pagos hechos
      </Typography>
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
                  <Typography color="text.secondary">Todavía no hay pagos a mayoristas.</Typography>
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
