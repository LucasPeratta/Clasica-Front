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
  passport: "",
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
  const [photos, setPhotos] = useState<PaxPhoto[]>([]);

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    if (id) {
      Promise.all([getPaxById(id), getPaxPhotos(id)])
        .then(([pax, photos]) => {
          if (pax) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pax.dob = pax.dob ? (dayjs(pax.dob) as any) : null;
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
  const openError = () => setErrorNotificationOpen(true);

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
          const err = await resp.json();
          if (err.errorCode === "P2002") {
            openError();
          }
        }
      } else {
        const resp = await createPax(formData);
        if (resp.ok) {
          openSuccess();
          setTimeout(() => {
            navigate("/paxs");
          }, 1200);
        } else {
          const err = await resp.json();
          if (err.errorCode === "P2002") {
            openError();
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
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
    handleChange,
    handleSubmit,
    navigate,
  };
};
