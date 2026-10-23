import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { getBalance, iBalanceMonth, iToInvoice } from "../File/invoiceHandler";
import { CURRENCIES, formatMoney } from "../File/utils/totals";
import { formatFileNumber } from "../File/utils/fileNumber";
import { InvoiceDialog } from "../File/components/InvoiceDialog";

// Cuántos meses suma la columna "en 4 meses" (en ese lapso tiene que dar positivo)
const ROLLING_MONTHS = 4;

const paperSx = {
  borderRadius: 3,
  backgroundColor: "rgba(255, 255, 255, 0.97)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
};

const PERIODS = [
  { value: "12m", label: "Últimos 12 meses" },
  { value: "anio", label: "Este año" },
  { value: "anioPasado", label: "Año pasado" },
] as const;

const toggleSx = {
  textTransform: "none",
  fontWeight: 600,
  px: 2,
  border: "1px solid #c9d7dc !important",
  borderRadius: "20px !important",
  "&.Mui-selected": { backgroundColor: "#0D5B75", color: "#fff", "&:hover": { backgroundColor: "#0a4a5e" } },
};

const ym = (date: dayjs.Dayjs) => date.format("YYYY-MM");

// Meses del período (ambos incluidos). Fechas elegidas a mano: "AAAA-MM_AAAA-MM"
const periodMonths = (period: string) => {
  const now = dayjs();
  if (period === "anio") return { desde: ym(now.startOf("year")), hasta: ym(now) };
  if (period === "anioPasado") {
    const last = now.subtract(1, "year");
    return { desde: ym(last.startOf("year")), hasta: ym(last.endOf("year")) };
  }
  const custom = period.match(/^(\d{4}-\d{2})_(\d{4}-\d{2})$/);
  if (custom && custom[1] <= custom[2]) return { desde: custom[1], hasta: custom[2] };
  return { desde: ym(now.subtract(11, "month")), hasta: ym(now) };
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
 * mes por mes. Un mes puede dar negativo; en varios meses tiene que dar positivo.
 */
export const BalanceTab = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const period = searchParams.get("periodo") ?? "12m";
  const setPeriod = (value: string) =>
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (value === "12m") params.delete("periodo");
        else params.set("periodo", value);
        return params;
      },
      { replace: true }
    );
  const custom = period.includes("_");
  const { desde, hasta } = periodMonths(period);

  const [data, setData] = useState<{ meses: iBalanceMonth[]; porFacturar: iToInvoice[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [invoicing, setInvoicing] = useState<iToInvoice | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Se piden 3 meses más atrás para que la suma de 4 meses esté completa desde el primero
    const from = ym(dayjs(`${desde}-01`).subtract(ROLLING_MONTHS - 1, "month"));
    getBalance(from, hasta).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [desde, hasta, reloadKey]);

  const allMonths = data?.meses ?? [];
  const months = allMonths.filter((m) => m.mes >= desde);
  const currencies = CURRENCIES.map((c) => c.value).filter((currency) =>
    months.some((m) => m.facturado[currency] || m.pagado[currency])
  );
  const diff = (m: iBalanceMonth, currency: string) => (m.facturado[currency] ?? 0) - (m.pagado[currency] ?? 0);
  const rolling = (mes: string, currency: string) => {
    const index = allMonths.findIndex((m) => m.mes === mes);
    return allMonths.slice(Math.max(0, index - ROLLING_MONTHS + 1), index + 1).reduce((sum, m) => sum + diff(m, currency), 0);
  };

  return (
    <>
      <Paper sx={{ ...paperSx, p: 2, mb: 2 }}>
        <Typography sx={{ color: "#5b6d74", mb: 1.5 }}>
          Lo que <strong>les facturamos a los pasajeros</strong> (files marcados como facturados, por fecha de factura) contra lo que{" "}
          <strong>les pagamos a los mayoristas</strong> (por fecha de pago). Un mes puede dar negativo; en {ROLLING_MONTHS} meses o en el
          año tiene que dar positivo. Cada moneda va por separado.
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, color: "#0D5B75" }}>
          <CalendarMonthIcon />
          <Typography sx={{ fontWeight: 700 }}>Período</Typography>
        </Box>
        <ToggleButtonGroup
          exclusive
          value={custom ? "custom" : period}
          onChange={(_, v: string | null) => v && setPeriod(v === "custom" ? `${desde}_${hasta}` : v)}
          sx={{ flexWrap: "wrap", gap: 1 }}
        >
          {PERIODS.map((p) => (
            <ToggleButton key={p.value} value={p.value} size="small" sx={toggleSx}>
              {p.label}
            </ToggleButton>
          ))}
          <ToggleButton value="custom" size="small" sx={toggleSx}>
            Elegir meses
          </ToggleButton>
        </ToggleButtonGroup>
        {custom && (
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
            <TextField
              size="small"
              type="month"
              label="Desde"
              value={desde}
              onChange={(e) => e.target.value && setPeriod(`${e.target.value}_${hasta}`)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="month"
              label="Hasta"
              value={hasta}
              onChange={(e) => e.target.value && setPeriod(`${desde}_${e.target.value}`)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )}
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
                <Figure label="Diferencia del período">
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
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        <Tooltip title={`Suma de este mes y los ${ROLLING_MONTHS - 1} anteriores: es la que tiene que dar positiva`}>
                          <span>En {ROLLING_MONTHS} meses ⓘ</span>
                        </Tooltip>
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
                        <TableCell align="right" sx={{ backgroundColor: "#f7fbfc" }}>
                          <Amount value={rolling(m.mes, currency)} currency={currency} strong />
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
          onSaved={() => {
            setInvoicing(null);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
};
