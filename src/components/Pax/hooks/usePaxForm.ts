import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { iPax } from "../model";
import { getPaxById, createPax, updatePax, getPaxPhotos } from "../handler";
import { PaxPhoto } from "../types/paxPhoto";

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

export const usePaxForm = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<iPax>(initialState);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [photos, setPhotos] = useState<PaxPhoto[]>([]);

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    if (id) {
      Promise.all([getPaxById(id), getPaxPhotos(id)])
        .then(([pax, photos]) => {
          if (pax) {
            console.log("Pax del backend:", pax);
            
            // Manejar nombres viejos si existen
            if ((pax as any).dniExp && !pax.dniVto) {
              pax.dniVto = (pax as any).dniExp;
            }
            if ((pax as any).passportExp && !pax.passportVto) {
              pax.passportVto = (pax as any).passportExp;
            }
            
            // Convertir a dayjs - maneja tanto strings ISO como objetos dayjs
            const parseDate = (value: any) => {
              if (!value) return null;
              if (typeof value === 'string' || typeof value === 'number') {
                return dayjs(value);
              }
              // Si ya es un dayjs object, simplemente lo devuelve
              if (value._isAMomentObject || value.$L !== undefined) {
                return value;
              }
              return dayjs(value);
            };
            
            pax.dob = parseDate(pax.dob);
            pax.dniVto = parseDate(pax.dniVto);
            pax.passportVto = parseDate(pax.passportVto);
            
            console.log("Después del parse:", {
              dob: pax.dob,
              dniVto: pax.dniVto,
              passportVto: pax.passportVto
            });
            
            setFormData(pax);
          }
          setPhotos(photos);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;

    if (id === "passport") {
      const formattedValue = value.toUpperCase();
      setFormData((prev) => ({ ...prev, passport: formattedValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    const required = ["firstname", "lastname"];
    const missing = required.filter(
      (fld) =>
        !formData[fld as keyof iPax] ||
        `${formData[fld as keyof iPax]}`.trim() === ""
    );
    return missing.length === 0;
  };

  const openSuccess = () => setNotificationOpen(true);
  const openError = (message: string) => {
    setErrorMessage(message);
    setErrorNotificationOpen(true);
  };

  // Mensaje de error según lo que respondió el backend
  const showResponseError = async (resp: Response) => {
    const err = await resp.json().catch(() => null);
    if (err?.errorCode === "DUPLICATE_DOCUMENT") openError(err.msg);
    else if (err?.errorCode === "P2002") openError("El mail ingresado ya se encuentra registrado");
    else openError("No se pudo guardar el pasajero. Intentá de nuevo.");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (id) {
        const resp = await updatePax(id, formData);
        if (resp.ok) {
          openSuccess();
          setTimeout(() => {
            navigate(`/paxs/profile/${id}`);
          }, 1200);
        } else {
          await showResponseError(resp);
        }
      } else {
        const resp = await createPax(formData);
        if (resp.ok) {
          openSuccess();
          setTimeout(() => {
            navigate("/paxs");
          }, 1200);
        } else {
          await showResponseError(resp);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      openError("No se pudo guardar el pasajero. Intentá de nuevo.");
    }
  };

  return {
    id,
    loading,
    formData,
    setFormData,
    photos,
    setPhotos,
    notificationOpen,
    setNotificationOpen,
    errorNotificationOpen,
    setErrorNotificationOpen,
    errorMessage,
    handleChange,
    handleSubmit,
    navigate,
  };
};
