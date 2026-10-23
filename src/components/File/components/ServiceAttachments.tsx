import { useState } from "react";
import { Alert, Box, Chip, Snackbar } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import { iServiceAdjunto } from "../../Service/model";
import { getServiceAdjuntoUrl } from "../../Service/handler";

interface ServiceAttachmentsProps {
  serviceId: string;
  adjuntos: iServiceAdjunto[];
  // Si se pasa, cada uno tiene una cruz para eliminarlo
  onDelete?: (adjunto: iServiceAdjunto) => void;
}

/**
 * Fotos o documentos de un servicio como etiquetas: al tocarlas se abren en otra pestaña
 */
export const ServiceAttachments = ({ serviceId, adjuntos, onDelete }: ServiceAttachmentsProps) => {
  const [error, setError] = useState(false);

  const open = async (adjunto: iServiceAdjunto) => {
    // La pestaña se abre antes de pedir el link para que el navegador no la bloquee
    const tab = window.open("", "_blank");
    const url = await getServiceAdjuntoUrl(serviceId, adjunto.id);
    if (url && tab) tab.location.href = url;
    else if (url) window.location.href = url;
    else {
      tab?.close();
      setError(true);
    }
  };

  if (adjuntos.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }} onClick={(e) => e.stopPropagation()}>
      {adjuntos.map((a) => (
        <Chip
          key={a.id}
          size="small"
          variant="outlined"
          icon={a.mimetype?.startsWith("image/") ? <ImageIcon /> : <DescriptionIcon />}
          label={a.originalName || "Archivo"}
          onClick={() => open(a)}
          onDelete={onDelete ? () => onDelete(a) : undefined}
          sx={{ maxWidth: 220, fontWeight: 600, color: "#0D5B75", borderColor: "#9db1b8" }}
        />
      ))}
      <Snackbar open={error} autoHideDuration={4000} onClose={() => setError(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setError(false)}>
          No se pudo abrir el archivo.
        </Alert>
      </Snackbar>
    </Box>
  );
};
