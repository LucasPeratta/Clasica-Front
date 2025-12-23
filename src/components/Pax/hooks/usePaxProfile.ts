import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getPaxById, getPaxPhotos } from "../handler";
import { iPax } from "../model";
import { PaxPhoto } from "../types/paxPhoto";

export const usePaxProfile = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [pax, setPax] = useState<iPax | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PaxPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fromFileId = (location.state as { fromFileId?: string })?.fromFileId;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getPaxById(id), getPaxPhotos(id)])
      .then(([paxData, photosData]) => {
        setPax(paxData);
        setPhotos(photosData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return {
    id,
    pax,
    loading,
    photos,
    selectedPhoto,
    setSelectedPhoto,
    fromFileId,
  };
};
