import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { iService } from "../../Service/model";
import { formatMoney, getTotalsByCurrency } from "../utils/totals";

interface FileTotalsProps {
  services: iService[];
}

export const FileTotals = ({ services }: FileTotalsProps) => {
  const totals = getTotalsByCurrency(services);

  return (
    <Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d47a1", mb: 1 }}>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {totals.map((t) => {
              const empty = t.neto === 0 && t.tarifa === 0;
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
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
