import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BedIcon from "@mui/icons-material/Bed";
import FolderIcon from "@mui/icons-material/Folder";
import { LoadingScreen } from "../LoadingScreen";
import { useGoBack } from "../common/useGoBack";
import { CountTabs } from "../common/CountTabs";
import { PdfDocuments } from "../common/PdfDocuments/PdfDocuments";
import { CURRENCIES, formatMoney } from "../File/utils/totals";
import { deleteGrupo, getGrupo, grupoPdfsUrl } from "./handler";
import { iGrupo } from "./model";
import { GrupoDialog } from "./components/GrupoDialog";
import { ReservasTab } from "./components/ReservasTab";
import { ServiciosTab } from "./components/ServiciosTab";
import { PlanesTab } from "./components/PlanesTab";
import { RoomingTab } from "./components/RoomingTab";

const cardSx = { p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" };
const buttonSx = { textTransform: "none", fontSize: "1rem", fontWeight: 600, borderRadius: 2, px: 2.5 };

/**
 * Ficha de una salida grupal: resumen (lugares, cobros, ganancia) y pestañas con las reservas,
 * los servicios y precios, los planes de pago, el rooming y los documentos
 */
export const GrupoProfile = (): JSX.Element => {
  const { id = "" } = useParams<{ id: string }>();
  const [grupo, setGrupo] = useState<iGrupo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const goBack = useGoBack("/grupos");
  const navigate = useNavigate();

  // Pestaña abierta (en la URL, para volver al mismo lugar)
  const [searchParams, setSearchParams] = useSearchParams();
  const seccion = searchParams.get("seccion") ?? "reservas";
  const setSeccion = (value: string) => setSearchParams(value === "reservas" ? {} : { seccion: value }, { replace: true });

  const load = useCallback(async () => {
    setGrupo(await getGrupo(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingScreen />;
  if (!grupo) return <Typography sx={{ p: 4 }}>No se encontró la salida grupal.</Typography>;

  const { resumen } = grupo;
  const days = dayjs(grupo.fechaSalida).startOf("day").diff(dayjs().startOf("day"), "day");

  const handleDelete = async () => {
    setConfirmDelete(false);
    const result = await deleteGrupo(grupo.id);
    if (result.ok) navigate("/grupos", { replace: true });
    else setError(result.msg);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 3,
        backgroundImage:
          "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%), " +
          "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), " +
          "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Box sx={{ maxWidth: 1300, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Encabezado */}
        <Paper
          elevation={0}
          sx={{ ...cardSx, display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2 }}
        >
          <Box>
            <Typography sx={{ fontSize: "0.95rem", color: "#5b6d74", fontWeight: 600 }}>
              Salida grupal · {grupo.destino}
              {grupo.visaUsa ? " · requiere visa de EE.UU." : ""}
            </Typography>
            <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: "1.6rem", md: "2rem" }, lineHeight: 1.2 }}>
              {grupo.titulo}
            </Typography>
            <Typography sx={{ color: "#5b6d74", mt: 0.5 }}>
              Sale el {dayjs(grupo.fechaSalida).format("DD/MM/YYYY")}
              {grupo.fechaRegreso ? ` · regresa el ${dayjs(grupo.fechaRegreso).format("DD/MM/YYYY")}` : ""}
              {days > 1 ? ` · en ${days} días` : days === 1 ? " · mañana" : days === 0 ? " · hoy" : ""}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={goBack} sx={buttonSx}>
              Volver
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
              sx={{ ...buttonSx, fontWeight: 700, backgroundColor: "#0D5B75", "&:hover": { backgroundColor: "#0a4a5e" } }}
            >
              Editar datos
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmDelete(true)} sx={buttonSx}>
              Eliminar
            </Button>
          </Box>
        </Paper>

        {/* Resumen */}
        <Paper elevation={0} sx={{ ...cardSx, display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ minWidth: 220 }}>
            <Typography sx={{ color: "#5b6d74", fontWeight: 600 }}>Pasajeros</Typography>
            <Typography sx={{ fontSize: "1.6rem", fontWeight: 700 }}>
              {resumen.pasajeros}
              {grupo.cupo ? ` de ${grupo.cupo}` : ""}
            </Typography>
            {grupo.cupo && (
              <>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((resumen.pasajeros / grupo.cupo) * 100, 100)}
                  color={resumen.lugaresLibres !== null && resumen.lugaresLibres < 0 ? "error" : "primary"}
                  sx={{ height: 8, borderRadius: 4, my: 0.5 }}
                />
                <Typography color={resumen.lugaresLibres !== null && resumen.lugaresLibres < 0 ? "error" : "text.secondary"}>
                  {resumen.lugaresLibres === null
                    ? ""
                    : resumen.lugaresLibres > 0
                      ? `Quedan ${resumen.lugaresLibres} lugar${resumen.lugaresLibres === 1 ? "" : "es"}`
                      : resumen.lugaresLibres === 0
                        ? "Cupo completo"
                        : `${-resumen.lugaresLibres} por encima del cupo`}
                </Typography>
              </>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {resumen.reservas === 1 ? "1 reserva" : `${resumen.reservas} reservas`}
              {grupo.sinHabitacion.length > 0 && grupo.pasajeros.length > 0 ? ` · ${grupo.sinHabitacion.length} sin habitación` : ""}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 300, overflowX: "auto" }}>
            {resumen.dinero.length === 0 ? (
              <Typography color="text.secondary">Cuando agregues reservas, acá vas a ver lo vendido, lo cobrado y la ganancia.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Moneda</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Vendido
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Cobrado
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Falta cobrar
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Ganancia
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resumen.dinero.map((d) => (
                    <TableRow key={d.moneda}>
                      <TableCell sx={{ fontWeight: 600 }}>{CURRENCIES.find((c) => c.value === d.moneda)?.label ?? d.moneda}</TableCell>
                      <TableCell align="right">{formatMoney(d.total, d.moneda)}</TableCell>
                      <TableCell align="right" sx={{ color: "success.dark", fontWeight: 600 }}>
                        {formatMoney(d.cobrado, d.moneda)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: d.falta > 0 ? "error.main" : "text.secondary", fontWeight: 600 }}>
                        {formatMoney(d.falta, d.moneda)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: d.ganancia < 0 ? "error.main" : "success.dark", fontWeight: 700 }}>
                        {formatMoney(d.ganancia, d.moneda)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        </Paper>

        {/* Viaje a EE.UU.: visas que faltan o vencen */}
        {grupo.visaUsa && grupo.visaProblemas.length > 0 && (
          <Alert severity="warning" sx={{ borderRadius: 3, fontSize: "1rem" }}>
            <AlertTitle sx={{ fontWeight: 700 }}>
              Visas de EE.UU.: {grupo.visaProblemas.length === 1 ? "1 pasajero para revisar" : `${grupo.visaProblemas.length} pasajeros para revisar`}
            </AlertTitle>
            {grupo.visaProblemas.map((v) => (
              <div key={v.paxId}>
                • {v.nombre} ({v.reserva}): {v.problema}
              </div>
            ))}
          </Alert>
        )}

        {/* Pestañas */}
        <Box>
          <CountTabs
            value={seccion}
            onChange={setSeccion}
            tabs={[
              { value: "reservas", label: "Reservas", icon: <GroupIcon />, count: grupo.reservas.length },
              { value: "servicios", label: "Servicios y precios", icon: <ListAltIcon />, count: grupo.servicios.length },
              { value: "planes", label: "Planes de pago", icon: <EventNoteIcon />, count: grupo.planes.length },
              { value: "rooming", label: "Rooming", icon: <BedIcon />, count: grupo.habitaciones.length },
              { value: "documentos", label: "Documentos", icon: <FolderIcon /> },
            ]}
          />
          <Paper elevation={0} sx={cardSx}>
            {seccion === "reservas" && <ReservasTab grupo={grupo} onChange={load} />}
            {seccion === "servicios" && <ServiciosTab grupo={grupo} onChange={load} />}
            {seccion === "planes" && <PlanesTab grupo={grupo} onChange={load} />}
            {seccion === "rooming" && <RoomingTab grupo={grupo} onChange={load} />}
            {seccion === "documentos" && <PdfDocuments baseUrl={grupoPdfsUrl(grupo.id)} titleColor="#0D5B75" />}
          </Paper>
        </Box>
      </Box>

      {editing && (
        <GrupoDialog
          grupo={grupo}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            load();
          }}
        />
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Eliminar salida grupal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {grupo.reservas.length > 0
              ? "La salida tiene reservas: primero hay que eliminarlas (las que no tienen pagos). Las que tienen pagos o están facturadas se guardan para la AFIP."
              : `¿Eliminar "${grupo.titulo}"? No se puede deshacer.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {grupo.reservas.length > 0 ? (
            <Button variant="contained" onClick={() => setConfirmDelete(false)}>
              Entendido
            </Button>
          ) : (
            <>
              <Button onClick={() => setConfirmDelete(false)}>Cancelar</Button>
              <Button color="error" variant="contained" onClick={handleDelete}>
                Eliminar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};
