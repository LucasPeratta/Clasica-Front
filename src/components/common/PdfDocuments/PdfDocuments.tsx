import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import dayjs from "dayjs";
import { apiFetch } from "../apiFetch";

// Mismos límites que el backend
const MAX_PDFS = 10;
const MAX_SIZE_MB = 10;
const MAX_IMAGE_SIZE_MB = 5;

// Documentos permitidos: PDF, Word y Excel
const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
const DOCUMENT_ACCEPT = DOCUMENT_EXTENSIONS.join(",");

const getExtension = (name?: string | null) => {
  const match = (name || "").toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
};

const isDocument = (file: File) => DOCUMENT_EXTENSIONS.includes(getExtension(file.name));

interface iPdf {
  id: string;
  originalName?: string | null;
  filename?: string;
  size?: number | null;
  createdAt: string;
}

// Los PDFs viejos pueden no tener nombre original: se usa el nombre guardado
const extensionOf = (pdf: iPdf) => getExtension(pdf.originalName) || getExtension(pdf.filename) || ".pdf";

const DocumentIcon = ({ pdf }: { pdf: iPdf }) => {
  const ext = extensionOf(pdf);
  if (ext === ".doc" || ext === ".docx") return <DescriptionIcon sx={{ color: "#1565c0" }} />;
  if (ext === ".xls" || ext === ".xlsx") return <TableChartIcon sx={{ color: "#2e7d32" }} />;
  return <PictureAsPdfIcon sx={{ color: "#d32f2f" }} />;
};

interface PdfDocumentsProps {
  // Endpoint de los PDFs, ej. `${apiUrl}/pax/${id}/pdfs`
  baseUrl: string;
  title?: string;
  titleColor?: string;
  // Si se pasa, el botón también acepta imágenes y se las entrega a esta función
  // (devuelve un mensaje de error o null)
  onImagesSelected?: (images: File[]) => Promise<string | null>;
  // Texto cuando no hay PDFs ("" para no mostrar nada)
  emptyText?: string;
  // Contenido extra entre el título y la lista de PDFs (ej. fotos)
  children?: ReactNode;
}

