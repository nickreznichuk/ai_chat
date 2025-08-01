import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for code blocks
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            );
          },
          // Custom styling for links
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                className="text-indigo-600 hover:text-indigo-800 underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          // Custom styling for tables
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children, ...props }) {
            return (
              <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold" {...props}>
                {children}
              </th>
            );
          },
          td({ children, ...props }) {
            return (
              <td className="border border-gray-300 px-4 py-2" {...props}>
                {children}
              </td>
            );
          },
          // Custom styling for blockquotes
          blockquote({ children, ...props }) {
            return (
              <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-gray-700" {...props}>
                {children}
              </blockquote>
            );
          },
          // Custom styling for lists
          ul({ children, ...props }) {
            return (
              <ul className="list-disc list-inside space-y-1" {...props}>
                {children}
              </ul>
            );
          },
          ol({ children, ...props }) {
            return (
              <ol className="list-decimal list-inside space-y-1" {...props}>
                {children}
              </ol>
            );
          },
          // Custom styling for headings
          h1({ children, ...props }) {
            return (
              <h1 className="text-2xl font-bold text-gray-900 mb-4" {...props}>
                {children}
              </h1>
            );
          },
          h2({ children, ...props }) {
            return (
              <h2 className="text-xl font-semibold text-gray-900 mb-3" {...props}>
                {children}
              </h2>
            );
          },
          h3({ children, ...props }) {
            return (
              <h3 className="text-lg font-medium text-gray-900 mb-2" {...props}>
                {children}
              </h3>
            );
          },
          // Custom styling for paragraphs
          p({ children, ...props }) {
            return (
              <p className="mb-2 leading-relaxed" {...props}>
                {children}
              </p>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 