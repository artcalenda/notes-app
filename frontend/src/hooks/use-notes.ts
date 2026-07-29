import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notesApi } from "@/api/notes";
import type { CreateNoteInput, UpdateNoteInput } from "@/types/note";

export const notesKeys = {
  all: ["notes"] as const,
  list: (search: string) => [...notesKeys.all, "list", search] as const,
  detail: (id: number) => [...notesKeys.all, "detail", id] as const,
};

export function useNotes(search: string) {
  return useQuery({
    queryKey: notesKeys.list(search),
    queryFn: () => notesApi.list(search || undefined),
  });
}

export function useNote(id: number | null) {
  return useQuery({
    queryKey: notesKeys.detail(id ?? 0),
    queryFn: () => notesApi.get(id!),
    enabled: id !== null,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateNoteInput }) =>
      notesApi.update(id, input),
    onSuccess: (note) => {
      queryClient.setQueryData(notesKeys.detail(note.id), note);
      void queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notesApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
  });
}
