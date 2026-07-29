import type {
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from "@/types/note";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const body = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!response.ok || !body.success) {
    const message = body.success
      ? `Request failed with status ${response.status}`
      : body.message;
    throw new ApiRequestError(message, response.status);
  }

  return body.data;
}

export const notesApi = {
  list(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<Note[]>(`/notes${params}`);
  },

  get(id: number) {
    return request<Note>(`/notes/${id}`);
  },

  create(input: CreateNoteInput) {
    return request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: UpdateNoteInput) {
    return request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  delete(id: number) {
    return request<null>(`/notes/${id}`, {
      method: "DELETE",
    });
  },
};
