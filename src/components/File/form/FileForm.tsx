import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useNavigate, useParams } from "react-router-dom";

import { iFile } from "../model";
import { iPax } from "../../Pax/model";
import { iService } from "../../Service/model";
import { getPax } from "../../Pax/handler";
import { getService } from "../../Service/handler";
import { getFileById, createFile, updateFile } from "../handler";
import { LoadingScreen } from "../../LoadingScreen";
import { Autocomplete, IOptions } from "../../common/Autocomplete/Autocomplete";

const initialState: iFile = {
  id: "",
  precioNetoTotal: "0",
  tarifaTotal: "0",
  destino: "",
  fechaSalida: null,
  clients: [],
  services: [],
  obs: "",
};

export const FileForm = () => {
  const [paxs, setPaxs] = useState<iPax[]>([]);
  const [services, setServices] = useState<iService[]>([]);
  const [selectedPaxIds, setSelectedPaxIds] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<IOptions[]>([]);
  const [formData, setFormData] = useState<iFile>(initialState);

  const [loading, setLoading] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);

  const [paxDialogOpen, setPaxDialogOpen] = useState(false);
  const [paxSearch, setPaxSearch] = useState("");

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    const promises = [getPax(), getService()];
    if (id) promises.push(getFileById(id));

    Promise.allSettled(promises)
      .then((res) => {
        let paxData: iPax[] = [];
        let serviceData: iService[] = [];
        let fileData: iFile | undefined;

        res.forEach((r) => {
          if (r.status === "fulfilled") {
            // array -> paxs o services
            if (Array.isArray(r.value)) {
              if (r.value.length && "provider" in r.value[0]) {
                serviceData = r.value as iService[];
              } else {
                paxData = r.value as iPax[];
              }
            } else {
              fileData = r.value as iFile;
            }
          }
        });

        setPaxs(
          paxData.sort((a, b) =>
            `${a.lastname} ${a.firstname}`.localeCompare(
              `${b.lastname} ${b.firstname}`
            )
          )
        );

        setServices(
          serviceData.sort((a, b) =>
            a.createdAt && b.createdAt
              ? dayjs(a.createdAt).isBefore(b.createdAt)
                ? 1
                : -1
              : 0
          )
        );

        if (fileData) {
          fileData.fechaSalida = dayjs(fileData.fechaSalida);
          setFormData(fileData);
          // pasajeros seleccionados desde el file
          setSelectedPaxIds(fileData.clients.map((c) => c.id));
          // servicios seleccionados desde el file
          setSelectedService(
            fileData.services.map((s) => ({
              id: s.id,
              title: `${s.provider} ${s.tarifa} ${s.currency}`,
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingScreen />;

  // opciones de servicios para el autocomplete
  const optionsService = services.map((s) => ({
    id: s.id,
    title: `${s.provider} | ${s.tarifa}`,
  }));

  // -------- handlers --------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    const req = ["destino", "fechaSalida"];
    return req.every((f) => formData[f as keyof iFile]);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setErrorNotificationOpen(true);
      return;
    }

    const servicesId = selectedService.map((s) => s.id);

    const ok = id
      ? (await updateFile(id, formData, selectedPaxIds, servicesId)).ok
      : (await createFile(formData, selectedPaxIds, servicesId)).ok;

    if (ok) {
      setNotificationOpen(true);
      setTimeout(() => {
        navigate(id ? `/files/profile/${id}` : "/files");
      }, 1200);
    } else {
      setErrorNotificationOpen(true);
    }
  };

  // -------- dialog pax --------
  const filteredPaxs = paxs.filter((p) => {
    if (!paxSearch.trim()) return true;
    const q = paxSearch.toLowerCase();
    return (
      p.firstname.toLowerCase().includes(q) ||
      p.lastname.toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  });

  const togglePax = (paxId: string) => {
    setSelectedPaxIds((prev) =>
      prev.includes(paxId)
        ? prev.filter((id) => id !== paxId)
        : [...prev, paxId]
    );
  };

  const removeChip = (paxId: string) => {
    setSelectedPaxIds((prev) => prev.filter((id) => id !== paxId));
  };

  const getPaxById = (id: string) => paxs.find((p) => p.id === id);

  // ---------------- UI ----------------
  return (
    <Box
      sx={{
        px: { xs: 3, md: 10 },
        py: 4,
        background: "linear-gradient(135deg, #eaf3ff 0%, #dfeefe 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 3, color: "#0d47a1", textAlign: "center" }}
      >
        {id ? "Editar File" : "Crear File"}
      </Typography>

      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* IZQUIERDA */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#0d47a1", fontWeight: 600 }}
              >
                Datos del File
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  id="destino"
                  label="Destino *"
                  value={formData.destino}
                  onChange={handleChange}
                  required
                />
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DatePicker
                    label="Fecha de Salida"
                    value={formData.fechaSalida}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, fechaSalida: value }))
                    }
                  />
                </LocalizationProvider>
                <TextField
                  id="precioNetoTotal"
                  label="Precio Neto Total"
                  value={formData.precioNetoTotal}
                  disabled
                />
                <TextField
                  id="tarifaTotal"
                  label="Tarifa Total"
                  value={formData.tarifaTotal}
                  disabled
                />
                <TextField
                  id="obs"
                  label="Observaciones"
                  multiline
                  rows={5}
                  value={formData.obs}
                  onChange={handleChange}
                />
              </Box>
            </Grid>

            {/* DERECHA */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#0d47a1", fontWeight: 600 }}
              >
                Relaciones
              </Typography>

              {/* botón para abrir modal de pax */}
              <Button
                variant="outlined"
                onClick={() => setPaxDialogOpen(true)}
                sx={{ mb: 1, textTransform: "none", fontWeight: 500 }}
              >
                Seleccionar pasajeros
              </Button>

              {/* chips seleccionados */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                {selectedPaxIds.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay pasajeros seleccionados
                  </Typography>
                ) : (
                  selectedPaxIds.map((paxId) => {
                    const pax = getPaxById(paxId);
                    return (
                      <Chip
                        key={paxId}
                        label={pax ? `${pax.lastname} ${pax.firstname}` : paxId}
                        onDelete={() => removeChip(paxId)}
                      />
                    );
                  })
                )}
              </Box>

              {/* servicios como antes */}
              <Autocomplete
                initialValues={selectedService}
                options={optionsService}
                label="Agregar Servicios"
                updateSelection={setSelectedService}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      {/* BOTONES */}
      <Box display="flex" justifyContent="center" gap={2}>
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
          {id ? "Actualizar File" : "Crear File"}
        </Button>
      </Box>

      {/* SNACKBARS */}
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

      {/* DIALOG PARA ELEGIR PAX */}
      <Dialog
        open={paxDialogOpen}
        onClose={() => setPaxDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Seleccionar pasajeros</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            placeholder="Buscar pasajero..."
            value={paxSearch}
            onChange={(e) => setPaxSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <List
            sx={{
              maxHeight: 350,
              overflowY: "auto",
            }}
          >
            {filteredPaxs.map((p) => {
              const checked = selectedPaxIds.includes(p.id);
              return (
                <ListItemButton
                  key={p.id}
                  onClick={() => togglePax(p.id)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox edge="start" checked={checked} tabIndex={-1} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${p.lastname} ${p.firstname}`}
                    secondary={p.email || ""}
                  />
                </ListItemButton>
              );
            })}
            {filteredPaxs.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No se encontraron pasajeros
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaxDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
