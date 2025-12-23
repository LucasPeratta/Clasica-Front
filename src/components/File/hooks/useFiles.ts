import { useState, useEffect } from "react";
import { getFile, deleteFile } from "../handler";
import { iFile } from "../model";

export const useFiles = () => {
  const [files, setFiles] = useState<iFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFile().then((data) => {
      const sorted = data.sort((a, b) =>
        a.fechaSalida && b.fechaSalida
          ? a.fechaSalida < b.fechaSalida
            ? -1
            : 1
          : 0
      );
      setFiles(sorted);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await deleteFile(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return { files, loading, handleDelete };
};
