import { useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Avatar, Button, Tooltip, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { iPax } from "../../../Pax/model";
import { initials } from "../../utils/formatters";
import { iFile } from "../../model";
import { getDocumentAlerts } from "../../../Pax/utils/documentAlerts";
import { DocumentAlertChips } from "../../../Pax/components/DocumentAlertChips";
import dayjs from "dayjs";

interface FileProfileClientsProps {
  clients: iPax[];
  fileId: string;
  // Salida del viaje: los documentos se controlan contra esta fecha
  fechaSalida?: iFile["fechaSalida"];
  onAddClient?: () => void;
  onRemoveClient?: (clientId: string) => void;
}

export const FileProfileClients = ({
  clients,
  fileId,
  fechaSalida,
  onAddClient,
  onRemoveClient,
}: FileProfileClientsProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#0d47a1" }}
        >
          Pasajeros
        </Typography>
        {onAddClient && (
          <Button 
            size="small" 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={onAddClient}
          >
            Agregar Pasajero
          </Button>
        )}
      </Box>
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {clients.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">
                No hay pasajeros asociados.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(13, 71, 161, 0.05)" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1" }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1" }}>DNI</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1" }}>Pasaporte</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1" }}>Fecha de Nacimiento</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0d47a1", textAlign: "center" }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client: iPax) => (
                  <TableRow
                    key={client.id}
                    sx={{
                      cursor: "pointer",
                      transition: "background 0.15s",
                      "&:hover": {
                        backgroundColor: "rgba(13, 71, 161, 0.04)",
                      },
                      "&:last-of-type": {
                        borderBottom: "none",
                      },
                    }}
                    onClick={() =>
                      navigate(`/paxs/profile/${client.id}`, {
                        state: { fromFileId: fileId },
                      })
                    }
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                          {initials(client.lastname, client.firstname)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>
                            {client.lastname} {client.firstname}
                          </Typography>
                          <DocumentAlertChips
                            alerts={getDocumentAlerts(client, [fechaSalida])}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0d47a1" }}>
                      {client.dni || "—"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#0d47a1" }}>
                      {client.passport || "—"}
                    </TableCell>
                    <TableCell>
                      {client.dob 
                        ? dayjs(client.dob).format("DD/MM/YYYY")
                        : "—"}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {onRemoveClient && (
                        <Tooltip title="Eliminar pasajero">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveClient(client.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};
