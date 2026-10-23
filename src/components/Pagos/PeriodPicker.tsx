import { Box, Paper, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { PERIODS, customPeriod, isCustomPeriod, periodRange } from "./periods";

const toggleSx = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  px: 2,
  border: "1px solid #c9d7dc !important",
  borderRadius: "20px !important",
  "&.Mui-selected": { backgroundColor: "#0D5B75", color: "#fff", "&:hover": { backgroundColor: "#0a4a5e" } },
};

/**
 * Calendario para ver cuánto hay que pagar: botones rápidos (esta semana, la que viene...)
 * o un rango de fechas elegido a mano
 */
export const PeriodPicker = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const custom = isCustomPeriod(value);
  const { desde, hasta } = periodRange(value);

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, mb: 2, borderRadius: 3, backgroundColor: "rgba(255, 255, 255, 0.95)", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, color: "#0D5B75" }}>
        <CalendarMonthIcon />
        <Typography sx={{ fontWeight: 700 }}>¿Qué período querés ver?</Typography>
      </Box>
      <ToggleButtonGroup
        exclusive
        value={custom ? "custom" : value}
        onChange={(_, v: string | null) => v && onChange(v === "custom" ? customPeriod("", "") : v)}
        sx={{ flexWrap: "wrap", gap: 1 }}
      >
        {PERIODS.map((p) => (
          <ToggleButton key={p.value} value={p.value} size="small" sx={toggleSx}>
            {p.label}
          </ToggleButton>
        ))}
        <ToggleButton value="custom" size="small" sx={toggleSx}>
          Elegir fechas
        </ToggleButton>
      </ToggleButtonGroup>

      {custom && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
          <TextField
            size="small"
            type="date"
            label="Desde"
            value={desde}
            onChange={(e) => onChange(customPeriod(e.target.value, hasta))}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: hasta || undefined }}
          />
          <TextField
            size="small"
            type="date"
            label="Hasta"
            value={hasta}
            onChange={(e) => onChange(customPeriod(desde, e.target.value))}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: desde || undefined }}
          />
        </Box>
      )}
    </Paper>
  );
};
