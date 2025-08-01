import React from 'react';

interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

interface FunctionResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface FunctionCallDisplayProps {
  functionCalls: FunctionCall[];
  results: Array<{
    function: string;
    arguments: Record<string, any>;
    result: FunctionResult;
  }>;
  className?: string;
}

export const FunctionCallDisplay: React.FC<FunctionCallDisplayProps> = ({
  functionCalls,
  results,
  className = ''
}) => {
  if (functionCalls.length === 0) {
    return null;
  }

  const getFunctionDisplayName = (name: string): string => {
    const displayNames: Record<string, string> = {
      'get_weather': '🌤️ Weather Check',
      'send_email': '📧 Send Email',
      'add_calendar_event': '📅 Add Calendar Event',
      'list_files': '📁 List Files',
      'search_files': '🔍 Search Files'
    };
    return displayNames[name] || name;
  };

  const formatFunctionResult = (result: FunctionResult): string => {
    if (!result.success) {
      return `❌ Error: ${result.error}`;
    }

    if (result.data) {
      if (typeof result.data === 'object') {
        return JSON.stringify(result.data, null, 2);
      }
      return String(result.data);
    }

    return '✅ Success';
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-semibold text-blue-900 mb-3">🤖 Function Calls</h4>
      <div className="space-y-3">
        {functionCalls.map((call, index) => {
          const result = results[index];
          return (
            <div key={index} className="bg-white border border-blue-200 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  {getFunctionDisplayName(call.name)}
                </span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {call.name}
                </span>
              </div>
              
              {Object.keys(call.arguments).length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-600 font-medium">Arguments:</span>
                  <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(call.arguments, null, 2)}
                  </pre>
                </div>
              )}

              {result && (
                <div>
                  <span className="text-xs text-gray-600 font-medium">Result:</span>
                  <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                    {formatFunctionResult(result.result)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 