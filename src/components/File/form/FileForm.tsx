import { useState } from "react";
import { Alert, Avatar, Box, Button, Grid, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GroupIcon from "@mui/icons-material/Group";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import HikingIcon from "@mui/icons-material/Hiking";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import { useFileForm } from "../hooks/useFileForm";
import { FileTotals } from "../components/FileTotals";
import { AddPaxDialog } from "../components/AddPaxDialog";
import { ServiceDialog } from "../components/ServiceDialog";
import { FormSection } from "../../common/FormSection";
import { FormActions, FormHeader, FormPage } from "../../common/FormLayout";
import { iService, newService } from "../../Service/model";
import { formatMoney } from "../utils/totals";
import { initials } from "../utils/formatters";

const TYPE_ICONS: Record<string, JSX.Element> = {
  AEREO: <FlightIcon />,
  HOTEL: <HotelIcon />,
  EXCURSION: <HikingIcon />,
  TRASLADO: <AirportShuttleIcon />,
};

const addButtonSx = { textTransform: "none", fontSize: "1rem", fontWeight: 600, borderRadius: 2 };

const lineSx = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  py: 1.25,
  borderBottom: "1px solid #eef2f4",
  "&:last-of-type": { borderBottom: "none" },
};

const formatDates = (service: iService) => {
  const start = service.fechaInicio ? dayjs(service.fechaInicio).format("DD/MM/YYYY") : null;
  const end = service.fechaFin ? dayjs(service.fechaFin).format("DD/MM/YYYY") : null;
  return start && end && start !== end ? `${start} al ${end}` : start || end || "";
};

const amount = (value: string, currency: string) => (value !== "" && !isNaN(Number(value)) ? formatMoney(Number(value), currency) : "—");

/**
 * Pantalla "Crear un file"
 */
export const FileForm = () => {
  const {
    formData,
    setField,
    errors,
    saving,
    saveError,
    setSaveError,
    addPaxs,
    removePax,
    saveFileService,
    updateFileService,
    removeService,
    handleSubmit,
    goBack,
  } = useFileForm();
  const [openAddPax, setOpenAddPax] = useState(false);
  const [editingService, setEditingService] = useState<iService | null>(null);

  // Ya guardado (con sus fotos): se actualiza en la lista
  const handleServiceSaved = (service: iService, close = true) => {
    updateFileService(service);
    if (close) setEditingService(null);
  };

  return (
    <FormPage>
      <FormHeader
        title="Crear un file"
        description="Cargá el viaje, quiénes viajan y los servicios. El número de file se pone solo al guardar."
        onBack={goBack}
      />

      {saveError && (
        <Alert severity="error" onClose={() => setSaveError(false)} sx={{ borderRadius: 3, fontSize: "1rem" }}>
          No se pudo crear el file. Intentá de nuevo.
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <FormSection title="El viaje" icon={<FlightTakeoffIcon />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Destino *"
                autoFocus
                fullWidth
                placeholder="Ej. Madrid y Roma"
                value={formData.destino}
                onChange={(e) => setField("destino", e.target.value)}
                error={!!errors.destino}
                helperText={errors.destino}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha de salida *"
                format="DD/MM/YYYY"
                value={formData.fechaSalida ? dayjs(formData.fechaSalida) : null}
                onChange={(value) => setField("fechaSalida", value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.fechaSalida,
                    helperText: errors.fechaSalida ?? "Con esta fecha se calculan los avisos de pagos y documentos",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Referencia"
                fullWidth
                value={formData.nro ?? ""}
                onChange={(e) => setField("nro", e.target.value)}
                helperText="Opcional: un código propio, por ejemplo el de la reserva"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                fullWidth
                multiline
                rows={2}
                value={formData.obs}
                onChange={(e) => setField("obs", e.target.value)}
              />
            </Grid>
          </Grid>
        </FormSection>
      </LocalizationProvider>

      <FormSection
        title="Pasajeros"
        icon={<GroupIcon />}
        description="Quiénes viajan. Si alguno no está cargado, lo podés cargar desde acá."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddPax(true)} sx={addButtonSx}>
            Agregar pasajeros
          </Button>
        }
      >
        {formData.clients.length === 0 ? (
          <Typography color="text.secondary">Todavía no agregaste pasajeros.</Typography>
        ) : (
          formData.clients.map((pax) => (
            <Box key={pax.id} sx={lineSx}>
              <Avatar sx={{ bgcolor: "#0D5B75", width: 36, height: 36, fontSize: 15 }}>{initials(pax.lastname, pax.firstname)}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {pax.firstname} {pax.lastname}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pax.dni ? `DNI ${pax.dni}` : "Sin DNI cargado"}
                </Typography>
              </Box>
              <Tooltip title="Sacar del file">
                <IconButton color="error" onClick={() => removePax(pax.id)} aria-label="Sacar del file">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ))
        )}
      </FormSection>

      <FormSection
        title="Servicios"
        icon={<ListAltIcon />}
        description="Aéreos, hoteles, excursiones y traslados. También los podés agregar después."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditingService(newService())} sx={addButtonSx}>
            Agregar servicio
          </Button>
        }
      >
        {formData.services.length === 0 ? (
          <Typography color="text.secondary">Todavía no agregaste servicios.</Typography>
        ) : (
          formData.services.map((service) => (
            <Box key={service.id} sx={lineSx}>
              <Box sx={{ color: "#0D5B75", display: "flex" }}>{TYPE_ICONS[service.type]}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{service.nombre || "Sin descripción"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {[service.provider, formatDates(service)].filter(Boolean).join(" · ")}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <Typography sx={{ fontWeight: 600 }}>{amount(service.tarifa, service.currency)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Costo {amount(service.precioNeto, service.currency)}
                </Typography>
              </Box>
              <Tooltip title="Editar">
                <IconButton onClick={() => setEditingService(service)} aria-label="Editar servicio">
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton color="error" onClick={() => removeService(service.id)} aria-label="Eliminar servicio">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ))
        )}
      </FormSection>

      {formData.services.length > 0 && (
        <FileTotals
          services={formData.services}
          tarifaAlternativa={formData.tarifaAlternativa}
          tarifaAlternativaMoneda={formData.tarifaAlternativaMoneda}
          onSaveAlternative={(value, currency) => {
            setField("tarifaAlternativa", value);
            setField("tarifaAlternativaMoneda", value ? currency : null);
            return Promise.resolve(true);
          }}
        />
      )}

      <FormActions
        saveLabel="Crear file"
        saving={saving}
        onCancel={goBack}
        onSave={handleSubmit}
        note="Solo el destino y la fecha de salida son obligatorios."
      />

      <AddPaxDialog
        open={openAddPax}
        excludeIds={formData.clients.map((c) => c.id)}
        onClose={() => setOpenAddPax(false)}
        onAdd={addPaxs}
      />
      <ServiceDialog
        service={editingService}
        fechaSalida={formData.fechaSalida}
        onClose={() => setEditingService(null)}
        onSave={saveFileService}
        onSaved={handleServiceSaved}
      />
    </FormPage>
  );
};
