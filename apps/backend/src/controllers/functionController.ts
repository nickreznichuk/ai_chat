import { Request, Response } from 'express';
import { FunctionService, FunctionCall } from '../services/functionService';

export class FunctionController {
  private functionService: FunctionService;

  constructor() {
    this.functionService = new FunctionService();
  }

  async getFunctions(req: Request, res: Response): Promise<void> {
    try {
      const functions = this.functionService.getFunctionSchemas();
      
      res.json({
        success: true,
        functions
      });
    } catch (error) {
      console.error('Error getting functions:', error);
      res.status(500).json({
        error: 'Failed to get functions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async executeFunction(req: Request, res: Response): Promise<void> {
    try {
      const { name, arguments: args } = req.body as FunctionCall;

      if (!name) {
        res.status(400).json({ error: 'Function name is required' });
        return;
      }

      const result = await this.functionService.executeFunction({ name, arguments: args || {} });
      
      res.json({
        success: result.success,
        data: result.data,
        error: result.error
      });
    } catch (error) {
      console.error('Error executing function:', error);
      res.status(500).json({
        error: 'Failed to execute function',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async parseAndExecuteFunctions(req: Request, res: Response): Promise<void> {
    try {
      const { text } = req.body;

      if (!text) {
        res.status(400).json({ error: 'Text is required' });
        return;
      }

      // Simple function detection (in real implementation, use more sophisticated parsing)
      const functionCalls = this.detectFunctionCalls(text);
      const results = [];

      for (const call of functionCalls) {
        const result = await this.functionService.executeFunction(call);
        results.push({
          function: call.name,
          arguments: call.arguments,
          result
        });
      }

      res.json({
        success: true,
        functionCalls,
        results
      });
    } catch (error) {
      console.error('Error parsing and executing functions:', error);
      res.status(500).json({
        error: 'Failed to parse and execute functions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private detectFunctionCalls(text: string): FunctionCall[] {
    const calls: FunctionCall[] = [];

    // Detect weather requests
    const weatherMatch = text.match(/погода\s+(?:в\s+)?([^.!?]+)/i);
    if (weatherMatch) {
      calls.push({
        name: 'get_weather',
        arguments: { location: weatherMatch[1].trim() }
      });
    }

    // Detect email requests
    const emailMatch = text.match(/відправити\s+емейл\s+(?:на\s+)?([^\s]+)\s+(?:з\s+темою\s+)?([^.!?]+)/i);
    if (emailMatch) {
      calls.push({
        name: 'send_email',
        arguments: {
          to: emailMatch[1],
          subject: emailMatch[2].trim(),
          body: 'Email content from AI assistant'
        }
      });
    }

    // Detect calendar requests
    const calendarMatch = text.match(/додати\s+(?:зустріч|подію)\s+(?:з\s+назвою\s+)?([^.!?]+)/i);
    if (calendarMatch) {
      const now = new Date();
      const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

      calls.push({
        name: 'add_calendar_event',
        arguments: {
          title: calendarMatch[1].trim(),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          description: 'Event created by AI assistant'
        }
      });
    }

    // Detect file operations
    const listFilesMatch = text.match(/показати\s+(?:файли|документи)/i);
    if (listFilesMatch) {
      calls.push({
        name: 'list_files',
        arguments: { chat_id: 'current' } // Will be replaced with actual chat ID
      });
    }

    const searchFilesMatch = text.match(/знайти\s+(?:в\s+файлах\s+)?([^.!?]+)/i);
    if (searchFilesMatch) {
      calls.push({
        name: 'search_files',
        arguments: {
          chat_id: 'current', // Will be replaced with actual chat ID
          query: searchFilesMatch[1].trim()
        }
      });
    }

    return calls;
  }
} 