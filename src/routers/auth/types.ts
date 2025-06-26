interface User {
    email: string,
    password: string,
}

interface DatabaseUser extends User {
    id: number,
}

interface AuthBody {
    email: string,
    password: string,
}

export type {
    User, DatabaseUser,
    AuthBody,
}