import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getPaxById } from "./handler";
import { iPax } from "./model";
import dayjs from "dayjs";

export const PaxProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [Pax, setPax] = useState<iPax | null>(null);
  console.log(Pax?.dob);

  useEffect(() => {
    if (!id) return;
    getPaxById(id)
      .then((data) => {
        setPax(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [id]); //Indica que el efecto se ejecutará cada vez que el valor de id cambie.

  if (!Pax) {
    return <div>error</div>;
  }

  return (
    <div>
      <h1>
        {Pax.firstname} {Pax.lastname}
      </h1>
      <p>DNI: {Pax.dni}</p>
      <p>Pasaporte: {Pax.passport}</p>
      <p>Fecha de Nacimiento: {dayjs(Pax.dob).format("DD-MM-YYYY")}</p>
      <p>Direccion: {Pax.adress}</p>
      <p>Email: {Pax.email}</p>
      <p>Celular: {Pax.phoneNumber}</p>
      <p>Observaciones: {Pax.obs}</p>
      <Link to={`/paxs`}>
        <button>volver</button>
      </Link>
      <Link to={`/paxs/update/${Pax.id}`}>
        <button>Editar</button>
      </Link>
    </div>
  );
};
