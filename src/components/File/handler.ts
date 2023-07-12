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
    console.log("File deleted successfully");
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

export const updateFile = async (id: string, formData: iFile) => {
  try {
    const response = await fetch(`http://localhost:3001/api/file/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    // const data = await response.json();
    return response;
  } catch (error) {
    console.error("Network error:", error);
    throw error;
  }
};

export const createFile = async (formData: iFile): Promise<Response> => {
  try {
    const response = await fetch("http://localhost:3001/api/file/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addPaxToFile = async (
  fileId: string,
  paxId: string
): Promise<Response> => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/file/${fileId}/addPax`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId, paxId }),
      }
    );

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addServiceToFile = async (
  fileId: string,
  serviceId: string
): Promise<Response> => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/file/${fileId}/addService`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId, serviceId }),
      }
    );

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
