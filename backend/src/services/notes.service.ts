import type { NotesRepository } from "../repositories/notes.repository";
import type {
  CreateNoteInput,
  Note,
  NoteListQuery,
  UpdateNoteInput,
} from "../types/note";

export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  listNotes(query: NoteListQuery = {}): Promise<Note[]> {
    return this.notesRepository.findAll(query);
  }

  async getNote(id: number): Promise<Note> {
    const note = await this.notesRepository.findById(id);

    if (!note) {
      throw new NoteNotFoundError(id);
    }

    return note;
  }

  createNote(input: CreateNoteInput): Promise<Note> {
    return this.notesRepository.create(input);
  }

  async updateNote(id: number, input: UpdateNoteInput): Promise<Note> {
    const note = await this.notesRepository.update(id, input);

    if (!note) {
      throw new NoteNotFoundError(id);
    }

    return note;
  }

  async deleteNote(id: number): Promise<void> {
    const deleted = await this.notesRepository.delete(id);

    if (!deleted) {
      throw new NoteNotFoundError(id);
    }
  }
}

export class NoteNotFoundError extends Error {
  constructor(public readonly id: number) {
    super(`Note with id ${id} not found`);
    this.name = "NoteNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
