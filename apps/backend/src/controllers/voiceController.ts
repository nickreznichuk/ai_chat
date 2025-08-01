import { Request, Response } from 'express';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { config } from '../config/env';
import type { VoiceInputRequest, VoiceInputResponse } from 'shared/src/types';

export class VoiceController {
  private whisperPath: string;
  private modelPath: string;

  constructor() {
    // Path to whisper.cpp executable and model
    this.whisperPath = config.whisper.path;
    // Resolve model path relative to backend root directory
    this.modelPath = resolve(__dirname, '../../', config.whisper.modelPath);
    
            console.log('Whisper configuration:');
        console.log(`  Whisper path: ${this.whisperPath}`);
        console.log(`  Model path: ${this.modelPath}`);
        console.log(`  Model exists: ${existsSync(this.modelPath)}`);
        
        // Check if ffmpeg is available
        const { execSync } = require('child_process');
        try {
          const ffmpegVersion = execSync('ffmpeg -version', { encoding: 'utf8' }).split('\n')[0];
          console.log(`  FFmpeg: ${ffmpegVersion}`);
        } catch (error) {
          console.error('  FFmpeg not found or not working:', error instanceof Error ? error.message : 'Unknown error');
        }
  }

  async transcribeAudio(req: Request, res: Response): Promise<void> {
    try {
              const { audioData, format = 'webm', language = 'en' }: VoiceInputRequest = req.body;

      if (!audioData) {
        res.status(400).json({ error: 'Audio data is required' });
        return;
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      
              // Create temporary file in backend directory
        const tempDir = resolve(__dirname, '../../temp');
        const timestamp = Date.now();
        const inputFileName = `input_${timestamp}.${format}`;
        const outputBaseName = `output_${timestamp}`;
        const inputPath = join(tempDir, inputFileName);
        const outputPath = join(tempDir, outputBaseName);
        
        console.log('File paths:');
        console.log(`  Temp directory: ${tempDir}`);
        console.log(`  Input file: ${inputPath}`);
        console.log(`  Output base: ${outputPath}`);
        console.log(`  Expected output: ${outputPath}.txt`);

        // Create temp directory if it doesn't exist
        try {
          const fs = require('fs');
          if (!existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            console.log(`  Created temp directory: ${tempDir}`);
          }
          const stats = fs.statSync(tempDir);
          console.log(`  Temp directory exists: ${stats.isDirectory()}`);
          console.log(`  Temp directory writable: ${fs.accessSync(tempDir, fs.constants.W_OK) === undefined}`);
        } catch (error) {
          console.error(`  Error with temp directory: ${error}`);
        }

                  try {
            // Write audio data to temporary file
            writeFileSync(inputPath, audioBuffer);
            console.log(`Input file written successfully: ${inputPath}`);
            console.log(`Input file size: ${audioBuffer.length} bytes`);

            // Verify file was created
            const fs = require('fs');
            if (existsSync(inputPath)) {
              const stats = fs.statSync(inputPath);
              console.log(`Input file exists: ${stats.size} bytes`);
            } else {
              console.error('Input file was not created!');
              throw new Error('Failed to create input file');
            }

            // Convert webm to wav using ffmpeg
            const wavPath = inputPath.replace('.webm', '.wav');
            console.log(`Starting conversion to WAV: ${wavPath}`);
            await this.convertWebmToWav(inputPath, wavPath);
            console.log(`Converted to WAV: ${wavPath}`);

            // Verify wav file was created
            if (existsSync(wavPath)) {
              const wavStats = fs.statSync(wavPath);
              console.log(`WAV file exists: ${wavStats.size} bytes`);
            } else {
              console.error('WAV file was not created!');
              throw new Error('Failed to create WAV file');
            }

            // Run whisper.cpp transcription with wav file
            const transcription = await this.runWhisperTranscription(wavPath, outputPath, language);

        // Read the output file
        const outputContent = transcription.trim();

        const response: VoiceInputResponse = {
          text: outputContent,
          language: language,
          confidence: 0.9, // Default confidence
          duration: 0 // Could be calculated from audio metadata
        };

        res.json(response);

      } finally {
        // Clean up temporary files
        try {
          unlinkSync(inputPath);
          // Remove wav file if it exists
          const wavPath = inputPath.replace('.webm', '.wav');
          if (existsSync(wavPath)) {
            unlinkSync(wavPath);
          }
          // Whisper creates output file with .txt extension
          const outputTxtPath = `${outputPath}.txt`;
          if (existsSync(outputTxtPath)) {
            unlinkSync(outputTxtPath);
          }
        } catch (error) {
          console.warn('Failed to clean up temporary files:', error);
        }
      }

    } catch (error) {
      console.error('Error in transcribeAudio:', error);
      res.status(500).json({ 
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private runWhisperTranscription(
    inputPath: string, 
    outputPath: string, 
    language: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = [
        '-m', this.modelPath,
        '-f', inputPath,
        '-otxt',
        '-of', outputPath,
        '-l', language
      ];

      console.log(`Running whisper with args: ${args.join(' ')}`);
      console.log(`Input path: ${inputPath}`);
      console.log(`Output base path: ${outputPath}`);
      console.log(`Expected output file: ${outputPath}.txt`);

      const whisperProcess = spawn(this.whisperPath, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      whisperProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      whisperProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      whisperProcess.on('close', (code) => {
        console.log(`Whisper process exited with code: ${code}`);
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        
        // Log all files in temp directory after whisper process
        try {
          const tempDir = join(__dirname, '../../temp');
          const files = require('fs').readdirSync(tempDir);
          console.log(`All files in temp directory after whisper: ${files.join(', ')}`);
        } catch (error) {
          console.log(`Error listing temp directory: ${error}`);
        }
        
        if (code === 0) {
          try {
            const fs = require('fs');
            // Whisper creates output file with .txt extension
            const outputTxtPath = `${outputPath}.txt`;
            console.log(`Looking for output file: ${outputTxtPath}`);
            console.log(`File exists: ${existsSync(outputTxtPath)}`);
            
            if (existsSync(outputTxtPath)) {
              const outputContent = fs.readFileSync(outputTxtPath, 'utf8');
              console.log(`Output content: ${outputContent}`);
              resolve(outputContent);
                          } else {
                // List files in temp directory to debug
                const tempDir = join(__dirname, '../../temp');
                const files = require('fs').readdirSync(tempDir);
                console.log(`Files in temp directory: ${files.join(', ')}`);
                
                // Also check if there are any .txt files
                const txtFiles = files.filter((f: string) => f.endsWith('.txt'));
                console.log(`Text files in temp directory: ${txtFiles.join(', ')}`);
                
                // Check if input file still exists
                if (existsSync(inputPath)) {
                  console.log(`Input file still exists: ${inputPath}`);
                } else {
                  console.log(`Input file was removed: ${inputPath}`);
                }
                
                reject(new Error(`Output file not found: ${outputTxtPath}`));
              }
          } catch (error) {
            reject(new Error(`Failed to read output file: ${error}`));
          }
        } else {
          reject(new Error(`Whisper process failed with code ${code}: ${stderr}`));
        }
      });

      whisperProcess.on('error', (error) => {
        reject(new Error(`Failed to start whisper process: ${error.message}`));
      });

      // Set a timeout for the transcription process
      setTimeout(() => {
        whisperProcess.kill();
        reject(new Error('Transcription timeout'));
      }, 30000); // 30 seconds timeout
    });
  }

  async checkWhisperStatus(req: Request, res: Response): Promise<void> {
    try {
      // Check if whisper.cpp is available
      const isAvailable = await this.checkWhisperAvailability();
      
      res.json({
        whisperAvailable: isAvailable,
        modelPath: this.modelPath,
        whisperPath: this.whisperPath
      });
    } catch (error) {
      console.error('Error checking whisper status:', error);
      res.status(500).json({ 
        error: 'Failed to check whisper status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async convertWebmToWav(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-i', inputPath,
        '-acodec', 'pcm_s16le',
        '-ar', '16000',
        '-ac', '1',
        outputPath
      ];

      console.log(`Running ffmpeg with args: ${ffmpegArgs.join(' ')}`);

      const ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      ffmpegProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ffmpegProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpegProcess.on('close', (code) => {
        console.log(`FFmpeg process exited with code: ${code}`);
        console.log(`FFmpeg stdout: ${stdout}`);
        console.log(`FFmpeg stderr: ${stderr}`);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg process failed with code ${code}: ${stderr}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        reject(new Error(`Failed to start ffmpeg process: ${error.message}`));
      });

      // Set a timeout for the conversion process
      setTimeout(() => {
        ffmpegProcess.kill();
        reject(new Error('FFmpeg conversion timeout'));
      }, 30000);
    });
  }

  private async checkWhisperAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      const whisperProcess = spawn(this.whisperPath, ['--help'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      whisperProcess.on('close', (code) => {
        resolve(code === 0);
      });

      whisperProcess.on('error', () => {
        resolve(false);
      });

      // Set a short timeout
      setTimeout(() => {
        whisperProcess.kill();
        resolve(false);
      }, 5000);
    });
  }
} 