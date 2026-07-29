import { AlertCircle, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MarkdownPreview } from "@/components/notes/markdown-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAutosave } from "@/hooks/use-autosave";
import { useDeleteNote, useUpdateNote } from "@/hooks/use-notes";
import { formatDate } from "@/lib/utils";
import type { Note } from "@/types/note";

interface NoteEditorProps {
  note: Note;
  onDeleted: () => void;
}

type ViewMode = "edit" | "preview";

export function NoteEditor({ note, onDeleted }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  const { isSaving, lastSavedAt, error } = useAutosave({
    value: { title, content },
    enabled: !updateNote.isPending,
    onSave: async (value) => {
      await updateNote.mutateAsync({
        id: note.id,
        input: value,
      });
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  async function handleDelete() {
    try {
      await deleteNote.mutateAsync(note.id);
      toast.success("Note deleted");
      onDeleted();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete note",
      );
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title"
            className="border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "edit" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode("edit")}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={viewMode === "preview" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setViewMode("preview")}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void handleDelete()}
            disabled={deleteNote.isPending}
          >
            {deleteNote.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
        {isSaving || updateNote.isPending ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </>
        ) : lastSavedAt ? (
          <>Saved {formatDate(lastSavedAt.toISOString())}</>
        ) : (
          <>Updated {formatDate(note.updatedAt)}</>
        )}
        {error && (
          <span className="inline-flex items-center gap-1 text-destructive">
            <AlertCircle className="h-3 w-3" />
            Save failed
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {viewMode === "edit" ? (
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your note in Markdown…"
            className="min-h-[calc(100vh-220px)] resize-none border-none p-0 shadow-none focus-visible:ring-0"
          />
        ) : (
          <MarkdownPreview content={content} />
        )}
      </div>
    </div>
  );
}
