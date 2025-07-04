import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import env from "dotenv";
import { AuthenticatedRequest } from "../../types";
import { AuthenticateUser } from "../../utils";
import { Category, CategorySnippet, CreateCategoryBody, DatabaseCategory, UpdateCategoryBody } from "./types";
import { NoteSnippet } from "../note/types";

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

router.get("/category/snippets", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { data, error } = await supabase
        .from("category")
        .select("id, name, backgroundColor, nameColor")
        .eq("userId", req.userId);

    if(error)
        res.status(500).json({ message: "Server couldn't retrieve the requested data" });
    else {
        const categorySnippets: CategorySnippet[] = data;
        res.status(200).json(categorySnippets);
    }
});

router.get("/category/:categoryId", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { categoryId } = req.params;

    const { data, error } = await supabase
        .from("category")
        .select("*")
        .eq("id", categoryId)
        .eq("userId", req.userId)
        .single();

    if(error)
        res.status(500).json({ message: "Server couldn't retrieve the requested data" });
    else {
        const category: DatabaseCategory = data;
        res.status(200).json(category);
    }
});

router.get("/category/snippet/:categoryId", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { categoryId } = req.params;

    const { data, error } = await supabase
        .from("category")
        .select("id, name, backgroundColor, nameColor")
        .eq("id", categoryId)
        .eq("userId", req.userId)
        .single();

    if(error)
        res.status(500).json({ message: "Server couldn't retrieve the requested data" });
    else {
        const categorySnippet: CategorySnippet = data;
        res.status(200).json(categorySnippet);
    }
});

router.get("/category/notes/:categoryId", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { categoryId } = req.params;

    const { data, error } = await supabase
        .from("note")
        .select("*")
        .eq("categoryId", categoryId)
        .eq("userId", req.userId);

    if(error)
        res.status(500).json({ message: "Server couldn't retrieve the requested data" });
    else {
        const noteSnippets: NoteSnippet[] = data;
        res.status(200).json(noteSnippets);
    }
});

router.post("/category/create", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { name, backgroundColor, nameColor } = req.body as CreateCategoryBody;

    if(ValidateFields(name)) {
        const newCategory: Category = { 
            name, 
            backgroundColor,
            nameColor,
            userId: req.userId,
        };

        const { data, error } = await supabase
            .from("category")
            .insert(newCategory)
            .select()
            .single();

        if (error)
            res.status(500).json({ message: "Server couldn't save the new category" });
        else 
            res.status(200).json({ category: data, message: "Category created successfully" });
    }
    else
        res.status(400).json({ message: "At least one field has invalid format" });
});

router.put("/category/update", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const category = req.body as UpdateCategoryBody;

    if(ValidateFields(category.name)) {
        const { data, error } = await supabase
            .from("category")
            .update(category)
            .eq("id", category.id)
            .eq("userId", req.userId)
            .select()
            .single();

        if (error)
            res.status(500).json({ message: "Server couldn't update the specified category" });
        else {
            res.status(200).json({ category: data, message: "Category updated successfully" });
        }
    }
    else
        res.status(400).json({ message: "At least one field has invalid format" });
});

router.delete("/category/:categoryId", AuthenticateUser, async (req: AuthenticatedRequest, res: Response) => {
    const { categoryId } = req.params;

    const { error } = await supabase
        .from("category")
        .delete()
        .eq("id", categoryId)
        .eq("userId", req.userId);

    if (error)
        res.status(500).json({ message: "Server couldn't delete the specified category" });
    else 
        res.status(200).json({ message: "Category deleted successfully" });
});

const ValidateFields = (name: string) => {
    if(name.length === 0)
        return false;

    return true;
}

export default router;