const formatSize = (bytes?: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Lista de documentos PDF con subir, abrir y eliminar.
 * Los PDFs son privados: para abrirlos se pide al backend un link temporal.
 */
export const PdfDocuments = ({
  baseUrl,
  title = "Documentos",
  titleColor,
  onImagesSelected,
  emptyText = "No hay documentos cargados.",
  children,
}: PdfDocumentsProps) => {
  const [pdfs, setPdfs] = useState<iPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfToDelete, setPdfToDelete] = useState<iPdf | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadPdfs = useCallback(async () => {
    try {
      const response = await apiFetch(baseUrl);
      const data = await response.json();
      setPdfs(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      console.error("Error al cargar PDFs:", e);
      setError("No se pudieron cargar los documentos.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadPdfs();
  }, [loadPdfs]);

  const handleFilesSelected = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;
    setError(null);

    const newPdfs = files.filter(isDocument);
    const images = onImagesSelected
      ? files.filter((f) => !isDocument(f) && f.type.startsWith("image/"))
      : [];

    if (newPdfs.length + images.length !== files.length) {
      setError(
        onImagesSelected
          ? "Solo se permiten fotos o archivos PDF, Word o Excel."
          : "Solo se permiten archivos PDF, Word o Excel."
      );
      return;
    }
    if (newPdfs.some((f) => f.size > MAX_SIZE_MB * 1024 * 1024)) {
      setError(`Cada documento puede pesar como máximo ${MAX_SIZE_MB} MB.`);
      return;
    }
    if (images.some((f) => f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024)) {
      setError(`Cada foto puede pesar como máximo ${MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }
    if (pdfs.length + newPdfs.length > MAX_PDFS) {
      setError(`Se permiten hasta ${MAX_PDFS} documentos. Ya hay ${pdfs.length}.`);
      return;
    }

    setUploading(true);
    try {
      if (images.length > 0 && onImagesSelected) {
        const imageError = await onImagesSelected(images);
        if (imageError) {
          setError(imageError);
          return;
        }
      }

      if (newPdfs.length > 0) {
        const formData = new FormData();
        newPdfs.forEach((f) => formData.append("pdfs", f));

        const response = await apiFetch(baseUrl, { method: "POST", body: formData });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.msg || "No se pudo subir el documento.");
          return;
        }
        await loadPdfs();
      }
    } catch (e) {
      console.error("Error al subir documento:", e);
      setError("No se pudo subir el documento.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpen = async (pdf: iPdf) => {
    // Los PDF se ven en una pestaña nueva; Word y Excel se descargan
    const isPdf = extensionOf(pdf) === ".pdf";
    // La pestaña se abre antes de pedir el link para que el navegador no la bloquee
    const newTab = isPdf ? window.open("", "_blank") : null;
    try {
      const response = await apiFetch(`${baseUrl}/${pdf.id}/url`);
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data?.msg);

      if (isPdf) {
        if (newTab) newTab.location.href = data.url;
        else window.location.href = data.url;
        return;
      }

      // Word/Excel: se descarga acá para guardarlo con su nombre original
      // (Cloudinary siempre lo entrega como "file.docx")
      const fileResponse = await fetch(data.url);
      if (!fileResponse.ok) throw new Error("download failed");
      const blobUrl = URL.createObjectURL(await fileResponse.blob());
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = pdf.originalName || `documento${extensionOf(pdf)}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (e) {
      console.error("Error al abrir documento:", e);
      newTab?.close();
      setError("No se pudo abrir el documento.");
    }
  };

  const handleDelete = async () => {
    if (!pdfToDelete) return;
    setError(null);
    try {
      const response = await apiFetch(`${baseUrl}/${pdfToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      setPdfs((prev) => prev.filter((p) => p.id !== pdfToDelete.id));
    } catch (e) {
      console.error("Error al eliminar documento:", e);
      setError("No se pudo eliminar el documento.");
    } finally {
      setPdfToDelete(null);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: titleColor }}>
          {title}{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            {onImagesSelected ? "Documentos " : ""}
            {pdfs.length}/{MAX_PDFS}
          </Typography>
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
          // Con fotos habilitadas se puede seguir subiendo aunque se llegue al límite de PDFs
          disabled={uploading || (!onImagesSelected && pdfs.length >= MAX_PDFS)}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Subiendo..." : onImagesSelected ? "Subir archivo" : "Subir documento"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={onImagesSelected ? `${DOCUMENT_ACCEPT},image/*` : DOCUMENT_ACCEPT}
          multiple
          hidden
          onChange={(e) => handleFilesSelected(e.target.files)}
        />
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {children}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : pdfs.length === 0 ? (
        emptyText && (
          <Typography color="text.secondary" sx={{ py: 1 }}>
            {emptyText}
          </Typography>
        )
      ) : (
        <List dense disablePadding>
          {pdfs.map((pdf) => (
            <ListItem
              key={pdf.id}
              divider
              secondaryAction={
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <Tooltip title={extensionOf(pdf) === ".pdf" ? "Abrir" : "Descargar"}>
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        // Que el clic no llegue también al renglón (que abre el PDF)
                        e.stopPropagation();
                        handleOpen(pdf);
                      }}
                    >
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfToDelete(pdf);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              sx={{ cursor: "pointer", pr: 12 }}
              onClick={() => handleOpen(pdf)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <DocumentIcon pdf={pdf} />
              </ListItemIcon>
              <ListItemText
                primary={pdf.originalName || "Documento"}
                secondary={[formatSize(pdf.size), dayjs(pdf.createdAt).format("DD/MM/YYYY")]
                  .filter(Boolean)
                  .join(" · ")}
                primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Confirmación de borrado */}
      <Dialog open={pdfToDelete !== null} onClose={() => setPdfToDelete(null)}>
        <DialogTitle>Eliminar documento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Seguro que querés eliminar "{pdfToDelete?.originalName || "este documento"}"? No se puede
            deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPdfToDelete(null)}>Cancelar</Button>
          <Button color="error" onClick={handleDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
