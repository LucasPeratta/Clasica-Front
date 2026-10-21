import { getFilePage, deleteFile } from "../handler";
import { usePaginatedList } from "../../common/Pagination/usePaginatedList";

export type FileTab = "current" | "finished";

// La pestaña se guarda en la URL (?tab=finished); por defecto, vigentes
const TAB_FILTER = { key: "tab", defaultValue: "current" };

export const useFiles = () => {
  const list = usePaginatedList(getFilePage, TAB_FILTER);

  // Devuelve true si se eliminó
  const handleDelete = async (id: string) => {
    const ok = await deleteFile(id);
    if (ok) list.reload();
    return ok;
  };

  return {
    ...list,
    files: list.items,
    tab: list.filter as FileTab,
    setTab: list.setFilter,
    handleDelete,
  };
};
