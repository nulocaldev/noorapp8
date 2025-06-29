
import React from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const getMarkdownHtml = () => {
    try {
      return marked(content);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return content;
    }
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: getMarkdownHtml() }}
    />
  );
};

export default MarkdownRenderer;
