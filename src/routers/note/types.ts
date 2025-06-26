interface Note {
    title: string,
    text: string,
    userId: number,
    categoryId: number|null,
}

interface NoteSnippet {
    id: number,
    title: string,
    text: string,
}

interface DatabaseNote extends Note {
    id: number,
}

interface CreateNoteBody {
    title: string,
    text: string,
}

interface UpdateNoteBody extends DatabaseNote {

}

export type {
    Note, NoteSnippet, DatabaseNote,
    CreateNoteBody, UpdateNoteBody,
}