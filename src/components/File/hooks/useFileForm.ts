import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { iFile } from "../model";
import { iPax } from "../../Pax/model";
import { iService } from "../../Service/model";
import { getPax } from "../../Pax/handler";
import {
  getService,
  createService,
  softDeleteService,
  getServiceById,
} from "../../Service/handler";
import { getFileById, createFile, updateFile } from "../handler";

const initialState: iFile = {
  id: "",
  nro: "",
  precioNetoTotal: "0",
  tarifaTotal: "0",
  tarifaAlternativa: "",
  destino: "",
  fechaSalida: dayjs(),
  clients: [],
  services: [],
  obs: "",
};

export const useFileForm = () => {
  const [paxs, setPaxs] = useState<iPax[]>([]);
  const [formData, setFormData] = useState<iFile>(initialState);
  const [selectedPaxIds, setSelectedPaxIds] = useState<string[]>([]);
  const [fileServices, setFileServices] = useState<iService[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    const promises = [getPax(), getService()];
    if (id) promises.push(getFileById(id));

    Promise.allSettled(promises)
      .then((res) => {
        let paxData: iPax[] = [];
        let fileData: iFile | undefined;

        res.forEach((r, index) => {
          if (r.status !== "fulfilled") return;
          if (index === 0 && Array.isArray(r.value)) {
            paxData = r.value as iPax[];
          } else if (index === 2 && id) {
            fileData = r.value as unknown as iFile;
          }
        });

        setPaxs(
          paxData.sort((a, b) =>
            `${a.lastname} ${a.firstname}`.localeCompare(
              `${b.lastname} ${b.firstname}`
            )
          )
        );

        if (fileData) {
          fileData.fechaSalida = dayjs(fileData.fechaSalida);
          setFormData(fileData);
          setSelectedPaxIds(fileData.clients.map((c) => c.id));
          setFileServices(fileData.services);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Calcular automáticamente los totales cuando cambien los servicios
  useEffect(() => {
    const precioNetoTotal = fileServices.reduce((sum, service) => {
      const precioNeto = Number(service.precioNeto) || 0;
      return sum + precioNeto;
    }, 0);

    const tarifaTotal = fileServices.reduce((sum, service) => {
      const tarifa = Number(service.tarifa) || 0;
      return sum + tarifa;
    }, 0);

    setFormData((prev) => ({
      ...prev,
      precioNetoTotal: precioNetoTotal.toString(),
      tarifaTotal: tarifaTotal.toString(),
    }));
  }, [fileServices]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    return (
      !!formData.destino &&
      !!formData.fechaSalida &&
      !!formData.precioNetoTotal &&
      !!formData.tarifaTotal
    );
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setErrorNotificationOpen(true);
      return;
    }

    const paxsId = selectedPaxIds;
    const servicesId = fileServices.map((s) => s.id);
    let ok = false;

    try {
      if (id) {
        const resp = await updateFile(id, formData, paxsId, servicesId);
        ok = resp.ok;
      } else {
        const resp = await createFile(formData, paxsId, servicesId);
        ok = resp.ok;
      }
    } catch {
      ok = false;
    }

    if (ok) {
      setNotificationOpen(true);
      setTimeout(() => {
        navigate(id ? `/files/profile/${id}` : "/files");
      }, 1200);
    } else {
      setErrorNotificationOpen(true);
    }
  };

  return {
    id,
    paxs,
    formData,
    setFormData,
    selectedPaxIds,
    setSelectedPaxIds,
    fileServices,
    setFileServices,
    loading,
    notificationOpen,
    setNotificationOpen,
    errorNotificationOpen,
    setErrorNotificationOpen,
    handleChange,
    handleSubmit,
    navigate,
    createService,
    softDeleteService,
    getServiceById,
  };
};
