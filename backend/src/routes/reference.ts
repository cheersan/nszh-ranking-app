import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/alternatives', async (_req: Request, res: Response) => {
	const alternatives = await prisma.alternative.findMany();
	res.json(alternatives);
});

router.get('/criteria', async (_req: Request, res: Response) => {
	const criteria = await prisma.criterion.findMany();
	res.json(criteria);
});

export default router;
