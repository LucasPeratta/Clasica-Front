import { useEffect, useState } from "react";
import { useFileProfile } from "./hooks/useFileProfile";
import { LoadingScreen } from "../LoadingScreen";
import { Alert, Box, Paper, Snackbar, Typography } from "@mui/material";
import { iService, newService } from "../Service/model";
import { FileProfileHeader } from "./profile/components/FileProfileHeader";
import { FileProfileClients } from "./profile/components/FileProfileClients";
import { FileProfileServices } from "./profile/components/FileProfileServices";
import { FileTotals } from "./components/FileTotals";
import { updateFile, filePdfsUrl, toFileFormData, deleteFile } from "./handler";
import { FileDeleteDialog, iFileToDelete } from "./components/FileDeleteDialog";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PdfDocuments } from "../common/PdfDocuments/PdfDocuments";
import { saveService, setServiceLiquidado } from "../Service/handler";
import { FilePayments } from "./profile/components/FilePayments";
import { FileSummary } from "./profile/components/FileSummary";
import { getFilePayments, iPaymentsSummary } from "./paymentsHandler";
import { CountTabs } from "../common/CountTabs";
import ListAltIcon from "@mui/icons-material/ListAlt";
import GroupIcon from "@mui/icons-material/Group";
import PaymentsIcon from "@mui/icons-material/Payments";
import FolderIcon from "@mui/icons-material/Folder";
import { AddPaxDialog } from "./components/AddPaxDialog";
import { ServiceDialog } from "./components/ServiceDialog";
import { iPax } from "../Pax/model";
import { iFile } from "./model";

