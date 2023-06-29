import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getServiceById } from "./handler";
import { IService } from "./model";
export const ServiceProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [Service, setService] = useState<IService | null>(null);

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
      <h1>{Service.provider}</h1>
      <p>Precio Neto: {Service.neto}</p>
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
