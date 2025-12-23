import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { iFile } from "../../model";
import { display } from "../../utils/formatters";

interface FileProfileDataProps {
  file: iFile;
}

export const FileProfileData = ({ file }: FileProfileDataProps) => {
  return (
    <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Número de File</TableCell>
              <TableCell>{display(file.nro)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Destino</TableCell>
              <TableCell>{display(file.destino)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Fecha de salida</TableCell>
              <TableCell>
                {file.fechaSalida
                  ? dayjs(file.fechaSalida).format("DD-MM-YYYY")
                  : "—"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Precio neto total</TableCell>
              <TableCell>
                {file.precioNetoTotal ? `$${file.precioNetoTotal}` : "—"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tarifa total</TableCell>
              <TableCell>
                {file.tarifaTotal ? `$${file.tarifaTotal}` : "—"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Tarifa Alternativa</TableCell>
              <TableCell>
                {file.tarifaAlternativa ? `$${file.tarifaAlternativa}` : "—"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Observaciones</TableCell>
              <TableCell>
                {file.obs ? (
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {file.obs}
                  </Typography>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
