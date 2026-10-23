import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { iFile } from "../model";
import { iPax } from "../../Pax/model";
import { iService } from "../../Service/model";
import { saveService, softDeleteService } from "../../Service/handler";
import { createFile, toFileFormData } from "../handler";
import { useGoBack } from "../../common/useGoBack";

const initialState: iFile = {
  id: "",
  nro: "",
  precioNetoTotal: "0",
  tarifaTotal: "0",
  tarifaAlternativa: "",
  tarifaAlternativaMoneda: null,
  destino: "",
  fechaSalida: null,
  clients: [],
  services: [],
  obs: "",
};

export type FileFormErrors = Partial<Record<"destino" | "fechaSalida", string>>;

/**
 * Pantalla "Crear un file": datos del viaje, pasajeros y servicios
 */
export const useFileForm = () => {
  const [formData, setFormData] = useState<iFile>(initialState);
  const [errors, setErrors] = useState<FileFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const navigate = useNavigate();
  const goBack = useGoBack("/files");

  const setField = <K extends keyof iFile>(field: K, value: iFile[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addPaxs = (paxs: iPax[]) => {
    setFormData((prev) => ({ ...prev, clients: [...prev.clients, ...paxs] }));
    return true;
  };

  const removePax = (paxId: string) =>
    setFormData((prev) => ({ ...prev, clients: prev.clients.filter((c) => c.id !== paxId) }));

  // Agrega o reemplaza un servicio en la lista
  const updateFileService = (service: iService) =>
    setFormData((prev) => ({
      ...prev,
      services: prev.services.some((s) => s.id === service.id)
        ? prev.services.map((s) => (s.id === service.id ? service : s))
        : [...prev.services, service],
    }));

  // El servicio se guarda enseguida; queda asociado al file cuando se crea el file
  const saveFileService = async (service: iService) => {
    const saved = await saveService(service);
    if (saved) updateFileService(saved);
    return saved;
  };

  const removeService = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, services: prev.services.filter((s) => s.id !== serviceId) }));
    // Todavía no tiene file: se elimina para que no quede suelto
    softDeleteService(serviceId);
  };

  const validate = () => {
    const found: FileFormErrors = {};
    if (!formData.destino.trim()) found.destino = "Falta el destino";
    if (!formData.fechaSalida || !dayjs(formData.fechaSalida).isValid()) found.fechaSalida = "Falta la fecha de salida";
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const handleSubmit = async () => {
    setSaveError(false);
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    try {
      const resp = await createFile(
        toFileFormData(formData),
        formData.clients.map((c) => c.id),
        formData.services.map((s) => s.id)
      );
      const body = await resp.json().catch(() => null);
      if (!resp.ok) {
        setSaveError(true);
        return;
      }
      // Se abre el file recién creado (replace: "atrás" no vuelve al formulario vacío)
      navigate(body?.id ? `/files/profile/${body.id}` : "/files", { replace: true });
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
};
