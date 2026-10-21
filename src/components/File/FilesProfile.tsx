import { useState } from "react";
import { useFileProfile } from "./hooks/useFileProfile";
import { LoadingScreen } from "../LoadingScreen";
import { Box, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert, MenuItem, Select, FormControl, InputLabel, List, ListItem, FormControlLabel, Checkbox } from "@mui/material";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { iService } from "../Service/model";
import { FileProfileHeader } from "./profile/components/FileProfileHeader";
import { FileProfileClients } from "./profile/components/FileProfileClients";
import { FileProfileServices } from "./profile/components/FileProfileServices";
import { FileTotals } from "./components/FileTotals";
import { updateFile, filePdfsUrl, toFileFormData } from "./handler";
import { PdfDocuments } from "../common/PdfDocuments/PdfDocuments";
import { getPax } from "../Pax/handler";
import { createService, updateService } from "../Service/handler";
import { iPax } from "../Pax/model";
import { iFile } from "./model";

export const FilesProfile = (): JSX.Element => {
  const { file, loading, id, setFile } = useFileProfile();
  const [openAddPax, setOpenAddPax] = useState(false);
  const [openEditService, setOpenEditService] = useState(false);
  const [allPax, setAllPax] = useState<iPax[]>([]);
  const [selectedPaxMultiple, setSelectedPaxMultiple] = useState<string[]>([]);
  const [searchTermPax, setSearchTermPax] = useState("");
  const [editingService, setEditingService] = useState<iService | null>(null);
  const [serviceError, setServiceError] = useState(false);
  const [openFechaInicioPicker, setOpenFechaInicioPicker] = useState(false);
  const [openFechaFinPicker, setOpenFechaFinPicker] = useState(false);

  const handleAddPaxOpen = async () => {
    const paxList = await getPax();
    setAllPax(paxList);
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

  const handleAddPax = async () => {
    if (selectedPaxMultiple.length === 0 || !file || !id) return;
    
    const newPaxs = selectedPaxMultiple
      .map(paxId => allPax.find(p => p.id === paxId))
      .filter((p): p is iPax => p !== undefined);
    
    const updatedFile = {
      ...file,
      clients: [...file.clients, ...newPaxs]
    };
    
    const fileToSend = toFileFormData(updatedFile);
    
    try {
      const resp = await updateFile(
        id, 
        fileToSend, 
        updatedFile.clients.map(c => c.id),
        file.services.map(s => s.id)
      );
      
      if (resp.ok) {
        setFile(updatedFile);
        setOpenAddPax(false);
        setSelectedPaxMultiple([]);
        setSearchTermPax("");
      }
    } catch (error) {
      console.error("Error agregando pasajeros:", error);
    }
  };

  const handleRemovePax = async (paxId: string) => {
    if (!file || !id) return;
    
    const updatedFile = {
      ...file,
      clients: file.clients.filter(c => c.id !== paxId)
    };
    
    const fileToSend = toFileFormData(updatedFile);
    
    try {
      const resp = await updateFile(
        id,
        fileToSend,
        updatedFile.clients.map(c => c.id),
        file.services.map(s => s.id)
      );
      
      if (resp.ok) {
        setFile(updatedFile);
      }
    } catch (error) {
      console.error("Error removiendo pasajero:", error);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!file || !id) return;
    
    const updatedFile = {
      ...file,
      services: file.services.filter(s => s.id !== serviceId)
    };
    
    const fileToSend = toFileFormData(updatedFile);
    
    try {
      const resp = await updateFile(
        id,
        fileToSend,
        file.clients.map(c => c.id),
        updatedFile.services.map(s => s.id)
      );
      
      if (resp.ok) {
        setFile(updatedFile);
      }
    } catch (error) {
      console.error("Error removiendo servicio:", error);
    }
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
    if (!file) return;
    const service = file.services.find(s => s.id === serviceId);
    if (service) {
      setEditingService(service);
      setServiceError(false);
      setOpenEditService(true);
    }
  };

  const handleEditServiceClose = () => {
    setOpenEditService(false);
    setEditingService(null);
  };

  const handleSaveService = async () => {
    if (!editingService || !file || !id) return;
    
    let updatedFile;
    
    try {
      if (editingService.id && file.services.find(s => s.id === editingService.id)) {
        // Editar servicio existente - actualizar en BD
        const updateResp = await updateService(editingService.id, editingService);
        if (!updateResp.ok) throw new Error("Error al actualizar servicio");
        
        updatedFile = {
          ...file,
          services: file.services.map(s => s.id === editingService.id ? editingService : s)
        };
      } else {
        // Crear nuevo servicio - primero POST a /api/service/create
        const serviceToCreate = {
          ...editingService,
          id: undefined, // No enviar ID para nuevo servicio
        };
        
        const createResp = await createService(serviceToCreate as any);
        if (!createResp.ok) throw new Error("Error al crear servicio");
        
        const newServiceData = await createResp.json();
        const newServiceId = newServiceData.data?.id || newServiceData.id;
        
        if (!newServiceId) throw new Error("No se recibió ID del servicio creado");
        
        const newService = { ...editingService, id: newServiceId };
        
        updatedFile = {
          ...file,
          services: [...file.services, newService]
        };
      }
      
      const fileToSend = toFileFormData(updatedFile);
      
      const resp = await updateFile(
        id,
        fileToSend,
        file.clients.map(c => c.id),
        updatedFile.services.map(s => s.id)
      );
      
      if (resp.ok) {
        setFile(updatedFile);
        handleEditServiceClose();
      } else {
        throw new Error("Error al actualizar file");
      }
    } catch (error) {
      console.error("Error guardando servicio:", error);
      setServiceError(true);
    }
  };

  // Devuelve true si se guardó
  const handleEditFileSave = async (editedFileData: iFile) => {
    if (!editedFileData || !id || !file) return false;

    const fileToSend = toFileFormData(editedFileData);
    
    try {
      const resp = await updateFile(
        id,
        fileToSend,
        file.clients.map(c => c.id),
        file.services.map(s => s.id)
      );
      
      if (resp.ok) {
        setFile(editedFileData);
      }
      return resp.ok;
    } catch (error) {
      console.error("Error editando file:", error);
      return false;
    }
  };

  // Tarifa alternativa (lo que se le cobra al pasajero); vacía = se quita
  const handleSaveAlternative = (amount: string, currency: string) => {
    if (!file) return Promise.resolve(false);
    return handleEditFileSave({
      ...file,
      tarifaAlternativa: amount,
      tarifaAlternativaMoneda: amount ? currency : null,
    });
  };

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
      <FileProfileHeader file={file} onSave={handleEditFileSave} />
      <FileProfileClients 
        clients={file.clients} 
        fileId={file.id}
        onAddClient={handleAddPaxOpen}
        onRemoveClient={handleRemovePax}
      />
      <FileProfileServices 
        services={file.services}
        onAddService={handleAddServiceOpen}
        onEditService={handleEditServiceOpen}
        onRemoveService={handleRemoveService}
      />
      <FileTotals
        services={file.services}
        tarifaAlternativa={file.tarifaAlternativa}
        tarifaAlternativaMoneda={file.tarifaAlternativaMoneda}
        onSaveAlternative={handleSaveAlternative}
      />
      <Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <PdfDocuments baseUrl={filePdfsUrl(file.id)} titleColor="#0d47a1" />
        </CardContent>
      </Card>

      {/* Dialog para agregar pasajeros - Multi-select */}
      <Dialog open={openAddPax} onClose={() => { setOpenAddPax(false); setSelectedPaxMultiple([]); setSearchTermPax(""); }} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Pasajeros</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Selecciona uno o más pasajeros de la base de datos
          </Alert>
          <TextField
            fullWidth
            label="Buscar pasajero..."
            placeholder="Nombre, DNI o Email"
            value={searchTermPax}
            onChange={(e) => setSearchTermPax(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List sx={{ border: "1px solid #ddd", borderRadius: 1, maxHeight: 400, overflow: "auto" }}>
            {allPax
              .filter(p => !file?.clients.find(c => c.id === p.id))
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
            {allPax.filter(p => !file?.clients.find(c => c.id === p.id)).length === 0 && (
              <ListItem sx={{ justifyContent: "center", color: "text.secondary" }}>
                No hay pasajeros disponibles
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddPax(false); setSelectedPaxMultiple([]); setSearchTermPax(""); }}>Cancelar</Button>
          <Button 
            onClick={handleAddPax} 
            variant="contained"
            disabled={selectedPaxMultiple.length === 0}
          >
            Agregar {selectedPaxMultiple.length > 0 && `(${selectedPaxMultiple.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar/agregar servicio */}
      <Dialog open={openEditService} onClose={handleEditServiceClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingService?.id ? "Editar Servicio" : "Agregar Servicio"}</DialogTitle>
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
          <Button onClick={handleEditServiceClose}>Cancelar</Button>
          <Button 
            onClick={handleSaveService} 
            variant="contained"
          >
            {editingService?.id ? "Actualizar" : "Agregar"}
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
    </Box>
  );
};
