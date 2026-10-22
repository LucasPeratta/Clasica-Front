import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaymentsIcon from "@mui/icons-material/Payments";
import dayjs from "dayjs";
import { CURRENCIES, formatMoney } from "../../utils/totals";
import {
  appliedAmount,
  deletePago,
  getFilePayments,
  PAYMENT_STATUS,
  iCuota,
  iCuotaInput,
  iPago,
  iPagoInput,
  iPaymentsSummary,
  PaymentMethod,
  resetPlan,
  savePlan,
  addPago,
  updatePago,
} from "../../paymentsHandler";

interface FilePaymentsProps {
  fileId: string;
  // Cambia cuando cambian los servicios, la tarifa alternativa o la salida: se recalcula
  refreshKey: string;
  // Avisa cada vez que cambia el estado de los pagos (para el resumen de arriba)
  onSummaryChange?: (summary: iPaymentsSummary) => void;
}


const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "EFECTIVO", label: "Efectivo" },
];

const currencyLabel = (value: string) => CURRENCIES.find((c) => c.value === value)?.label ?? value;
const toDateInput = (date: string | Date) => dayjs(date).format("YYYY-MM-DD");
// Mediodía para que la fecha no se corra de día por la zona horaria
const fromDateInput = (value: string) => dayjs(value).hour(12).toISOString();

const dueText = (cuota: iCuota) => {
  if (cuota.estado === "PAGADA") return null;
  if (cuota.vencida) return `Vencida hace ${-cuota.diasParaVencer} día${cuota.diasParaVencer === -1 ? "" : "s"}`;
  if (cuota.diasParaVencer === 0) return "Vence hoy";
  return `Vence en ${cuota.diasParaVencer} día${cuota.diasParaVencer === 1 ? "" : "s"}`;
};

