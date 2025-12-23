import { useState } from "react";
import {
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { iService } from "../../../Service/model";

interface FileServiceManagerProps {
  fileServices: iService[];
  setFileServices: React.Dispatch<React.SetStateAction<iService[]>>;
  createService: (service: iService) => Promise<Response>;
  softDeleteService: (id: string) => Promise<Response>;
  getServiceById: (id: string) => Promise<iService>;
}

export const FileServiceManager = ({
  fileServices,
  setFileServices,
  createService,
  softDeleteService,
  getServiceById,
}: FileServiceManagerProps) => {
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    nombre: "",
    provider: "",
    precioNeto: "",
    tarifa: "",
    currency: "USD",
    localizador: "",
    obs: "",
  });
  const [serviceError, setServiceError] = useState("");

  const openServiceDialog = () => {
    setServiceForm({
      nombre: "",
      provider: "",
      precioNeto: "",
      tarifa: "",
      currency: "USD",
      localizador: "",
      obs: "",
    });
    setServiceError("");
    setServiceDialogOpen(true);
  };

  const handleServiceFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setServiceForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveService = async () => {
    if (!serviceForm.nombre.trim()) {
      setServiceError("El nombre del servicio es obligatorio");
      return;
    }
    if (!serviceForm.provider.trim()) {
      setServiceError("El proveedor es obligatorio");
      return;
    }
    if (!serviceForm.precioNeto.trim()) {
      setServiceError("El precio neto es obligatorio");
      return;
    }
    if (!serviceForm.tarifa.trim()) {
      setServiceError("La tarifa es obligatoria");
      return;
    }

    try {
      const resp = await createService({
        id: "",
        nombre: serviceForm.nombre,
        provider: serviceForm.provider,
        precioNeto: serviceForm.precioNeto,
        tarifa: serviceForm.tarifa,
        currency: serviceForm.currency,
        localizador: serviceForm.localizador || "",
        obs: serviceForm.obs || "",
        createdAt: null,
        deleted_at: null,
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.id) {
          const createdService = await getServiceById(data.id);
          if (createdService) {
            setFileServices((prev) => [...prev, createdService]);
          }
        }
      }
      setServiceDialogOpen(false);
    } catch (e) {
      console.error("Error al crear servicio:", e);
      setServiceDialogOpen(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await softDeleteService(serviceId);
    } catch {
      // si no existe en backend, lo saco igual
    } finally {
      setFileServices((prev) => prev.filter((s) => s.id !== serviceId));
    }
  };

  return (
    <>
      <Typography sx={{ mb: 1, fontWeight: 500 }}>
        Servicios del file
      </Typography>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={openServiceDialog}
        sx={{ mb: 1, textTransform: "none" }}
      >
        Agregar servicio
      </Button>

      {fileServices.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay servicios agregados
        </Typography>
      ) : (
        <List dense sx={{ bgcolor: "rgba(255,255,255,.4)", mt: 1 }}>
          {fileServices.map((s) => (
            <ListItem
              key={s.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleDeleteService(s.id)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={s.nombre || "Sin nombre"}
                secondary={`${s.tarifa} ${s.currency}`}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Dialog */}
      <Dialog
        open={serviceDialogOpen}
        onClose={() => setServiceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nuevo servicio</DialogTitle>
        <DialogContent dividers>
          <TextField
            id="nombre"
            label="Nombre del servicio *"
            fullWidth
            sx={{ mb: 2 }}
            value={serviceForm.nombre}
            onChange={handleServiceFormChange}
            error={!!serviceError}
            helperText={serviceError}
          />
          <TextField
            id="provider"
            label="Proveedor *"
            fullWidth
            sx={{ mb: 2 }}
            value={serviceForm.provider}
            onChange={handleServiceFormChange}
          />
          <TextField
            id="precioNeto"
            label="Precio Neto *"
            fullWidth
            sx={{ mb: 2 }}
            value={serviceForm.precioNeto}
            onChange={handleServiceFormChange}
            required
          />
          <TextField
            id="tarifa"
            label="Tarifa *"
            fullWidth
            sx={{ mb: 2 }}
            value={serviceForm.tarifa}
            onChange={handleServiceFormChange}
            required
          />
          <TextField
            id="currency"
            label="Moneda *"
            select
            fullWidth
            sx={{ mb: 2 }}
            value={serviceForm.currency}
            onChange={handleServiceFormChange}
            required
          >
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="PESOS">PESOS</MenuItem>
            <MenuItem value="EURO">EURO</MenuItem>
          </TextField>
          <TextField
            id="localizador"
            label="Localizador (Opcional)"
            fullWidth
            sx={{ mb: 2 }}
            value={serviceForm.localizador}
            onChange={handleServiceFormChange}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            id="obs"
            label="Observaciones (Opcional)"
            multiline
            rows={3}
            fullWidth
            value={serviceForm.obs}
            onChange={handleServiceFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveService} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
