import { desc, eq, like, or } from "drizzle-orm";
import type { Db } from "../db";
import { notes } from "../db/schema";
import type {
  CreateNoteInput,
  Note,
  NoteListQuery,
  UpdateNoteInput,
} from "../types/note";

export class NotesRepository {
  constructor(private readonly db: Db) {}

  async findAll(query: NoteListQuery = {}): Promise<Note[]> {
    const search = query.search?.trim();

    const rows = search
      ? await this.db
          .select()
          .from(notes)
          .where(
            or(
              like(notes.title, `%${search}%`),
              like(notes.content, `%${search}%`),
            ),
          )
          .orderBy(desc(notes.updatedAt))
      : await this.db
          .select()
          .from(notes)
          .orderBy(desc(notes.updatedAt));

    return rows.map(mapNote);
  }

  async findById(id: number): Promise<Note | null> {
    const [row] = await this.db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    return row ? mapNote(row) : null;
  }

  async create(input: CreateNoteInput): Promise<Note> {
    const [row] = await this.db
      .insert(notes)
      .values({
        title: input.title ?? "",
        content: input.content ?? "",
      })
      .returning();

    return mapNote(row);
  }

  async update(id: number, input: UpdateNoteInput): Promise<Note | null> {
    const [row] = await this.db
      .update(notes)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(notes.id, id))
      .returning();

    return row ? mapNote(row) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.delete(notes).where(eq(notes.id, id));
    return result.changes > 0;
  }
}

function mapNote(row: typeof notes.$inferSelect): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
