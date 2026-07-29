import { AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDate, getPreviewText } from "@/lib/utils";
import type { Note } from "@/types/note";

interface NoteListProps {
  notes: Note[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function NoteList({
  notes,
  selectedId,
  onSelect,
  isLoading,
  isError,
  onRetry,
}: NoteListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2 rounded-lg border p-3">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Failed to load notes. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
        <FileText className="h-8 w-8" />
        <p className="text-sm">No notes yet. Create your first note.</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {notes.map((note) => (
        <button
          key={note.id}
          type="button"
          onClick={() => onSelect(note.id)}
          className={cn(
            "w-full px-4 py-3 text-left transition-colors hover:bg-accent",
            selectedId === note.id && "bg-accent",
          )}
        >
          <p className="truncate font-medium">
            {note.title.trim() || "Untitled"}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {getPreviewText(note.content)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(note.updatedAt)}
          </p>
        </button>
      ))}
    </div>
  );
}
