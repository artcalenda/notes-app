export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
}
