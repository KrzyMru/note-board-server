interface Category {
    name: string,
    backgroundColor: string,
    nameColor: string,
    userId: number,
}

interface CategorySnippet {
    id: number,
    name: string,
    backgroundColor: string,
    nameColor: string,
}

interface DatabaseCategory extends Category {
    id: number,
}

interface CreateCategoryBody {
    name: string,
    backgroundColor: string,
    nameColor: string,
}

interface UpdateCategoryBody extends DatabaseCategory {

}

export type {
    Category, CategorySnippet, DatabaseCategory,
    CreateCategoryBody, UpdateCategoryBody,
}