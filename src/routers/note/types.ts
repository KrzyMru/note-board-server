interface Note {
    title: string,
    text: string,
    userId: number,
    categoryId: number|null,
    pinned: boolean,
    creationDate: string,
}

interface NoteSnippet {
    id: number,
    title: string,
    text: string,
    pinned: boolean,
    creationDate: string,
}

interface DatabaseNote extends Note {
    id: number,
}

interface CreateNoteBody {
    title: string,
    text: string,
    categoryId: number|null,
}

interface UpdateNoteBody extends DatabaseNote {

}

export type {
    Note, NoteSnippet, DatabaseNote,
    CreateNoteBody, UpdateNoteBody,
}