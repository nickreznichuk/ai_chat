import axios from 'axios';

// Define function schemas
export interface FunctionSchema {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

export interface FunctionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class FunctionService {
  private functions: Map<string, (args: any) => Promise<FunctionResult>> = new Map();

  constructor() {
    this.registerDefaultFunctions();
  }

  private registerDefaultFunctions() {
    // Weather function
    this.registerFunction('get_weather', {
      name: 'get_weather',
      description: 'Get current weather information for a specific location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA'
          }
        },
        required: ['location']
      }
    }, this.getWeather.bind(this));

    // Email function
    this.registerFunction('send_email', {
      name: 'send_email',
      description: 'Send an email to a specified recipient',
      parameters: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Email address of the recipient'
          },
          subject: {
            type: 'string',
            description: 'Subject of the email'
          },
          body: {
            type: 'string',
            description: 'Body content of the email'
          }
        },
        required: ['to', 'subject', 'body']
      }
    }, this.sendEmail.bind(this));

    // Calendar function
    this.registerFunction('add_calendar_event', {
      name: 'add_calendar_event',
      description: 'Add an event to the user\'s calendar',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the calendar event'
          },
          start_time: {
            type: 'string',
            description: 'Start time of the event (ISO 8601 format)'
          },
          end_time: {
            type: 'string',
            description: 'End time of the event (ISO 8601 format)'
          },
          description: {
            type: 'string',
            description: 'Description of the event'
          }
        },
        required: ['title', 'start_time', 'end_time']
      }
    }, this.addCalendarEvent.bind(this));

    // File operations
    this.registerFunction('list_files', {
      name: 'list_files',
      description: 'List all files in the current chat',
      parameters: {
        type: 'object',
        properties: {
          chat_id: {
            type: 'string',
            description: 'ID of the chat to list files for'
          }
        },
        required: ['chat_id']
      }
    }, this.listFiles.bind(this));

    this.registerFunction('search_files', {
      name: 'search_files',
      description: 'Search for content in uploaded files',
      parameters: {
        type: 'object',
        properties: {
          chat_id: {
            type: 'string',
            description: 'ID of the chat to search files in'
          },
          query: {
            type: 'string',
            description: 'Search query to find in files'
          }
        },
        required: ['chat_id', 'query']
      }
    }, this.searchFiles.bind(this));
  }

  registerFunction(name: string, schema: FunctionSchema, handler: (args: any) => Promise<FunctionResult>) {
    this.functions.set(name, handler);
  }

  getFunctionSchemas(): FunctionSchema[] {
    return Array.from(this.functions.keys()).map(name => ({
      name,
      description: this.getFunctionDescription(name),
      parameters: this.getFunctionParameters(name)
    }));
  }

  private getFunctionDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'get_weather': 'Get current weather information for a specific location',
      'send_email': 'Send an email to a specified recipient',
      'add_calendar_event': 'Add an event to the user\'s calendar',
      'list_files': 'List all files in the current chat',
      'search_files': 'Search for content in uploaded files'
    };
    return descriptions[name] || 'Unknown function';
  }

  private getFunctionParameters(name: string): any {
    const parameters: Record<string, any> = {
      'get_weather': {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA'
          }
        },
        required: ['location']
      },
      'send_email': {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Email address of the recipient'
          },
          subject: {
            type: 'string',
            description: 'Subject of the email'
          },
          body: {
            type: 'string',
            description: 'Body content of the email'
          }
        },
        required: ['to', 'subject', 'body']
      },
      'add_calendar_event': {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the calendar event'
          },
          start_time: {
            type: 'string',
            description: 'Start time of the event (ISO 8601 format)'
          },
          end_time: {
            type: 'string',
            description: 'End time of the event (ISO 8601 format)'
          },
          description: {
            type: 'string',
            description: 'Description of the event'
          }
        },
        required: ['title', 'start_time', 'end_time']
      },
      'list_files': {
        type: 'object',
        properties: {
          chat_id: {
            type: 'string',
            description: 'ID of the chat to list files for'
          }
        },
        required: ['chat_id']
      },
      'search_files': {
        type: 'object',
        properties: {
          chat_id: {
            type: 'string',
            description: 'ID of the chat to search files in'
          },
          query: {
            type: 'string',
            description: 'Search query to find in files'
          }
        },
        required: ['chat_id', 'query']
      }
    };
    return parameters[name] || {};
  }

  async executeFunction(call: FunctionCall): Promise<FunctionResult> {
    const handler = this.functions.get(call.name);
    if (!handler) {
      return {
        success: false,
        error: `Function ${call.name} not found`
      };
    }

    try {
      return await handler(call.arguments);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Function implementations
  private async getWeather(args: { location: string }): Promise<FunctionResult> {
    try {
      // Mock weather API call (in real implementation, use actual weather API)
      const weatherData = {
        location: args.location,
        temperature: Math.floor(Math.random() * 30) + 10, // Random temp between 10-40°C
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 50) + 30,
        wind_speed: Math.floor(Math.random() * 20) + 5
      };

      return {
        success: true,
        data: weatherData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get weather'
      };
    }
  }

  private async sendEmail(args: { to: string; subject: string; body: string }): Promise<FunctionResult> {
    try {
      // Mock email sending (in real implementation, use actual email service)
      console.log('Mock email sent:', {
        to: args.to,
        subject: args.subject,
        body: args.body
      });

      return {
        success: true,
        data: {
          message: 'Email sent successfully',
          to: args.to,
          subject: args.subject
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  private async addCalendarEvent(args: { 
    title: string; 
    start_time: string; 
    end_time: string; 
    description?: string 
  }): Promise<FunctionResult> {
    try {
      // Mock calendar event creation (in real implementation, use actual calendar API)
      const event = {
        id: `event_${Date.now()}`,
        title: args.title,
        start_time: args.start_time,
        end_time: args.end_time,
        description: args.description || '',
        created_at: new Date().toISOString()
      };

      console.log('Mock calendar event created:', event);

      return {
        success: true,
        data: event
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create calendar event'
      };
    }
  }

  private async listFiles(args: { chat_id: string }): Promise<FunctionResult> {
    try {
      // This will be implemented to work with the FileService
      // For now, return mock data
      const files = [
        {
          id: 'file_1',
          name: 'document.pdf',
          size: '2.5 MB',
          uploaded_at: new Date().toISOString()
        }
      ];

      return {
        success: true,
        data: { files }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list files'
      };
    }
  }

  private async searchFiles(args: { chat_id: string; query: string }): Promise<FunctionResult> {
    try {
      // This will be implemented to work with the FileService
      // For now, return mock data
      const results = [
        {
          file_id: 'file_1',
          file_name: 'document.pdf',
          matches: [
            {
              text: 'Found relevant content about ' + args.query,
              page: 1
            }
          ]
        }
      ];

      return {
        success: true,
        data: { results, query: args.query }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search files'
      };
    }
  }
} 