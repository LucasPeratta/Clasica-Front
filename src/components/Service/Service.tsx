import { useState } from "react";
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
  Link as MuiLink,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link, useNavigate } from "react-router-dom";
import { getServicePage, softDeleteService } from "./handler";
import { iService } from "./model";
import { LoadingScreen } from "../LoadingScreen";
import { usePaginatedList } from "../common/Pagination/usePaginatedList";
import { TablePaginationBar } from "../common/Pagination/TablePaginationBar";
import { formatFileNumber } from "../File/utils/fileNumber";
import { formatMoney } from "../File/utils/totals";

const formatAmount = (amount: string, currency: string) =>
  amount && !isNaN(Number(amount)) ? formatMoney(Number(amount), currency) : "—";

// "03-2026 · Córdoba"
const fileLabel = (service: iService) => {
  const file = service.File?.[0];
  return file ? [formatFileNumber(file), file.destino].filter(Boolean).join(" · ") : "";
};

/**
 * Buscador de todos los servicios vendidos. Cada servicio pertenece a un file:
 * se crean desde el file y, al eliminarlos, también salen de él.
 */
export const Service = (): JSX.Element => {
  const {
    items: services,
    total,
    totalPages,
    pageSize,
    page,
    setPage,
    search,
    searchInput,
    setSearchInput,
    initialLoading,
    loading,
    reload,
  } = usePaginatedList(getServicePage);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<iService | null>(null);

  const navigate = useNavigate();

  if (initialLoading) return <LoadingScreen />;

  const handleView = (id: string) => navigate(`/services/profile/${id}`);

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    const response = await softDeleteService(serviceToDelete.id);
    setServiceToDelete(null);
    if (response?.ok) {
      reload();
      setSuccessOpen(true);
    } else {
      setErrorOpen(true);
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
      {/* Buscador */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre, proveedor, localizador o número de file (ej. 55)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Los servicios se agregan desde cada file.
        </Typography>
      </Paper>

      {/* Tabla */}
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          maxHeight: "64vh",
          overflowY: "auto",
          borderRadius: 2,
          opacity: loading ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <Table stickyHeader size="medium" aria-label="tabla de servicios">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Localizador</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Precio neto
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Tarifa
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    {search
                      ? `No se encontraron servicios para "${search}".`
                      : "Todavía no hay servicios. Se agregan desde cada file."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              services.map((row, idx) => {
                const file = row.File?.[0];
                return (
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
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {file ? (
                        <Tooltip title="Ir al file">
                          <MuiLink
                            component={Link}
                            to={`/files/profile/${file.id}`}
                            underline="hover"
                            sx={{ fontWeight: 600, color: "#0D5B75" }}
                          >
                            {fileLabel(row)}
                          </MuiLink>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{row.nombre || "Sin nombre"}</TableCell>
                    <TableCell>{row.provider}</TableCell>
                    <TableCell>{row.localizador || "—"}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      {formatAmount(row.precioNeto, row.currency)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                      {formatAmount(row.tarifa, row.currency)}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
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
                          onClick={() => setServiceToDelete(row)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
      />

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

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setErrorOpen(false)} severity="error">
          No se pudo eliminar el servicio. Intentá de nuevo.
        </Alert>
      </Snackbar>

      {/* Confirmación de borrado (avisa que también sale del file) */}
      <Dialog open={serviceToDelete !== null} onClose={() => setServiceToDelete(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          {serviceToDelete && fileLabel(serviceToDelete) ? (
            <Alert severity="warning">
              Este servicio es del file <strong>{fileLabel(serviceToDelete)}</strong>. Si lo
              eliminás, también se va a quitar de ese file y de sus totales.
            </Alert>
          ) : (
            <DialogContentText>
              ¿Estás seguro de que deseas eliminar este servicio?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceToDelete(null)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
