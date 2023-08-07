import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getFileById } from "./handler";
import { iFile } from "../model";
import dayjs from "dayjs";

export const FilesProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<iFile | null>(null);

  useEffect(() => {
    if (!id) return;
    getFileById(id)
      .then((data) => {
        setFile(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]);

  if (!file) {
    return <div>error</div>;
  }

  return (
    <div>
      <h1>File Profile</h1>
      <p>Precio Neto Total: {file.precioNetoTotal}</p>
      <p>Tarifa Total: {file.tarifaTotal}</p>
      <p>Destino: {file.destino}</p>
      <p>Fecha de Salida: {dayjs(file.fechaSalida).format("DD-MM-YYYY")}</p>
      <p>Observaciones: {file.obs}</p>

      <h2>Clients:</h2>
      {file.clients.map((client) => (
        <div key={client.id}>
          <h2>{` - ${client.firstname} ${client.lastname}`}</h2>
          <p>DNI: {client.dni}</p>
          <p>Pasaporte: {client.passport}</p>
          <p>
            Fecha de Nacimiento:{" "}
            {client.dob ? dayjs(client.dob).format("DD-MM-YYYY") : ""}
          </p>
          <p>Direccion: {client.adress}</p>
          <p>Email: {client.email}</p>
          <p>Celular: {client.phoneNumber}</p>
          <p>Observaciones: {client.obs}</p>
        </div>
      ))}

      <h2>Services:</h2>
      {file.services.map((service) => (
        <div key={service.id}>
          <h2>- {service.provider}</h2>
          <p>Precio Neto: {service.precioNeto}</p>
          <p>Tarifa: {service.tarifa}</p>
          <p>Moneda: {service.currency}</p>
          <p>Observaciones: {service.obs}</p>
        </div>
      ))}

      <Link to={`/files`}>
        <button>Back</button>
      </Link>
      <Link to={`/files/update/${id}`}>
        <button>editar</button>
      </Link>
    </div>
  );
};
