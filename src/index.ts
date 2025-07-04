import express from 'express';
import cookieParser from 'cookie-parser';
import env from "dotenv";
import authRouter from "./routers/auth/auth-router";
import noteRouter from "./routers/note/note-router";
import categoryRouter from "./routers/category/category-router";

env.config();
const PORT = process.env.PORT || 8081;

const app = express();
app.use(cookieParser());
app.use(express.json());

var cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(authRouter);
app.use(noteRouter);
app.use(categoryRouter);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

