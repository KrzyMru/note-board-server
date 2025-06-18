interface User {
    email: string,
    password: string,
}

interface DatabaseUser extends User {
    id: number,
}

export type { 
    User,
    DatabaseUser,
 }