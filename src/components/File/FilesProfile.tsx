import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getFileById } from "./handler";
import { iFile, iPax, iService } from "../model";
import dayjs from "dayjs";
import { LoadingScreen } from "../LoadingScreen";
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

export const FilesProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<iFile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getFileById(id)
      .then((data) => {
        setFile(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  if (!file) {
    return <div>Error</div>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Detalles del Archivo
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Precio Neto Total:</TableCell>
              <TableCell>{file.precioNetoTotal}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tarifa Total:</TableCell>
              <TableCell>{file.tarifaTotal}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Destino:</TableCell>
              <TableCell>{file.destino}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fecha de Salida:</TableCell>
              <TableCell>
                {dayjs(file.fechaSalida).format("DD-MM-YYYY")}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Observaciones:</TableCell>
              <TableCell>
                <Typography
                  style={{
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    lineHeight: "1.2", // Ajusta este valor para el espaciado entre líneas
                    maxWidth: "140ch",
                  }}
                >
                  {file.obs}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <h3>Clientes</h3>
              </TableCell>
              <TableCell colSpan={7}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {file.clients.map((client: iPax) => (
                        <TableRow key={client.id}>
                          <TableCell component="th" scope="row">
                            {client.firstname} {client.lastname}
                          </TableCell>
                          <TableCell>{client.dni}</TableCell>
                          <TableCell>{client.passport}</TableCell>
                          <TableCell>
                            {client.dob
                              ? dayjs(client.dob).format("DD-MM-YYYY")
                              : ""}
                          </TableCell>
                          <TableCell>{client.adress}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phoneNumber}</TableCell>
                          <TableCell>
                            <Typography
                              style={{
                                whiteSpace: "pre-wrap",
                                wordWrap: "break-word",
                                lineHeight: "1.2", // Ajusta este valor para el espaciado entre líneas
                                maxWidth: "60ch", // Limita a 30 caracteres por línea
                              }}
                            >
                              {client.obs}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <h3>Servicios</h3>
              </TableCell>
              <TableCell colSpan={4}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      {file.services.map((service: iService) => (
                        <TableRow key={service.id}>
                          <TableCell component="th" scope="row">
                            {service.provider}
                          </TableCell>
                          <TableCell>PrecioNeto:{service.precioNeto}</TableCell>
                          <TableCell>Tarifa:{service.tarifa}</TableCell>
                          <TableCell>{service.currency}</TableCell>
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
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" marginTop={2}>
        <Button
          component={Link}
          to={`/files`}
          variant="outlined"
          sx={{ marginRight: 2 }}
        >
          Volver
        </Button>
        <Button component={Link} to={`/files/update/${id}`} variant="contained">
          Editar
        </Button>
      </Box>
    </div>
  );
};
