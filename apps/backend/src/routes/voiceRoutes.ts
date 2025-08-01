import { Router } from 'express';
import { VoiceController } from '../controllers/voiceController';

const router = Router();
const voiceController = new VoiceController();

// Voice input routes
router.post('/voice/transcribe', (req, res) => voiceController.transcribeAudio(req, res));
router.get('/voice/status', (req, res) => voiceController.checkWhisperStatus(req, res));

export default router; 