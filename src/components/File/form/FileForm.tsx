import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LoadingScreen } from "../../LoadingScreen";
import { useFileForm } from "../hooks/useFileForm";
import { FileFormHeader } from "./components/FileFormHeader";
import { FileTotals } from "../components/FileTotals";
import { formatFileNumber } from "../utils/fileNumber";
import { CURRENCIES } from "../utils/totals";
import { MayoristaField } from "../../Service/MayoristaField";
import { iService } from "../../Service/model";
import { createService, updateService } from "../../Service/handler";

export const FileForm = () => {
  const {
    id,
    paxs,
    formData,
    setFormData,
    selectedPaxIds,
    setSelectedPaxIds,
    fileServices,
    setFileServices,
    loading,
    notificationOpen,
    setNotificationOpen,
    errorNotificationOpen,
    setErrorNotificationOpen,
    handleSubmit,
    navigate,
    softDeleteService,
  } = useFileForm();

  // Dialog states
  const [openAddPax, setOpenAddPax] = useState(false);
  const [openEditService, setOpenEditService] = useState(false);
  const [selectedPaxMultiple, setSelectedPaxMultiple] = useState<string[]>([]);
  const [searchTermPax, setSearchTermPax] = useState("");
  const [editingService, setEditingService] = useState<iService | null>(null);
  const [serviceError, setServiceError] = useState(false);
  const [openFechaInicioPicker, setOpenFechaInicioPicker] = useState(false);
  const [openFechaFinPicker, setOpenFechaFinPicker] = useState(false);

  const handleAddPaxOpen = () => {
    setSelectedPaxMultiple([]);
    setSearchTermPax("");
    setOpenAddPax(true);
  };

  const handlePaxToggle = (paxId: string) => {
    setSelectedPaxMultiple(prev => 
      prev.includes(paxId)
        ? prev.filter(id => id !== paxId)
        : [...prev, paxId]
    );
  };

  const handleAddPaxConfirm = () => {
    const newPaxIds = selectedPaxMultiple.filter(id => !selectedPaxIds.includes(id));
    if (newPaxIds.length > 0) {
      setSelectedPaxIds([...selectedPaxIds, ...newPaxIds]);
    }
    setOpenAddPax(false);
    setSelectedPaxMultiple([]);
    setSearchTermPax("");
  };

  const handleRemovePax = (paxId: string) => {
    setSelectedPaxIds(selectedPaxIds.filter(id => id !== paxId));
  };

  const handleAddServiceOpen = () => {
    const newService: iService = {
      id: "",
      nombre: "",
      type: "AEREO",
      precioNeto: "",
      tarifa: "",
      currency: "USD",
      provider: "",
      obs: "",
      fechaInicio: null,
      fechaFin: null,
      createdAt: dayjs(),
      deleted_at: null,
    };
    setEditingService(newService);
    setServiceError(false);
    setOpenEditService(true);
  };

  const handleEditServiceOpen = (serviceId: string) => {
    const service = fileServices.find(s => s.id === serviceId);
    if (service) {
      setEditingService(service);
      setServiceError(false);
      setOpenEditService(true);
    }
  };

  const handleSaveService = async () => {
    if (editingService) {
      try {
        if (editingService.id && fileServices.find(s => s.id === editingService.id)) {
          // Editar servicio existente
          const updateResp = await updateService(editingService.id, editingService);
          if (!updateResp.ok) throw new Error("Error al actualizar servicio");
          
          setFileServices(fileServices.map(s => s.id === editingService.id ? editingService : s));
        } else {
          // Crear nuevo servicio - POST a /api/service/create
          const serviceToCreate = {
            ...editingService,
            id: undefined,
          };
          
          const createResp = await createService(serviceToCreate as any);
          if (!createResp.ok) throw new Error("Error al crear servicio");
          
          const newServiceData = await createResp.json();
          const newServiceId = newServiceData.data?.id || newServiceData.id;
          
          if (!newServiceId) throw new Error("No se recibió ID del servicio creado");
          
          const newService = { ...editingService, id: newServiceId };
          setFileServices([...fileServices, newService]);
        }
        
        setOpenEditService(false);
        setEditingService(null);
      } catch (error) {
        console.error("Error guardando servicio:", error);
        setServiceError(true);
      }
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setFileServices(fileServices.filter(s => s.id !== serviceId));
    // Al crear, el servicio ya existe pero todavía no tiene file: se elimina para que no quede suelto
    // (al editar, el backend lo elimina cuando se guarda el file)
    if (!id) softDeleteService(serviceId);
  };

  if (loading) return <LoadingScreen />;

  const getPaxName = (paxId: string) => {
    const pax = paxs.find(p => p.id === paxId);
    return pax ? `${pax.lastname} ${pax.firstname}` : "Desconocido";
  };

  const getServiceTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      AEREO: "✈️ Aéreo",
      HOTEL: "🏨 Hotel",
      TRASLADO: "🚗 Traslado",
      EXCURSION: "🎒 Excursión",
    };
    return labels[type] || type;
  };

  return (
    <Box
      sx={{
        px: { xs: 3, md: 10 },
        py: 4,
        background: "linear-gradient(135deg, #eaf3ff 0%, #dfeefe 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <FileFormHeader id={id} fileNumber={formatFileNumber(formData)} />

      {/* Detalles del File - Campos Editables Directos */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d47a1", mb: 2 }}>
            Detalles del File
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Referencia (Opcional)"
              value={formData.nro || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, nro: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Destino *"
              value={formData.destino || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Fecha de salida *"
              type="date"
              value={formData.fechaSalida ? (dayjs.isDayjs(formData.fechaSalida) ? formData.fechaSalida.format('YYYY-MM-DD') : dayjs(formData.fechaSalida).format('YYYY-MM-DD')) : ""}
              onChange={(e) => setFormData(prev => ({ ...prev, fechaSalida: dayjs(e.target.value) }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {/* Tarifa alternativa: lo que se le cobra al pasajero, en una sola moneda */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                select
                label="Moneda"
                value={formData.tarifaAlternativaMoneda || "USD"}
                onChange={(e) => setFormData(prev => ({ ...prev, tarifaAlternativaMoneda: e.target.value }))}
                sx={{ width: 140 }}
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Tarifa Alternativa (Opcional)"
                helperText="Lo que le cobramos al pasajero. Si queda vacía, se cobra la tarifa sumada de los servicios."
                type="number"
                value={formData.tarifaAlternativa || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, tarifaAlternativa: e.target.value }))}
                fullWidth
              />
            </Box>
            <TextField
              label="Observaciones (Opcional)"
              value={formData.obs || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, obs: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Pasajeros */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d47a1" }}>
              Pasajeros
            </Typography>
            <Button 
              size="small" 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddPaxOpen}
            >
              Agregar Pasajero
            </Button>
          </Box>
          {selectedPaxIds.length === 0 ? (
            <Typography color="text.secondary">No hay pasajeros agregados</Typography>
          ) : (
            <Table>
              <TableBody>
                {selectedPaxIds.map(paxId => (
                  <TableRow key={paxId}>
                    <TableCell sx={{ flex: 1 }}>{getPaxName(paxId)}</TableCell>
                    <TableCell align="right" sx={{ width: 60 }}>
                      <Tooltip title="Eliminar pasajero">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemovePax(paxId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Servicios */}
      <Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d47a1" }}>
              Servicios
            </Typography>
            <Button 
              size="small" 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleAddServiceOpen}
            >
              Agregar Servicio
            </Button>
          </Box>
          {fileServices.length === 0 ? (
            <Typography color="text.secondary">No hay servicios agregados</Typography>
          ) : (
            fileServices.map(service => (
              <Box
                key={service.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  mb: 1,
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {getServiceTypeLabel(service.type)} - {service.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Precio: ${service.precioNeto} | Tarifa: ${service.tarifa} {service.currency}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Tooltip title="Editar servicio">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditServiceOpen(service.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar servicio">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Totales por moneda */}
      <FileTotals
        services={fileServices}
        tarifaAlternativa={formData.tarifaAlternativa}
        tarifaAlternativaMoneda={formData.tarifaAlternativaMoneda || "USD"}
      />

      <Divider sx={{ mb: 3 }} />


      {/* Botones de acción */}
      <Box display="flex" justifyContent="center" gap={2} sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          onClick={() => navigate(id ? `/files/profile/${id}` : "/files")}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            background: "linear-gradient(135deg, #007bff 0%, #6f42c1 100%)",
          }}
          onClick={handleSubmit}
        >
          {id ? "Guardar Cambios" : "Crear File"}
        </Button>
      </Box>

      {/* Dialog Agregar Pasajeros - Multi-select */}
      <Dialog open={openAddPax} onClose={() => setOpenAddPax(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Pasajeros</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Buscar pasajero..."
            placeholder="Nombre, DNI o Email"
            value={searchTermPax}
            onChange={(e) => setSearchTermPax(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List sx={{ border: "1px solid #ddd", borderRadius: 1, maxHeight: 400, overflow: "auto" }}>
            {paxs
              .filter(p => !selectedPaxIds.includes(p.id))
              .filter(p => {
                const searchLower = searchTermPax.toLowerCase();
                return (
                  p.lastname.toLowerCase().includes(searchLower) ||
                  p.firstname.toLowerCase().includes(searchLower) ||
                  (p.dni && p.dni.toLowerCase().includes(searchLower)) ||
                  (p.email && p.email.toLowerCase().includes(searchLower))
                );
              })
              .map(pax => (
                <ListItem key={pax.id} sx={{ py: 0.5, px: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPaxMultiple.includes(pax.id)}
                        onChange={() => handlePaxToggle(pax.id)}
                      />
                    }
                    label={`${pax.lastname} ${pax.firstname} (${pax.dni || "S/D"})`}
                    sx={{ width: "100%", m: 0 }}
                  />
                </ListItem>
              ))}
            {paxs.filter(p => !selectedPaxIds.includes(p.id)).length === 0 && (
              <ListItem sx={{ justifyContent: "center", color: "text.secondary" }}>
                No hay pasajeros disponibles
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddPax(false); setSelectedPaxMultiple([]); setSearchTermPax(""); }}>Cancelar</Button>
          <Button 
            onClick={handleAddPaxConfirm} 
            variant="contained"
            disabled={selectedPaxMultiple.length === 0}
          >
            Agregar {selectedPaxMultiple.length > 0 && `(${selectedPaxMultiple.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Editar/Agregar Servicio */}
      <Dialog open={openEditService} onClose={() => setOpenEditService(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingService?.id && fileServices.find(s => s.id === editingService.id) ? "Editar Servicio" : "Agregar Servicio"}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {serviceError && (
            <Alert severity="error">
              No se pudo guardar el servicio. Revisá los datos e intentá de nuevo.
            </Alert>
          )}
          <FormControl fullWidth>
            <InputLabel>Tipo de Servicio</InputLabel>
            <Select
              label="Tipo de Servicio"
              value={editingService?.type || "AEREO"}
              onChange={(e) => setEditingService(prev => prev ? { ...prev, type: e.target.value as any } : null)}
            >
              <MenuItem value="AEREO">✈️ Aéreo</MenuItem>
              <MenuItem value="HOTEL">🏨 Hotel</MenuItem>
              <MenuItem value="TRASLADO">🚗 Traslado</MenuItem>
              <MenuItem value="EXCURSION">🎒 Excursión</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Nombre del Servicio"
            value={editingService?.nombre || ""}
            onChange={(e) => setEditingService(prev => prev ? { ...prev, nombre: e.target.value } : null)}
            fullWidth
          />
          <MayoristaField
            value={editingService?.provider || ""}
            onChange={(provider) => setEditingService(prev => prev ? { ...prev, provider } : null)}
          />
          <TextField
            label="Precio Neto"
            type="number"
            value={editingService?.precioNeto || ""}
            onChange={(e) => setEditingService(prev => prev ? { ...prev, precioNeto: e.target.value } : null)}
            fullWidth
          />
          <TextField
            label="Tarifa"
            type="number"
            value={editingService?.tarifa || ""}
            onChange={(e) => setEditingService(prev => prev ? { ...prev, tarifa: e.target.value } : null)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Moneda</InputLabel>
            <Select
              label="Moneda"
              value={editingService?.currency || "USD"}
              onChange={(e) => setEditingService(prev => prev ? { ...prev, currency: e.target.value } : null)}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="PESOS">PESOS</MenuItem>
              <MenuItem value="EURO">EURO</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                  Fecha Inicio
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editingService?.fechaInicio ? (dayjs.isDayjs(editingService.fechaInicio) ? editingService.fechaInicio.format('DD/MM/YYYY') : dayjs(editingService.fechaInicio).format('DD/MM/YYYY')) : ''}
                  onClick={() => setOpenFechaInicioPicker(true)}
                  placeholder="Selecciona fecha inicio"
                  inputProps={{ readOnly: true }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                  Fecha Fin
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editingService?.fechaFin ? (dayjs.isDayjs(editingService.fechaFin) ? editingService.fechaFin.format('DD/MM/YYYY') : dayjs(editingService.fechaFin).format('DD/MM/YYYY')) : ''}
                  onClick={() => editingService?.fechaInicio && setOpenFechaFinPicker(true)}
                  placeholder="Selecciona fecha fin"
                  inputProps={{ readOnly: true }}
                  disabled={!editingService?.fechaInicio}
                  sx={{ 
                    "& .MuiInputBase-input.Mui-disabled": { 
                      color: "rgba(0, 0, 0, 0.38)"
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
          <TextField
            label="Observaciones"
            value={editingService?.obs || ""}
            onChange={(e) => setEditingService(prev => prev ? { ...prev, obs: e.target.value } : null)}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditService(false)}>Cancelar</Button>
          <Button onClick={handleSaveService} variant="contained" disabled={!editingService?.provider?.trim()}>
            {editingService?.id && fileServices.find(s => s.id === editingService.id) ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para seleccionar Fecha Inicio */}
      <Dialog open={openFechaInicioPicker} onClose={() => setOpenFechaInicioPicker(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 2, px: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={editingService?.fechaInicio || null}
              onChange={(newDate: any) => {
                setEditingService(prev => prev ? { ...prev, fechaInicio: newDate } : null);
                setOpenFechaInicioPicker(false);
                // Auto-abrir picker de fecha fin después de seleccionar inicio
                setTimeout(() => setOpenFechaFinPicker(true), 300);
              }}
              views={["year", "month", "day"]}
              slotProps={{
                toolbar: { hidden: true }
              }}
            />
          </LocalizationProvider>
        </DialogContent>
      </Dialog>

      {/* Dialog para seleccionar Fecha Fin */}
      <Dialog open={openFechaFinPicker} onClose={() => setOpenFechaFinPicker(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 2, px: 1, position: "relative" }}>
          {editingService?.fechaInicio && (
            <Box sx={{ position: "absolute", top: 8, right: 16, textAlign: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: "block", color: "#1976d2" }}>
                Inicio: {dayjs.isDayjs(editingService.fechaInicio) ? editingService.fechaInicio.format('DD/MM') : dayjs(editingService.fechaInicio).format('DD/MM')}
              </Typography>
            </Box>
          )}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={editingService?.fechaFin || null}
              onChange={(newDate: any) => {
                setEditingService(prev => prev ? { ...prev, fechaFin: newDate } : null);
                setOpenFechaFinPicker(false);
              }}
              views={["year", "month", "day"]}
              minDate={editingService?.fechaInicio || undefined}
              slotProps={{
                toolbar: { hidden: true }
              }}
              sx={{
                "& .MuiPickersDay-root": {
                  "&.MuiPickersDay-today": {
                    backgroundColor: editingService?.fechaInicio && dayjs(editingService.fechaInicio).isSame(dayjs(), 'day') ? "#bbdefb" : "rgba(0, 0, 0, 0.12)"
                  }
                }
              }}
            />
          </LocalizationProvider>
        </DialogContent>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setNotificationOpen(false)}>
          {id ? "File actualizado correctamente" : "File creado correctamente"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorNotificationOpen}
        autoHideDuration={4000}
        onClose={() => setErrorNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorNotificationOpen(false)}>
          Debes completar todos los campos requeridos (*)
        </Alert>
      </Snackbar>
    </Box>
  );
};
