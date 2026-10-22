import { Box, Button, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { formatMoney } from "../File/utils/totals";

export interface iHistoryFilter {
  search: string;
  desde: string;
  hasta: string;
}

interface HistoryFiltersProps {
  value: iHistoryFilter;
  onChange: (value: iHistoryFilter) => void;
  placeholder: string;
  // Total del período por moneda (de todo lo filtrado)
  totals?: Record<string, number>;
  totalLabel: string;
}

/**
 * Filtro de un historial de pagos: texto + rango de fechas (Desde / Hasta, ambos incluidos),
 * con el total del período.
 */
export const HistoryFilters = ({ value, onChange, placeholder, totals, totalLabel }: HistoryFiltersProps) => {
  const hasFilter = value.search || value.desde || value.hasta;
  const totalEntries = Object.entries(totals ?? {});

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          sx={{ flex: 1, minWidth: 220 }}
          placeholder={placeholder}
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          size="small"
          type="date"
          label="Desde"
          value={value.desde}
          onChange={(e) => onChange({ ...value, desde: e.target.value })}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: value.hasta || undefined }}
        />
        <TextField
          size="small"
          type="date"
          label="Hasta"
          value={value.hasta}
          onChange={(e) => onChange({ ...value, hasta: e.target.value })}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: value.desde || undefined }}
        />
        {hasFilter && (
          <Button size="small" onClick={() => onChange({ search: "", desde: "", hasta: "" })}>
            Limpiar
          </Button>
        )}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0D5B75" }}>
        {totalLabel}: {totalEntries.length > 0 ? totalEntries.map(([currency, amount]) => formatMoney(amount, currency)).join("  ·  ") : "—"}
      </Typography>
    </Paper>
  );
};
