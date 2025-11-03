import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { getService, softDeleteService } from "./handler";
import { LoadingScreen } from "../LoadingScreen";
import { iService } from "./model";

export const Service = (): JSX.Element => {
  const [services, setServices] = useState<iService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDeleteId, setServiceToDeleteId] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getService().then((data) => {
      const sorted = data.sort((a, b) =>
        a.createdAt && b.createdAt ? (a.createdAt > b.createdAt ? -1 : 1) : 0
      );
      setServices(sorted);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingScreen />;

  const filteredServices = services.filter((s) =>
    s.provider?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => navigate("/services/create");
  const handleView = (id: string) => navigate(`/services/profile/${id}`);

  const askDelete = (id: string) => {
    setServiceToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const response = await softDeleteService(id);
    if (response?.ok) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      setSuccessOpen(true);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 3,
        background: "linear-gradient(135deg, #eaf3ff 0%, #dfeefe 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header: buscador + botón */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          placeholder="Buscar servicio"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
            px: 1.5,
            py: 0.5,
            height: 36,
          }}
        >
          Nuevo servicio
        </Button>
      </Paper>

      {/* Tabla */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          maxHeight: "64vh",
          overflowY: "auto",
          borderRadius: 2,
        }}
      >
        <Table stickyHeader size="medium" aria-label="tabla de servicios">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Precio neto
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Tarifa
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Moneda
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No se encontraron servicios para “{searchTerm}”.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((row, idx) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    backgroundColor:
                      idx % 2
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(255,255,255,0.85)",
                    "&:hover": { backgroundColor: "rgba(2,136,209,0.08)" },
                  }}
                >
                  <TableCell>{row.provider}</TableCell>
                  <TableCell align="right">{row.precioNeto}</TableCell>
                  <TableCell align="right">{row.tarifa}</TableCell>
                  <TableCell align="right">{row.currency}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalles">
                      <IconButton
                        color="primary"
                        onClick={() => handleView(row.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar servicio">
                      <IconButton
                        color="error"
                        onClick={() => askDelete(row.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Notificación de eliminación */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success">
          ¡Servicio eliminado con éxito!
        </Alert>
      </Snackbar>

      {/* Confirmación de borrado */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este servicio?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={() => handleDelete(serviceToDeleteId)}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
