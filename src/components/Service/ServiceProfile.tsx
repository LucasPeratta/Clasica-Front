import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getServiceById } from "./handler";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { iService } from "./model";

export const ServiceProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<iService | null>(null);

  useEffect(() => {
    if (!id) return;
    getServiceById(id)
      .then((data) => {
        setService(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  if (!service) {
    return <div>Error</div>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Detalles del Servicio
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Proveedor:</TableCell>
              <TableCell>{service.provider}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Precio Neto:</TableCell>
              <TableCell>{service.precioNeto}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tarifa:</TableCell>
              <TableCell>{service.tarifa}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Valor:</TableCell>
              <TableCell>{service.currency}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Observaciones:</TableCell>
              <TableCell>
                <Typography
                  style={{
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    lineHeight: "1.2", // Ajusta este valor para el espaciado entre líneas
                    maxWidth: "40ch", // Limita a 30 caracteres por línea
                  }}
                >
                  {service.obs}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" marginTop={2}>
        <Button component={Link} to={`/services`} variant="contained">
          Volver
        </Button>
      </Box>
    </div>
  );
};
