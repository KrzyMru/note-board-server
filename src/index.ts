import express from 'express';
import cookieParser from 'cookie-parser';
import env from "dotenv";
import authRouter from "./routers/auth/auth-router";
import noteRouter from "./routers/note/note-router";
import categoryRouter from "./routers/category/category-router";

env.config();
const ACCEPTED_ORIGIN = process.env.ACCEPTED_ORIGIN;
if (!ACCEPTED_ORIGIN)
    throw new Error("Accepted origin is not defined in environment variables");
const PORT = process.env.PORT || 8081;

const app = express();
app.use(cookieParser());
app.use(express.json());

var cors = require('cors');
app.use(cors({
    origin: ACCEPTED_ORIGIN,
    credentials: true
}));

app.use(authRouter);
app.use(noteRouter);
app.use(categoryRouter);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

