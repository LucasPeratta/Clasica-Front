import { iFile } from "../model";

export const getFile = async (): Promise<iFile[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/file");
    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const deleteFile = async (id: string): Promise<void> => {
  try {
    await fetch(`http://localhost:3001/api/file/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
  }
};

export const getFileById = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/file/${id}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const createFile = async (
  formData: iFile,
  paxIds: string[],
  serviceIds: string[]
): Promise<Response> => {
  try {
    const file = {
      formData,
      paxIds,
      serviceIds,
    };
    const response = await fetch("http://localhost:3001/api/file/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(file),
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateFile = async (
  idFile: string,
  formData: iFile,
  paxIds: string[],
  serviceIds: string[]
): Promise<Response> => {
  try {
    const updateData = {
      formData,
      paxIds,
      serviceIds,
    };

    const response = await fetch(
      `http://localhost:3001/api/file/update/${idFile}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    return response;
  } catch (error) {
    console.error("Network error:", error);
    throw error;
  }
};
