import { Router } from 'express';
import { FunctionController } from '../controllers/functionController';

const router = Router();
const functionController = new FunctionController();

// Function routes
router.get('/functions', (req, res) => functionController.getFunctions(req, res));
router.post('/functions/execute', (req, res) => functionController.executeFunction(req, res));
router.post('/functions/parse', (req, res) => functionController.parseAndExecuteFunctions(req, res));

export default router; 