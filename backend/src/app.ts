
import express from 'express';
import core from 'cors'
import authRouter from './routes/auth.routes'
import itemRouter from './routes/item.routes'

const app = express();

app.use(core());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/items', itemRouter);

export default app;
