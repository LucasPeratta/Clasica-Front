import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { iPax } from "../model";
import { getPaxById, createPax, updatePax } from "../handler";
import { useGoBack } from "../../common/useGoBack";

const initialState: iPax = {
  id: "",
  firstname: "",
  lastname: "",
  dni: "",
  dniVto: null,
  passport: "",
  passportVto: null,
  dob: null,
  adress: "",
  email: "",
  phoneNumber: "",
  obs: "",
};

export type PaxFormErrors = Partial<Record<"firstname" | "lastname" | "email", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseDate = (value: unknown) => (value ? dayjs(value as string) : null);

export const usePaxForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<iPax>(initialState);
  const [errors, setErrors] = useState<PaxFormErrors>({});
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  // Al editar, después de guardar vuelve a donde estaba
  const goBack = useGoBack(id ? `/paxs/profile/${id}` : "/paxs");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getPaxById(id)
      .then((pax) => {
        if (pax) {
          setFormData({
            ...pax,
            dob: parseDate(pax.dob),
            dniVto: parseDate(pax.dniVto),
            passportVto: parseDate(pax.passportVto),
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const setField = <K extends keyof iPax>(field: K, value: iPax[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const found: PaxFormErrors = {};
    if (!formData.firstname?.trim()) found.firstname = "Falta el nombre";
    if (!formData.lastname?.trim()) found.lastname = "Falta el apellido";
    if (formData.email?.trim() && !EMAIL_PATTERN.test(formData.email.trim())) {
      found.email = "El email no parece correcto (ej. nombre@gmail.com)";
    }
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  // Mensaje de error según lo que respondió el backend
  const responseError = async (resp: Response) => {
    const err = await resp.json().catch(() => null);
    if (err?.errorCode === "DUPLICATE_DOCUMENT") return err.msg as string;
    if (err?.errorCode === "P2002") return "Ese email ya está cargado en otro pasajero.";
    return "No se pudo guardar el pasajero. Intentá de nuevo.";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveError("");
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      const resp = id ? await updatePax(id, formData) : await createPax(formData);
      if (!resp.ok) {
        setSaveError(await responseError(resp));
        return;
      }
      setSaved(true);
      if (id) {
        setTimeout(goBack, 900);
      } else {
        // Recién creado: se abre su ficha, para subir fotos o documentos
        const body = await resp.json().catch(() => null);
        const newId = body?.data?.id;
        setTimeout(() => navigate(newId ? `/paxs/profile/${newId}` : "/paxs", { replace: true }), 900);
      }
    } catch (error) {
      console.error("Error:", error);
      setSaveError("No se pudo guardar el pasajero. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return {
    id,
    loading,
    saving,
    saved,
    setSaved,
    formData,
    setField,
    errors,
    saveError,
    setSaveError,
    handleSubmit,
    goBack,
  };
};
