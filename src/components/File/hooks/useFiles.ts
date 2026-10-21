import { getFilePage, deleteFile } from "../handler";
import { usePaginatedList } from "../../common/Pagination/usePaginatedList";

export type FileTab = "current" | "finished";

// La pestaña se guarda en la URL (?tab=finished); por defecto, vigentes
const TAB_FILTER = { key: "tab", defaultValue: "current" };

export const useFiles = () => {
  const list = usePaginatedList(getFilePage, TAB_FILTER);

  const handleDelete = async (id: string) => {
    await deleteFile(id);
    list.reload();
  };

  return {
    ...list,
    files: list.items,
    tab: list.filter as FileTab,
    setTab: list.setFilter,
    handleDelete,
  };
};
