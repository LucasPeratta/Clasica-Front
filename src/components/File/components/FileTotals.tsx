import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { iService } from "../../Service/model";
import {
  CURRENCIES,
  formatMoney,
  getAlternativeTariff,
  getTotalsByCurrency,
} from "../utils/totals";

interface FileTotalsProps {
  services: iService[];
  // Tarifa alternativa: lo que se le cobra al pasajero, en una sola moneda
  tarifaAlternativa?: string | null;
  tarifaAlternativaMoneda?: string | null;
  // Si se pasa, se puede editar la tarifa alternativa desde acá (perfil del file)
  onSaveAlternative?: (amount: string, currency: string) => Promise<boolean>;
}

const formatProfit = (amount: number, currency: string) =>
  `${amount < 0 ? "−" : ""}${formatMoney(Math.abs(amount), currency)}`;

export const FileTotals = ({
  services,
  tarifaAlternativa,
  tarifaAlternativaMoneda,
  onSaveAlternative,
}: FileTotalsProps) => {
  const totals = getTotalsByCurrency(services);
  const alternative = getAlternativeTariff({ tarifaAlternativa, tarifaAlternativaMoneda });

  // Ganancia real: tarifa alternativa − neto, solo si todo el file está en esa moneda
  const usedCurrencies = totals.filter((t) => t.neto !== 0 || t.tarifa !== 0);
  const canComputeProfit =
    alternative?.currency &&
    usedCurrencies.every((t) => t.currency === alternative.currency);
  const netoInCurrency = totals.find((t) => t.currency === alternative?.currency)?.neto ?? 0;

  // Diálogo de edición
  const [editing, setEditing] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("USD");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const openEdit = () => {
    setAmountInput(alternative ? String(alternative.amount) : "");
    // Por defecto, la moneda del file si usa una sola
    setCurrencyInput(
      alternative?.currency ||
        (usedCurrencies.length === 1 ? usedCurrencies[0].currency : "USD")
    );
    setSaveError(false);
    setEditing(true);
  };

  const save = async (amount: string) => {
    if (!onSaveAlternative) return;
    setSaving(true);
    const ok = await onSaveAlternative(amount, currencyInput);
    setSaving(false);
    if (ok) setEditing(false);
    else setSaveError(true);
  };

  return (
    <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0D5B75", mb: 1 }}>
          Totales
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Moneda</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Precio neto
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Tarifa
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Ganancia
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {totals.map((t) => {
              const empty = t.neto === 0 && t.tarifa === 0;
              const profit = t.tarifa - t.neto;
              return (
                <TableRow
                  key={t.currency}
                  sx={{ "& td": { color: empty ? "text.disabled" : "text.primary" } }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{t.label}</TableCell>
                  <TableCell align="right">{formatMoney(t.neto, t.currency)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatMoney(t.tarifa, t.currency)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                      ...(!empty && { color: profit < 0 ? "error.main !important" : "success.dark !important" }),
                    }}
                  >
                    {formatProfit(profit, t.currency)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Tarifa alternativa: lo que se le cobra al pasajero */}
        {(alternative || onSaveAlternative) && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: "rgba(13, 91, 117, 0.06)",
              border: "1px solid rgba(13, 91, 117, 0.15)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {alternative ? (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tarifa alternativa (le cobramos)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0D5B75" }}>
                  {alternative.currency
                    ? formatMoney(alternative.amount, alternative.currency)
                    : alternative.amount.toLocaleString("es-AR")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {!alternative.currency ? (
                    <Box component="span" sx={{ color: "warning.dark" }}>
                      Falta elegir la moneda
                    </Box>
                  ) : canComputeProfit ? (
                    <>
                      Ganancia real:{" "}
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 700,
                          color:
                            alternative.amount - netoInCurrency < 0
                              ? "error.main"
                              : "success.dark",
                        }}
                      >
                        {formatProfit(alternative.amount - netoInCurrency, alternative.currency)}
                      </Box>
                    </>
                  ) : (
                    <Box component="span" sx={{ color: "text.secondary" }}>
                      No se puede calcular la ganancia real: el file tiene servicios en otra moneda.
                    </Box>
                  )}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Sin tarifa alternativa: se cobra la tarifa sumada de los servicios.
              </Typography>
            )}

            {onSaveAlternative && (
              <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={openEdit}>
                {alternative ? "Editar" : "Cargar tarifa alternativa"}
              </Button>
            )}
          </Box>
        )}
      </CardContent>

      <Dialog open={editing} onClose={() => setEditing(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Tarifa alternativa</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <Typography variant="body2" color="text.secondary">
            Lo que le cobramos al pasajero, en una sola moneda.
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              select
              label="Moneda"
              value={currencyInput}
              onChange={(e) => setCurrencyInput(e.target.value)}
              sx={{ width: 130 }}
            >
              {CURRENCIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Importe"
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {CURRENCIES.find((c) => c.value === currencyInput)?.symbol}
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {saveError && (
            <Typography variant="body2" color="error">
              No se pudo guardar. Intentá de nuevo.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {alternative && (
            <Button color="error" onClick={() => save("")} disabled={saving} sx={{ mr: "auto" }}>
              Quitar
            </Button>
          )}
          <Button onClick={() => setEditing(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => save(amountInput)}
            disabled={saving || amountInput.trim() === "" || isNaN(Number(amountInput))}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
