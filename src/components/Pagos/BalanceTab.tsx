import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { getBalance, iBalanceMonth, iToInvoice } from "../File/invoiceHandler";
import { CURRENCIES, formatMoney } from "../File/utils/totals";
import { formatFileNumber } from "../File/utils/fileNumber";
import { InvoiceDialog } from "../File/components/InvoiceDialog";
import { NewInvoiceDialog } from "./NewInvoiceDialog";

const paperSx = {
  borderRadius: 3,
  backgroundColor: "rgba(255, 255, 255, 0.97)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const ymd = (date: dayjs.Dayjs) => date.format("YYYY-MM-DD");

// Atajos que completan las dos fechas
const SHORTCUTS = [
  { label: "Este mes", range: () => [dayjs().startOf("month"), dayjs()] },
  { label: "Mes pasado", range: () => [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
  { label: "Últimos 3 meses", range: () => [dayjs().subtract(2, "month").startOf("month"), dayjs()] },
  { label: "Últimos 6 meses", range: () => [dayjs().subtract(5, "month").startOf("month"), dayjs()] },
  { label: "Este año", range: () => [dayjs().startOf("year"), dayjs()] },
  { label: "Año pasado", range: () => [dayjs().subtract(1, "year").startOf("year"), dayjs().subtract(1, "year").endOf("year")] },
].map((s) => {
  const [desde, hasta] = s.range();
  return { label: s.label, desde: ymd(desde), hasta: ymd(hasta) };
});

// Período en la URL: "AAAA-MM-DD_AAAA-MM-DD"; por defecto, este año
const parsePeriod = (period: string | null) => {
  const match = period?.match(/^(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})$/);
  if (match && match[1] <= match[2]) return { desde: match[1], hasta: match[2] };
  return { desde: ymd(dayjs().startOf("year")), hasta: ymd(dayjs()) };
};

const chipSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 5,
  borderColor: "#c9d7dc",
  color: "#0D5B75",
};

const monthName = (mes: string) => {
  const text = dayjs(`${mes}-01`).locale("es").format("MMMM YYYY");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const Amount = ({ value, currency, strong }: { value: number; currency: string; strong?: boolean }) => (
  <Typography component="span" sx={{ fontWeight: strong ? 700 : 600, color: value < 0 ? "error.main" : value > 0 ? "success.dark" : "text.secondary" }}>
    {value < 0 ? "−" : value > 0 ? "+" : ""}
    {formatMoney(Math.abs(value), currency)}
  </Typography>
);

// Un número grande del resumen
const Figure = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box sx={{ flex: 1, minWidth: 180, p: 2, borderRadius: 2, backgroundColor: "#f2f8fa" }}>
    <Typography sx={{ fontSize: "0.9rem", color: "#5b6d74", fontWeight: 600 }}>{label}</Typography>
    <Typography component="div" sx={{ fontSize: "1.4rem", fontWeight: 700 }}>
      {children}
    </Typography>
  </Box>
);

/**
 * Balance: lo que les facturamos a los pasajeros contra lo que les pagamos a los mayoristas,
 * en el período que se elija, con el detalle mes por mes.
 */
export const BalanceTab = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { desde, hasta } = parsePeriod(searchParams.get("periodo"));
  const setPeriod = (from: string, to: string) =>
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.set("periodo", `${from}_${to}`);
        return params;
      },
      { replace: true }
    );

  const [data, setData] = useState<{ meses: iBalanceMonth[]; porFacturar: iToInvoice[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [invoicing, setInvoicing] = useState<iToInvoice | null>(null);
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBalance(desde, hasta).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [desde, hasta, reloadKey]);

  const months = data?.meses ?? [];
  const currencies = CURRENCIES.map((c) => c.value).filter((currency) =>
    months.some((m) => m.facturado[currency] || m.pagado[currency])
  );
  const diff = (m: iBalanceMonth, currency: string) => (m.facturado[currency] ?? 0) - (m.pagado[currency] ?? 0);

  // Después de facturar: avisar y volver a calcular
  const handleInvoiced = () => {
    setInvoicing(null);
    setNewInvoiceOpen(false);
    setSavedOpen(true);
    setReloadKey((k) => k + 1);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewInvoiceOpen(true)}
          sx={{ background: "linear-gradient(135deg, #0D5B75 0%, #1a7a99 100%)", fontWeight: 600 }}
        >
          Facturar un file
        </Button>
      </Box>

      <Paper sx={{ ...paperSx, p: 2, mb: 2 }}>
        <Typography sx={{ color: "#5b6d74", mb: 2 }}>
          Lo que <strong>les facturamos a los pasajeros</strong> (files marcados como facturados, por fecha de factura) contra lo que{" "}
          <strong>les pagamos a los mayoristas</strong> (por fecha de pago). Cada moneda va por separado.
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, color: "#0D5B75" }}>
          <CalendarMonthIcon />
          <Typography sx={{ fontWeight: 700 }}>¿Qué período querés ver?</Typography>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <DatePicker
              label="Desde"
              format="DD/MM/YYYY"
              value={dayjs(desde)}
              maxDate={dayjs(hasta)}
              onChange={(value) => value?.isValid() && setPeriod(ymd(value), hasta)}
              slotProps={{ textField: { sx: { width: 200 } } }}
            />
            <DatePicker
              label="Hasta"
              format="DD/MM/YYYY"
              value={dayjs(hasta)}
              minDate={dayjs(desde)}
              onChange={(value) => value?.isValid() && setPeriod(desde, ymd(value))}
              slotProps={{ textField: { sx: { width: 200 } } }}
            />
          </Box>
        </LocalizationProvider>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {SHORTCUTS.map((shortcut) => {
            const active = shortcut.desde === desde && shortcut.hasta === hasta;
            return (
              <Button
                key={shortcut.label}
                size="small"
                variant={active ? "contained" : "outlined"}
                onClick={() => setPeriod(shortcut.desde, shortcut.hasta)}
                sx={{ ...chipSx, ...(active && { backgroundColor: "#0D5B75", color: "#fff" }) }}
              >
                {shortcut.label}
              </Button>
            );
          })}
        </Box>
      </Paper>

      {/* Files pagados que falta facturar */}
      {data && data.porFacturar.length > 0 && (
        <Paper sx={{ ...paperSx, p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: "warning.dark" }}>
            <ReceiptIcon />
            <Typography sx={{ fontWeight: 700 }}>
              {data.porFacturar.length === 1 ? "1 file pagado que falta facturar" : `${data.porFacturar.length} files pagados que falta facturar`}
            </Typography>
          </Box>
          {data.porFacturar.map((f) => (
            <Box
              key={f.id}
              onClick={() => navigate(`/files/profile/${f.id}?seccion=pagos`)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 1,
                px: 1,
                borderRadius: 2,
                cursor: "pointer",
                borderBottom: "1px solid #eef2f4",
                "&:last-of-type": { borderBottom: "none" },
                "&:hover": { backgroundColor: "#f2f8fa" },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {[formatFileNumber(f), f.destino].filter(Boolean).join(" · ")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.pasajero ? `${f.pasajero.firstname} ${f.pasajero.lastname} · ` : ""}sale el {dayjs(f.fechaSalida).format("DD/MM/YYYY")}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{formatMoney(f.total, f.moneda)}</Typography>
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  setInvoicing(f);
                }}
                sx={{ textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
              >
                Marcar facturado
              </Button>
            </Box>
          ))}
        </Paper>
      )}

      {loading && !data ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#fff" }} />
        </Box>
      ) : currencies.length === 0 ? (
        <Paper sx={{ ...paperSx, p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No hay facturas ni pagos a mayoristas en este período. Marcá los files como facturados desde la pestaña Pagos de cada file.
          </Typography>
        </Paper>
      ) : (
        currencies.map((currency) => {
          const facturado = months.reduce((sum, m) => sum + (m.facturado[currency] ?? 0), 0);
          const pagado = months.reduce((sum, m) => sum + (m.pagado[currency] ?? 0), 0);
          const label = CURRENCIES.find((c) => c.value === currency)?.label ?? currency;
          return (
            <Paper key={currency} sx={{ ...paperSx, p: 2, mb: 2, opacity: loading ? 0.6 : 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#0D5B75", mb: 1.5 }}>En {label.toLowerCase()}</Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
                <Figure label="Facturado a pasajeros">{formatMoney(facturado, currency)}</Figure>
                <Figure label="Pagado a mayoristas">{formatMoney(pagado, currency)}</Figure>
                <Figure label={`Diferencia del ${dayjs(desde).format("DD/MM/YYYY")} al ${dayjs(hasta).format("DD/MM/YYYY")}`}>
                  <Amount value={facturado - pagado} currency={currency} strong />
                </Figure>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Mes</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Facturado a pasajeros
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Pagado a mayoristas
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Diferencia del mes
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {months.map((m) => (
                      <TableRow key={m.mes} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{monthName(m.mes)}</TableCell>
                        <TableCell align="right">{m.facturado[currency] ? formatMoney(m.facturado[currency], currency) : "—"}</TableCell>
                        <TableCell align="right">{m.pagado[currency] ? formatMoney(m.pagado[currency], currency) : "—"}</TableCell>
                        <TableCell align="right">
                          <Amount value={diff(m, currency)} currency={currency} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        })
      )}

      {invoicing && (
        <InvoiceDialog
          fileId={invoicing.id}
          initial={{ importe: invoicing.total, moneda: invoicing.moneda }}
          onClose={() => setInvoicing(null)}
          onSaved={handleInvoiced}
        />
      )}

      {newInvoiceOpen && <NewInvoiceDialog onClose={() => setNewInvoiceOpen(false)} onSaved={handleInvoiced} />}

      <Snackbar open={savedOpen} autoHideDuration={3000} onClose={() => setSavedOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success" onClose={() => setSavedOpen(false)}>
          File facturado
        </Alert>
      </Snackbar>
    </>
  );
};
