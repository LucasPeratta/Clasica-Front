import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFileById } from "../handler";
import { iFile } from "../model";

export const useFileProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [file, setFile] = useState<iFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getFileById(id)
      .then((data) => {
        setFile(data);
        setLoading(false);
      })
      .catch((e) => console.error(e));
  }, [id]);

  return {
    id,
    file,
    loading,
  };
};
