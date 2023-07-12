import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getServiceById } from "./handler";
import { iService } from "../model";
export const ServiceProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [Service, setService] = useState<iService | null>(null);

  useEffect(() => {
    if (!id) return;
    getServiceById(id)
      .then((data) => {
        setService(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]); //Indica que el efecto se ejecutará cada vez que el valor de id cambie.

  if (!Service) {
    return <div>error</div>;
  }

  return (
    <div>
      <h2>Provedor: {Service.provider}</h2>
      <p>Precio Neto: {Service.precioNeto}</p>
      <p>Tarifa: {Service.tarifa}</p>
      <p>Valor: {Service.currency}</p>
      <p>Observaciones: {Service.obs}</p>
      <Link to={`/services`}>
        <button>volver</button>
      </Link>
      <Link to={`/services/update/${Service.id}`}>
        <button>Editar</button>
      </Link>
    </div>
  );
};