export const FilesProfile = (): JSX.Element => {
  const { file, loading, id, setFile } = useFileProfile();
  const [openAddPax, setOpenAddPax] = useState(false);
  // Servicio que se está agregando o editando (null = ventana cerrada)
  const [editingService, setEditingService] = useState<iService | null>(null);
  const [deleteFileOpen, setDeleteFileOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState(false);
  const [deleteFileError, setDeleteFileError] = useState(false);
  const navigate = useNavigate();
  // Pestaña abierta (en la URL, para volver al mismo lugar)
  const [searchParams, setSearchParams] = useSearchParams();
  const seccion = searchParams.get("seccion") ?? "servicios";
  const setSeccion = (value: string) =>
    setSearchParams(value === "servicios" ? {} : { seccion: value }, { replace: true });
  // Estado de los cobros, para el resumen de arriba
  const [payments, setPayments] = useState<iPaymentsSummary | null>(null);

  // Eliminar el file desde su perfil; al terminar vuelve a la lista (que muestra el aviso)
  const handleDeleteFile = async () => {
    if (!id) return;
    setDeletingFile(true);
    const ok = await deleteFile(id);
    setDeletingFile(false);
    if (ok) {
      // replace: que "atrás" no vuelva al perfil de un file que ya no existe
      navigate("/files", { replace: true, state: { fileDeleted: true } });
    } else {
      setDeleteFileOpen(false);
      setDeleteFileError(true);
    }
  };
  // Suma pasajeros al file; devuelve true si se guardó
  const handleAddPax = async (newPaxs: iPax[]) => {
    if (!file || !id) return false;
    const updatedFile = { ...file, clients: [...file.clients, ...newPaxs] };
    try {
      const resp = await updateFile(
        id,
        toFileFormData(updatedFile),
        updatedFile.clients.map((c) => c.id),
        file.services.map((s) => s.id)
      );
      if (resp.ok) setFile(updatedFile);
      return resp.ok;
    } catch (error) {
      console.error("Error agregando pasajeros:", error);
      return false;
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

  const handleEditServiceOpen = (serviceId: string) => {
    const service = file?.services.find((s) => s.id === serviceId);
    if (service) setEditingService(service);
  };

  // Guarda el servicio y lo deja asociado al file; devuelve el servicio guardado o null
  const handleSaveService = async (service: iService) => {
    if (!file || !id) return null;
    const saved = await saveService(service);
    if (!saved) return null;
    const isNew = !file.services.some((s) => s.id === saved.id);
    const updatedFile = {
      ...file,
      services: isNew ? [...file.services, saved] : file.services.map((s) => (s.id === saved.id ? { ...s, ...saved } : s)),
    };
    try {
      const resp = await updateFile(
        id,
        toFileFormData(updatedFile),
        file.clients.map((c) => c.id),
        updatedFile.services.map((s) => s.id)
      );
      if (!resp.ok) return null;
      setFile(updatedFile);
      return saved;
    } catch (error) {
      console.error("Error guardando servicio:", error);
      return null;
    }
  };

  // Ya guardado (con sus fotos): se actualiza en la pantalla
  const handleServiceSaved = (service: iService, close = true) => {
    setFile((prev) => prev && { ...prev, services: prev.services.map((s) => (s.id === service.id ? service : s)) });
    if (close) setEditingService(null);
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

  // Marcar un servicio como liquidado (enviado al mayorista) o desmarcarlo
  const handleToggleLiquidado = async (serviceId: string, liquidado: boolean) => {
    const ok = await setServiceLiquidado(serviceId, liquidado);
    if (!ok) return;
    setFile((prev) =>
      prev && {
        ...prev,
        services: prev.services.map((s) =>
          s.id === serviceId
            ? { ...s, liquidado, liquidadoAt: liquidado ? new Date().toISOString() : null }
            : s
        ),
      }
    );
  };

  // Los pagos se recalculan cuando cambia lo que se cobra (servicios, tarifa alternativa, salida)
  const paymentsRefreshKey = file
    ? JSON.stringify([
    file.services.map((s) => [s.id, s.tarifa, s.currency, s.type]),
    file.tarifaAlternativa,
    file.tarifaAlternativaMoneda,
    file.fechaSalida,
  ])
    : "";

  useEffect(() => {
    if (!id) return;
    getFilePayments(id).then((result) => result.ok && setPayments(result.data));
  }, [id, paymentsRefreshKey]);

  if (loading) return <LoadingScreen />;
  if (!file) return <Typography>Error al cargar el archivo.</Typography>;

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
      <FileProfileHeader file={file} onSave={handleEditFileSave} onDelete={() => setDeleteFileOpen(true)} />
      <FileSummary file={file} payments={payments} onSelect={setSeccion} />

      {/* Confirmación: muestra qué contiene el file antes de eliminarlo */}
      <FileDeleteDialog
        open={deleteFileOpen}
        onClose={() => setDeleteFileOpen(false)}
        onConfirm={handleDeleteFile}
        file={file as iFileToDelete}
        deleting={deletingFile}
      />
      <Snackbar
        open={deleteFileError}
        autoHideDuration={4000}
        onClose={() => setDeleteFileError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setDeleteFileError(false)}>
          No se pudo eliminar el file. Intentá de nuevo.
        </Alert>
      </Snackbar>
      <Box>
        <CountTabs
          value={seccion}
          onChange={setSeccion}
          tabs={[
            { value: "servicios", label: "Servicios", icon: <ListAltIcon />, count: file.services.length },
            { value: "pasajeros", label: "Pasajeros", icon: <GroupIcon />, count: file.clients.length },
            { value: "pagos", label: "Pagos", icon: <PaymentsIcon /> },
            { value: "documentos", label: "Documentos", icon: <FolderIcon /> },
          ]}
        />
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
        >
          {seccion === "servicios" && (
            <>
              <FileProfileServices
                services={file.services}
                fechaSalida={file.fechaSalida}
                onToggleLiquidado={handleToggleLiquidado}
                onAddService={() => setEditingService(newService())}
                onEditService={handleEditServiceOpen}
                onRemoveService={handleRemoveService}
              />
              <FileTotals
                services={file.services}
                tarifaAlternativa={file.tarifaAlternativa}
                tarifaAlternativaMoneda={file.tarifaAlternativaMoneda}
                onSaveAlternative={handleSaveAlternative}
              />
            </>
          )}
          {seccion === "pasajeros" && (
            <FileProfileClients
              clients={file.clients}
              fileId={file.id}
              fechaSalida={file.fechaSalida}
              onAddClient={() => setOpenAddPax(true)}
              onRemoveClient={handleRemovePax}
            />
          )}
          {seccion === "pagos" && (
            <FilePayments
              fileId={file.id}
              refreshKey={paymentsRefreshKey}
              onSummaryChange={setPayments}
              pasajeros={file.clients}
            />
          )}
          {seccion === "documentos" && (
            <PdfDocuments baseUrl={filePdfsUrl(file.id)} titleColor="#0D5B75" />
          )}
        </Paper>
      </Box>
      </Box>

      <AddPaxDialog
        open={openAddPax}
        excludeIds={file.clients.map((c) => c.id)}
        onClose={() => setOpenAddPax(false)}
        onAdd={handleAddPax}
      />
      <ServiceDialog
        service={editingService}
        fechaSalida={file.fechaSalida}
        onClose={() => setEditingService(null)}
        onSave={handleSaveService}
        onSaved={handleServiceSaved}
      />
    </Box>
  );
};
