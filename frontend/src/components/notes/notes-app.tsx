import { Loader2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { NoteEditor } from "@/components/notes/note-editor";
import { NoteList } from "@/components/notes/note-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCreateNote, useNote, useNotes } from "@/hooks/use-notes";

export function NotesApp() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notesQuery = useNotes(search);
  const selectedNoteQuery = useNote(selectedId);
  const createNote = useCreateNote();

  const notes = useMemo(() => notesQuery.data ?? [], [notesQuery.data]);

  async function handleCreateNote() {
    try {
      const note = await createNote.mutateAsync({
        title: "Untitled",
        content: "",
      });
      setSelectedId(note.id);
      setSidebarOpen(false);
      toast.success("Note created");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create note",
      );
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Simple Note</h1>
          <p className="text-sm text-muted-foreground">
            Markdown notes with autosave
          </p>
        </div>
        <Button onClick={() => void handleCreateNote()} disabled={createNote.isPending}>
          {createNote.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New note
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`flex w-full flex-col border-r md:w-80 lg:w-96 ${
            sidebarOpen ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="p-3">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes…"
                className="pl-9"
              />
            </div>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <NoteList
              notes={notes}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                setSidebarOpen(false);
              }}
              isLoading={notesQuery.isLoading}
              isError={notesQuery.isError}
              onRetry={() => void notesQuery.refetch()}
            />
          </ScrollArea>
        </aside>

        <main className="min-w-0 flex-1">
          {selectedId === null ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
              <p>Select a note or create a new one to get started.</p>
              <Button variant="outline" onClick={() => void handleCreateNote()}>
                Create note
              </Button>
            </div>
          ) : selectedNoteQuery.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedNoteQuery.isError || !selectedNoteQuery.data ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-muted-foreground">Failed to load this note.</p>
              <Button
                variant="outline"
                onClick={() => void selectedNoteQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="border-b px-4 py-2 md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  Back to notes
                </Button>
              </div>
              <NoteEditor
                note={selectedNoteQuery.data}
                onDeleted={() => setSelectedId(null)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
