import { Box, Chip, Tooltip } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { iDocumentAlert } from "../utils/documentAlerts";

/**
 * Etiquetas de avisos de documentos (DNI / pasaporte); al pasar el mouse muestran el detalle
 */
export const DocumentAlertChips = ({ alerts }: { alerts: iDocumentAlert[] }) => {
  if (alerts.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
      {alerts.map((alert) => (
        <Tooltip key={alert.short} title={alert.detail}>
          <Chip
            size="small"
            icon={<WarningAmberIcon />}
            label={alert.short}
            color={alert.level}
            variant={alert.level === "error" ? "filled" : "outlined"}
            sx={{ fontWeight: 600, height: 22, "& .MuiChip-label": { px: 0.75 } }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};
