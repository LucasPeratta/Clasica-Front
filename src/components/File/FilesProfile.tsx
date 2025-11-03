import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getFileById } from "./handler";
import dayjs from "dayjs";
import { LoadingScreen } from "../LoadingScreen";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import { iFile } from "./model";
import { iPax } from "../Pax/model";
import { iService } from "../Service/model";

function initials(lastname = "", firstname = "") {
  const a = (lastname || "").trim()[0] ?? "";
  const b = (firstname || "").trim()[0] ?? "";
  return (a + b).toUpperCase();
}

export const FilesProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<iFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getFileById(id)
      .then((data) => {
        setFile(data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!file) return <Typography>Error al cargar el archivo.</Typography>;

  return (
    <Box
      sx={{
        px: { xs: 3, md: 10 },
        py: 4,
        background: "linear-gradient(135deg, #eaf3ff 0%, #dfeefe 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Título */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 3, color: "#0d47a1", textAlign: "center" }}
      >
        Detalles del Archivo
      </Typography>

      {/* DATOS DEL FILE */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>
                  Precio neto total
                </TableCell>
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
                <TableCell sx={{ fontWeight: 600 }}>Destino</TableCell>
                <TableCell>{file.destino || "—"}</TableCell>
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

      {/* CLIENTES */}
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 1, color: "#0d47a1" }}
      >
        Clientes
      </Typography>
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {file.clients.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">
                No hay pasajeros asociados.
              </Typography>
            </Box>
          ) : (
            file.clients.map((client: iPax) => (
              <Box
                key={client.id}
                onClick={() =>
                  navigate(`/paxs/profile/${client.id}`, {
                    state: { fromFileId: file.id }, // 👈 para que el botón Volver del pax regrese a este file
                  })
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  cursor: "pointer",
                  transition: "background 0.15s",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  "&:hover": {
                    backgroundColor: "rgba(13,71,161,0.04)",
                  },
                  "&:last-of-type": {
                    borderBottom: "none",
                  },
                }}
              >
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {initials(client.lastname, client.firstname)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {client.lastname} {client.firstname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {client.email || "Sin email"}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {client.dni || "—"}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* SERVICIOS */}
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 1, color: "#0d47a1" }}
      >
        Servicios
      </Typography>
      <Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {file.services.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">
                No hay servicios asociados.
              </Typography>
            </Box>
          ) : (
            file.services.map((service: iService) => (
              <Box
                key={service.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Typography sx={{ fontWeight: 600, minWidth: 180 }}>
                  {service.provider}
                </Typography>
                <Typography>
                  Precio Neto:{" "}
                  {service.precioNeto ? `$${service.precioNeto}` : "—"}
                </Typography>
                <Typography>
                  Tarifa: {service.tarifa ? `$${service.tarifa}` : "—"}
                </Typography>
                <Typography>{service.currency || ""}</Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {service.obs || ""}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      {/* BOTONES */}
      <Box display="flex" justifyContent="center" gap={2}>
        <Button
          component={Link}
          to="/files"
          variant="outlined"
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          Volver
        </Button>
        <Button
          component={Link}
          to={`/files/update/${id}`}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            background: "linear-gradient(135deg, #007bff 0%, #6f42c1 100%)",
          }}
        >
          Editar
        </Button>
      </Box>
    </Box>
  );
};
