import { Fragment, useState } from "react";
import { Box, Typography, Card, CardContent, Button, Tooltip, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { iService } from "../../../Service/model";
import { formatMoney } from "../../utils/totals";
import dayjs from "dayjs";

interface FileProfileServicesProps {
  services: iService[];
  onAddService?: () => void;
  onEditService?: (serviceId: string) => void;
  onRemoveService?: (serviceId: string) => void;
}

// Orden en que se muestran los grupos de servicios
const SERVICE_GROUPS = [
  { type: "AEREO", label: "✈️ Aéreos" },
  { type: "HOTEL", label: "🏨 Hotelería" },
  { type: "EXCURSION", label: "🎒 Excursiones" },
  { type: "TRASLADO", label: "🚗 Traslados" },
];

const getServiceTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    AEREO: "✈️ Aéreo",
    HOTEL: "🏨 Hotel",
    TRASLADO: "🚗 Traslado",
    EXCURSION: "🎒 Excursión",
  };
  return labels[type] || type;
};

const formatAmount = (amount: string, currency: string) =>
  amount && !isNaN(Number(amount)) ? formatMoney(Number(amount), currency) : "—";

const formatDates = (service: iService) => {
  const start = service.fechaInicio ? dayjs(service.fechaInicio).format("DD/MM/YYYY") : null;
  const end = service.fechaFin ? dayjs(service.fechaFin).format("DD/MM/YYYY") : null;
  if (start && end && start !== end) return `${start} → ${end}`;
  return start || end || "—";
};

const COLUMNS = 5;

export const FileProfileServices = ({
  services,
  onAddService,
  onEditService,
  onRemoveService,
}: FileProfileServicesProps) => {
  const [selectedService, setSelectedService] = useState<iService | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  // Ordenar por fecha de inicio (sin fecha van al final); si empatan, por fecha de fin y nombre
  const timeOf = (date: iService["fechaInicio"]) =>
    date ? dayjs(date).valueOf() : Number.MAX_SAFE_INTEGER;
  const sortedServices = [...services].sort(
    (a, b) =>
      timeOf(a.fechaInicio) - timeOf(b.fechaInicio) ||
      timeOf(a.fechaFin) - timeOf(b.fechaFin) ||
      (a.nombre || "").localeCompare(b.nombre || "")
  );

  const groups = SERVICE_GROUPS.map((group) => ({
    ...group,
    services: sortedServices.filter((s) => s.type === group.type),
  })).filter((group) => group.services.length > 0);

  const handleRowClick = (service: iService) => {
    setSelectedService(service);
    setOpenDetail(true);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#0d47a1" }}
        >
          Servicios
        </Typography>
        {onAddService && (
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddService}
          >
            Agregar Servicio
          </Button>
        )}
      </Box>
      <Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {groups.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">
                No hay servicios asociados.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(13, 71, 161, 0.05)" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1" }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1" }}>Fechas</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1" }} align="right">Precio Neto</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1" }} align="right">Tarifa</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1", textAlign: "center" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <Fragment key={group.type}>
                    {/* Título del grupo */}
                    <TableRow>
                      <TableCell
                        colSpan={COLUMNS}
                        sx={{
                          fontWeight: 700,
                          color: "#0d47a1",
                          backgroundColor: "rgba(13, 71, 161, 0.08)",
                          py: 1,
                        }}
                      >
                        {group.label} ({group.services.length})
                      </TableCell>
                    </TableRow>

                    {group.services.map((service) => (
                      <TableRow
                        key={service.id}
                        sx={{
                          cursor: "pointer",
                          transition: "background 0.15s",
                          "&:hover": {
                            backgroundColor: "rgba(13, 71, 161, 0.04)",
                          },
                        }}
                        onClick={() => handleRowClick(service)}
                      >
                        <TableCell sx={{ fontWeight: 600, pl: 4 }}>
                          {service.nombre || "—"}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatDates(service)}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                          {formatAmount(service.precioNeto, service.currency)}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                          {formatAmount(service.tarifa, service.currency)}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            {onEditService && (
                              <Tooltip title="Editar servicio">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditService(service.id);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {onRemoveService && (
                              <Tooltip title="Eliminar servicio">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveService(service.id);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Detalle de Servicio */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0d47a1" }}>
          Detalles del Servicio
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedService && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Tipo de Servicio
                </Typography>
                <Typography>{getServiceTypeLabel(selectedService.type)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Nombre
                </Typography>
                <Typography>{selectedService.nombre || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Proveedor
                </Typography>
                <Typography>{selectedService.provider || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Precio Neto
                </Typography>
                <Typography>{formatAmount(selectedService.precioNeto, selectedService.currency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Tarifa
                </Typography>
                <Typography>{formatAmount(selectedService.tarifa, selectedService.currency)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Moneda
                </Typography>
                <Typography>{selectedService.currency || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Localizador
                </Typography>
                <Typography>{selectedService.localizador || "—"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Fecha de Inicio
                </Typography>
                <Typography>
                  {selectedService.fechaInicio
                    ? dayjs(selectedService.fechaInicio).format("DD/MM/YYYY")
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Fecha de Fin
                </Typography>
                <Typography>
                  {selectedService.fechaFin
                    ? dayjs(selectedService.fechaFin).format("DD/MM/YYYY")
                    : "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#0d47a1" }}>
                  Observaciones
                </Typography>
                <Typography>{selectedService.obs || "—"}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
