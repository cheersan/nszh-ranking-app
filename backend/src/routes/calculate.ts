import express, { Request, Response } from 'express';
import { calculate } from '../calculate';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
	try {
		const result = calculate(req.body);
		res.json(result);
	} catch (error) {
		console.error('Ошибка в /calculate:', error);
		res.status(400).json({ error: (error as Error).message });
	}
});

export default router;
