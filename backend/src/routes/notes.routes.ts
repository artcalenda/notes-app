import { Elysia, t } from "elysia";
import {
  NoteNotFoundError,
  NotesService,
  ValidationError,
} from "../services/notes.service";
import { errorResponse, successResponse } from "../types/api-response";

const noteBodySchema = t.Object({
  title: t.Optional(t.String({ maxLength: 500 })),
  content: t.Optional(t.String({ maxLength: 100_000 })),
});

export function createNotesRoutes(notesService: NotesService) {
  return new Elysia({ prefix: "/notes" })
    .get(
      "/",
      async ({ query }) =>
        successResponse(
          await notesService.listNotes({
            search: query.search,
          }),
        ),
      {
        query: t.Object({
          search: t.Optional(t.String()),
        }),
      },
    )
    .get(
      "/:id",
      async ({ params }) =>
        successResponse(await notesService.getNote(Number(params.id))),
      {
        params: t.Object({
          id: t.Numeric({ minimum: 1 }),
        }),
      },
    )
    .post(
      "/",
      async ({ body, set }) => {
        const note = await notesService.createNote(body);
        set.status = 201;
        return successResponse(note);
      },
      {
        body: noteBodySchema,
      },
    )
    .put(
      "/:id",
      async ({ params, body }) =>
        successResponse(
          await notesService.updateNote(Number(params.id), body),
        ),
      {
        params: t.Object({
          id: t.Numeric({ minimum: 1 }),
        }),
        body: noteBodySchema,
      },
    )
    .delete(
      "/:id",
      async ({ params }) => {
        await notesService.deleteNote(Number(params.id));
        return successResponse(null);
      },
      {
        params: t.Object({
          id: t.Numeric({ minimum: 1 }),
        }),
      },
    )
    .onError(({ error, set }) => {
      if (error instanceof NoteNotFoundError) {
        set.status = 404;
        return errorResponse(error.message);
      }

      if (error instanceof ValidationError) {
        set.status = 400;
        return errorResponse(error.message);
      }

      if (error instanceof Error && error.name === "ValidationError") {
        set.status = 400;
        return errorResponse(error.message);
      }

      set.status = 500;
      return errorResponse("Internal server error");
    });
}
