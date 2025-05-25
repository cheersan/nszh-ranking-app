import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import projectRoutes from './routes/projects';
import referenceRoutes from './routes/reference';
import calculateRouter from './routes/calculate';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error('Global error handler:', err?.message || err);
	res.status(500).json({ error: 'Internal server error' });
});

app.use('/', referenceRoutes);
app.use('/projects', projectRoutes);
app.use('/calculate', calculateRouter);

app.listen(PORT, () => {
	console.log(`Backend запущен на http://localhost:${PORT}`);
});