const CuotaStatus = ({ cuota, money }: { cuota: iCuota; money: (n: number) => string }) => {
  if (cuota.estado === "PAGADA") return <Chip size="small" color="success" label="Pagada ✓" />;
  const due = dueText(cuota);
  const color = cuota.vencida ? "error" : cuota.diasParaVencer <= 7 ? "warning" : "default";
  return (
    <Box>
      <Chip
        size="small"
        color={color}
        variant={color === "default" ? "outlined" : "filled"}
        label={cuota.estado === "PARCIAL" ? `Parcial · falta ${money(cuota.falta)}` : "Pendiente"}
      />
      {due && (
        <Typography variant="caption" display="block" color={cuota.vencida ? "error" : "text.secondary"}>
          {due}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Sección "Pagos" del file: plan de pagos (automático o propio del administrador),
 * pagos recibidos y cuánto falta.
 */
export const FilePayments = ({ fileId, refreshKey, onSummaryChange }: FilePaymentsProps) => {
  const [summary, setSummary] = useState<iPaymentsSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [paymentDialog, setPaymentDialog] = useState<{ pago: iPago | null } | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState<iPago | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await getFilePayments(fileId);
    if (result.ok) {
      setSummary(result.data);
      setLoadError(null);
    } else {
      setLoadError(result.msg);
    }
  }, [fileId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    if (summary) onSummaryChange?.(summary);
  }, [summary, onSummaryChange]);

  if (!summary) {
    return (
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          {loadError ? <Alert severity="error">{loadError}</Alert> : <CircularProgress size={24} />}
        </CardContent>
      </Card>
    );
  }

  const currency = summary.moneda;
  const money = (n: number) => (currency ? formatMoney(n, currency) : n.toLocaleString("es-AR"));
  const progress = summary.planTotal > 0 ? Math.min((summary.cobrado / summary.planTotal) * 100, 100) : 0;
  const status = PAYMENT_STATUS[summary.estado];

  const handleDeletePago = async () => {
    if (!pagoToDelete) return;
    const result = await deletePago(fileId, pagoToDelete.id);
    setPagoToDelete(null);
    if (result.ok) setSummary(result.data);
    else setActionError(result.msg);
  };

  const handleResetPlan = async () => {
    const result = await resetPlan(fileId);
    setResetDialogOpen(false);
    if (result.ok) setSummary(result.data);
    else setActionError(result.msg);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0D5B75" }}>
            Pagos
          </Typography>
          <Chip size="small" color={status.color} label={status.label} sx={{ fontWeight: 600 }} />
        </Box>
        <Button
          size="small"
          variant="contained"
          startIcon={<PaymentsIcon />}
          disabled={!currency}
          onClick={() => setPaymentDialog({ pago: null })}
        >
          Registrar pago
        </Button>
      </Box>

      <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          {actionError && (
            <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}

          {summary.problema === "MIXED_CURRENCIES" && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              El file tiene servicios en distintas monedas. Cargá la <strong>tarifa alternativa</strong> (en
              Totales) para definir en qué moneda se cobra.
            </Alert>
          )}
          {summary.problema === "NOTHING_TO_CHARGE" && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Todavía no hay nada para cobrar: agregá servicios o cargá la tarifa alternativa.
            </Alert>
          )}

          {currency && (
            <>
              {/* Resumen */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 1 }}>
                {[
                  { label: "Total a cobrar", value: money(summary.planTotal), color: "text.primary" },
                  { label: "Cobrado", value: money(summary.cobrado), color: "success.dark" },
                  { label: "Falta", value: money(summary.falta), color: summary.falta > 0 ? "error.main" : "success.dark" },
                ].map((item) => (
                  <Box key={item.label}>
                    <Typography variant="body2" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
                {summary.proximoVencimiento && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Próximo vencimiento
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {dayjs(summary.proximoVencimiento.vencimiento).format("DD/MM/YYYY")}
                    </Typography>
                  </Box>
                )}
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={summary.estado === "VENCIDO" ? "error" : "success"}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />

              {summary.aFavor > 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Se cobró {money(summary.aFavor)} de más que el plan.
                </Alert>
              )}
              {summary.planPersonalizado && Math.abs(summary.planTotal - summary.total) >= 0.01 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  El plan suma {money(summary.planTotal)} pero el total a cobrar es {money(summary.total)}.
                  Revisá las cuotas.
                </Alert>
              )}

              {/* Plan de pagos */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Plan de pagos</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {summary.planPersonalizado
                      ? "Plan propio (armado a mano)."
                      : "Automático: seña = aéreos, saldo 25 días antes de la salida. Se recalcula solo."}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {summary.planPersonalizado && (
                    <Button size="small" onClick={() => setResetDialogOpen(true)}>
                      Volver al automático
                    </Button>
                  )}
                  <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => setPlanDialogOpen(true)}>
                    Editar plan
                  </Button>
                </Box>
              </Box>
              <Table size="small" sx={{ mb: 3 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Concepto</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Importe</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Vence</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.cuotas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">
                          Sin cuotas.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    summary.cuotas.map((cuota, i) => (
                      <TableRow key={cuota.id ?? i}>
                        <TableCell sx={{ fontWeight: 600 }}>{cuota.concepto}</TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{money(cuota.importe)}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{dayjs(cuota.vencimiento).format("DD/MM/YYYY")}</TableCell>
                        <TableCell>
                          <CuotaStatus cuota={cuota} money={money} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </>
          )}

          {/* Pagos recibidos */}
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Pagos recibidos</Typography>
          {summary.pagos.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Todavía no se registraron pagos.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Importe</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Medio</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Nota</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.pagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{dayjs(pago.fecha).format("DD/MM/YYYY")}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatMoney(pago.importe, pago.moneda)}
                      </Typography>
                      {pago.tipoCambio !== null && currency && (
                        <Typography variant="caption" color="text.secondary">
                          TC {pago.tipoCambio.toLocaleString("es-AR")} = {money(pago.importeAplicado)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{pago.medio === "EFECTIVO" ? "Efectivo" : "Transferencia"}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{pago.nota || "—"}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Corregir pago">
                        <IconButton size="small" color="primary" onClick={() => setPaymentDialog({ pago })}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar pago">
                        <IconButton size="small" color="error" onClick={() => setPagoToDelete(pago)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {paymentDialog && currency && (
        <PaymentDialog
          fileId={fileId}
          chargeCurrency={currency}
          pago={paymentDialog.pago}
          suggestedAmount={summary.proximoVencimiento?.falta ?? summary.falta}
          onClose={() => setPaymentDialog(null)}
          onSaved={(data) => {
            setSummary(data);
            setPaymentDialog(null);
          }}
        />
      )}

      {planDialogOpen && currency && (
        <PlanDialog
          fileId={fileId}
          currency={currency}
          total={summary.total}
          cuotas={summary.cuotas}
          onClose={() => setPlanDialogOpen(false)}
          onSaved={(data) => {
            setSummary(data);
            setPlanDialogOpen(false);
          }}
        />
      )}

      <Dialog open={pagoToDelete !== null} onClose={() => setPagoToDelete(null)}>
        <DialogTitle>Eliminar pago</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Eliminar el pago de {pagoToDelete && formatMoney(pagoToDelete.importe, pagoToDelete.moneda)} del{" "}
            {pagoToDelete && dayjs(pagoToDelete.fecha).format("DD/MM/YYYY")}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPagoToDelete(null)}>Cancelar</Button>
          <Button color="error" onClick={handleDeletePago}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Volver al plan automático</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se borran las cuotas armadas a mano y vuelve el plan automático (seña = aéreos, saldo 25 días antes
            de la salida). Los pagos registrados no se tocan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleResetPlan}>
            Volver al automático
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/* ---------- Registrar / corregir un pago ---------- */

interface PaymentDialogProps {
  fileId: string;
  chargeCurrency: string;
  pago: iPago | null;
  suggestedAmount: number;
  onClose: () => void;
  onSaved: (data: iPaymentsSummary) => void;
}

export const PaymentDialog = ({ fileId, chargeCurrency, pago, suggestedAmount, onClose, onSaved }: PaymentDialogProps) => {
  const [fecha, setFecha] = useState(toDateInput(pago?.fecha ?? new Date()));
  const [moneda, setMoneda] = useState(pago?.moneda ?? chargeCurrency);
  const [importe, setImporte] = useState(pago ? String(pago.importe) : suggestedAmount > 0 ? String(suggestedAmount) : "");
  const [tipoCambio, setTipoCambio] = useState(pago?.tipoCambio ? String(pago.tipoCambio) : "");
  const [medio, setMedio] = useState<PaymentMethod>(pago?.medio ?? "TRANSFERENCIA");
  const [nota, setNota] = useState(pago?.nota ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherCurrency = moneda !== chargeCurrency;
  // "pesos por 1 dólar" cuando hay pesos de por medio; si no, "1 <pagada> = X <del file>"
  const rateLabel =
    moneda === "PESOS" || chargeCurrency === "PESOS"
      ? `Tipo de cambio (pesos por 1 ${currencyLabel(moneda === "PESOS" ? chargeCurrency : moneda).toLowerCase()})`
      : `Tipo de cambio (1 ${currencyLabel(moneda)} = ? ${currencyLabel(chargeCurrency)})`;
  const equivalent = appliedAmount(Number(importe) || 0, moneda, chargeCurrency, Number(tipoCambio) || null);

  const canSave = Number(importe) > 0 && fecha && (!otherCurrency || Number(tipoCambio) > 0);

  const handleSave = async () => {
    setSaving(true);
    const input: iPagoInput = {
      fecha: fromDateInput(fecha),
      importe: Number(importe),
      moneda,
      tipoCambio: otherCurrency ? Number(tipoCambio) : null,
      medio,
      nota,
    };
    const result = pago ? await updatePago(fileId, pago.id, input) : await addPago(fileId, input);
    setSaving(false);
    if (result.ok) onSaved(result.data);
    else setError(result.msg);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{pago ? "Corregir pago" : "Registrar pago"}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
        <TextField label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} InputLabelProps={{ shrink: true }} />

        <Box>
          <Typography variant="body2" color="text.secondary">
            Pagó en
          </Typography>
          <RadioGroup row value={moneda} onChange={(e) => setMoneda(e.target.value)}>
            {CURRENCIES.map((c) => (
              <FormControlLabel key={c.value} value={c.value} control={<Radio size="small" />} label={c.label} />
            ))}
          </RadioGroup>
        </Box>

        <TextField
          label="Importe"
          type="number"
          value={importe}
          onChange={(e) => setImporte(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{CURRENCIES.find((c) => c.value === moneda)?.symbol}</InputAdornment>
            ),
          }}
        />

        {otherCurrency && (
          <>
            <TextField label={rateLabel} type="number" value={tipoCambio} onChange={(e) => setTipoCambio(e.target.value)} />
            <Alert severity="info" icon={false}>
              {equivalent !== null
                ? `Equivale a ${formatMoney(equivalent, chargeCurrency)} (el file se cobra en ${currencyLabel(chargeCurrency)})`
                : `Cargá el tipo de cambio para calcular cuánto descuenta en ${currencyLabel(chargeCurrency)}`}
            </Alert>
          </>
        )}

        <Box>
          <Typography variant="body2" color="text.secondary">
            Medio
          </Typography>
          <RadioGroup row value={medio} onChange={(e) => setMedio(e.target.value as PaymentMethod)}>
            {METHODS.map((m) => (
              <FormControlLabel key={m.value} value={m.value} control={<Radio size="small" />} label={m.label} />
            ))}
          </RadioGroup>
        </Box>

        <TextField
          label="Nota (opcional)"
          placeholder="Ej: transferencia Banco Nación"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          inputProps={{ maxLength: 300 }}
        />

        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? "Guardando..." : pago ? "Guardar cambios" : "Registrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ---------- Plan de pagos propio ---------- */

interface PlanDialogProps {
  fileId: string;
  currency: string;
  total: number;
  cuotas: iCuota[];
  onClose: () => void;
  onSaved: (data: iPaymentsSummary) => void;
}

interface PlanRow {
  concepto: string;
  importe: string;
  vencimiento: string;
}

const PlanDialog = ({ fileId, currency, total, cuotas, onClose, onSaved }: PlanDialogProps) => {
  // Arranca desde el plan actual (automático o propio)
  const [rows, setRows] = useState<PlanRow[]>(
    cuotas.length > 0
      ? cuotas.map((c) => ({ concepto: c.concepto, importe: String(c.importe), vencimiento: toDateInput(c.vencimiento) }))
      : [{ concepto: "Seña", importe: "", vencimiento: toDateInput(new Date()) }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sum = Math.round(rows.reduce((acc, r) => acc + (Number(r.importe) || 0), 0) * 100) / 100;
  const difference = Math.round((total - sum) * 100) / 100;
  const valid = rows.length > 0 && rows.every((r) => r.concepto.trim() && Number(r.importe) > 0 && r.vencimiento);

  const update = (index: number, field: keyof PlanRow, value: string) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));

  const handleSave = async () => {
    setSaving(true);
    const input: iCuotaInput[] = rows.map((r) => ({
      concepto: r.concepto.trim(),
      importe: Number(r.importe),
      vencimiento: fromDateInput(r.vencimiento),
    }));
    const result = await savePlan(fileId, input);
    setSaving(false);
    if (result.ok) onSaved(result.data);
    else setError(result.msg);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar plan de pagos</DialogTitle>
      <DialogContent sx={{ pt: "8px !important" }}>
        <DialogContentText sx={{ mb: 2 }}>
          Armá las cuotas como quieras. Total a cobrar: <strong>{formatMoney(total, currency)}</strong>.
        </DialogContentText>

        {rows.map((row, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              size="small"
              label="Concepto"
              value={row.concepto}
              onChange={(e) => update(i, "concepto", e.target.value)}
              sx={{ flex: 2, minWidth: 160 }}
            />
            <TextField
              size="small"
              label="Importe"
              type="number"
              value={row.importe}
              onChange={(e) => update(i, "importe", e.target.value)}
              sx={{ flex: 1, minWidth: 120 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{CURRENCIES.find((c) => c.value === currency)?.symbol}</InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              label="Vence"
              type="date"
              value={row.vencimiento}
              onChange={(e) => update(i, "vencimiento", e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1, minWidth: 150 }}
            />
            <Tooltip title="Quitar cuota">
              <span>
                <IconButton color="error" disabled={rows.length === 1} onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}>
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ))}

        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() =>
            setRows((prev) => [
              ...prev,
              {
                concepto: `Cuota ${prev.length + 1}`,
                importe: difference > 0 ? String(difference) : "",
                vencimiento: toDateInput(new Date()),
              },
            ])
          }
        >
          Agregar cuota
        </Button>

        <Alert severity={difference === 0 ? "success" : "warning"} sx={{ mt: 2 }}>
          Las cuotas suman {formatMoney(sum, currency)}.{" "}
          {difference === 0
            ? "Coincide con el total."
            : difference > 0
              ? `Faltan ${formatMoney(difference, currency)} para llegar al total.`
              : `Se pasa por ${formatMoney(-difference, currency)} del total.`}
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={!valid || saving}>
          {saving ? "Guardando..." : "Guardar plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
