import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import env from "dotenv";
import { AuthenticatedRequest } from "../../types";
import { AuthenticateUser } from "../../utils";
import { CreateNoteBody, DatabaseNote, Note, NoteSnippet, UpdateNoteBody } from "./types";

const router = require("express").Router();

env.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET)
    throw new Error("Token secret is not defined in environment variables");
if (!SUPABASE_URL || !SUPABASE_KEY)
    throw new Error("Supabase connection is not defined in environment variables");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

router.get("/note/snippets", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { data, error } = await supabase
        .from("note")
        .select("id, title, text, pinned, creationDate")
        .eq("userId", req.userId);

    if(error)
        res.status(500).json({ message: "Server couldn't retrieve the requested data" });
    else {
        const noteSnippets: NoteSnippet[] = data;
        res.status(200).json(noteSnippets);
    }
});

router.get("/note/:noteId", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { noteId } = req.params;

    const { data, error } = await supabase
        .from("note")
        .select("*")
        .eq("id", noteId)
        .eq("userId", req.userId)
        .single();

    if(error)
        res.status(500).json({ message: "Server couldn't retrieve the requested data" });
    else {
        const note: DatabaseNote = data;
        res.status(200).json(note);
    }
});

router.post("/note/create", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { title, text, categoryId } = req.body as CreateNoteBody;

    if(ValidateFields(title)) {
        const newNote: Note = { 
            title, 
            text, 
            userId: req.userId, 
            categoryId: categoryId, 
            pinned: false,
            creationDate: (new Date()).toISOString(),
        };

        const { data, error } = await supabase
            .from("note")
            .insert(newNote)
            .select()
            .single();

        if (error)
            res.status(500).json({ message: "Server couldn't save the new note" });
        else {
            const note: DatabaseNote = data;
            res.status(200).json({ note: note, message: "Note created successfully" });
        }
    }
    else
        res.status(400).json({ message: "At least one field has invalid format" });
});

router.put("/note/update", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const note = req.body as UpdateNoteBody;

    if(ValidateFields(note.title)) {
        const { data, error } = await supabase
            .from("note")
            .update(note)
            .eq("id", note.id)
            .eq("userId", req.userId)
            .select()
            .single();

        if (error)
            res.status(500).json({ message: "Server couldn't update the specified note" });
        else {
            const note: DatabaseNote = data;
            res.status(200).json({ note: note, message: "Note updated successfully" });
        }
    }
    else
        res.status(400).json({ message: "At least one field has invalid format" });
});

router.put("/note/:noteId/toggle-pin", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { noteId } = req.params;

    const { data: dataSelect, error } = await supabase
        .from("note")
        .select("*")
        .eq("id", noteId)
        .eq("userId", req.userId)
        .single();

    if (error)
        res.status(500).json({ message: "Server couldn't find the specified note" });
    else {
        const note: DatabaseNote = dataSelect;
        const { data: dataUpdate, error } = await supabase
            .from("note")
            .update({ pinned: !note.pinned })
            .eq("id", noteId)
            .eq("userId", req.userId)
            .select()
            .single();

        if(error)
            res.status(500).json({ message: "Server couldn't update the specified note" });
        else {
            const note: DatabaseNote = dataUpdate;
            res.status(200).json({ note: note, message: "Note updated successfully" });
        } 
    }
});


router.delete("/note/:noteId", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { noteId } = req.params;

    const { error } = await supabase
        .from("note")
        .delete()
        .eq("id", noteId)
        .eq("userId", req.userId);

    if (error)
        res.status(500).json({ message: "Server couldn't delete the specified note" });
    else 
        res.status(200).json({ message: "Note deleted successfully" });
});

const ValidateFields = (title: string) => {
    if(title.length === 0)
        return false;

    return true;
}

export default router;