import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";

export const uploadService = {
  upload: async (file: { uri: string; name: string; type: string }, folder: string) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    formData.append("folder", folder);

    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.data;
  },
};
