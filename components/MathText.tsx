import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathTextProps {
  content: string;
  className?: string;
  isInline?: boolean;
}

export const MathText: React.FC<MathTextProps> = ({ content, className, isInline }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [debouncedContent, setDebouncedContent] = useState(content);

  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedContent(content);
    }, 50);
    return () => clearTimeout(handler);
  }, [content]);

  useEffect(() => {
    // Check if MathJax is fully initialized
    if (window.MathJax && window.MathJax.typesetPromise && ref.current) {
      const timer = setTimeout(() => {
        if (ref.current) {
          window.MathJax.typesetPromise([ref.current]).catch((err: any) => {
            console.debug('MathJax error ignored during typing:', err);
          });
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [debouncedContent]);

  return (
    <div ref={ref} className={`${className || ''} ${isInline ? 'inline-block' : 'w-full'}`}>
      <ReactMarkdown
        components={isInline ? {
          p: ({node, ...props}) => <span {...props} />
        } : undefined}
      >
        {debouncedContent}
      </ReactMarkdown>
    </div>
  );
};