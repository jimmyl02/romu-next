import { clsx } from "clsx";
import React from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";

import { Check } from "lucide-react";
import remarkGfm from "remark-gfm";

interface ArticleRendererProps {
  content: string;
}

const ArticleRenderer: React.FC<ArticleRendererProps> = ({ content }) => {
  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1
        className="text-3xl md:text-4xl font-bold mt-6 mb-6 text-gray-900 leading-tight tracking-tight"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="text-2xl md:text-3xl font-bold mt-6 mb-5 text-gray-900 leading-snug"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="text-xl md:text-2xl font-semibold mt-6 mb-4 text-gray-900 leading-snug"
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        className="text-lg md:text-xl font-semibold mt-6 mb-3 text-gray-900"
        {...props}
      >
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p
        className="text-lg leading-relaxed text-gray-800 mb-6 last:mb-0"
        {...props}
      >
        {children}
      </p>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-6 py-2 my-8 italic text-xl text-gray-700 bg-gray-50/50 rounded-r-lg"
        {...props}
      >
        {children}
      </blockquote>
    ),
    ul: ({ children, className, ...props }) => {
      const isTaskList = className?.includes('contains-task-list');
      return (
        <ul 
          className={clsx(
            "mb-6 space-y-2 text-gray-800 text-lg",
            isTaskList ? "list-none ml-0" : "list-disc list-outside ml-6 marker:text-gray-400"
          )} 
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-gray-800 text-lg marker:text-gray-400" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, className, ...props }) => {
      // Check if this li contains a task list item (checkbox)
      // In remark-gfm, task list items often have className="task-list-item"
      const isTaskListItem = className?.includes('task-list-item');
      return (
        <li className={clsx("pl-2", isTaskListItem && "flex items-start -ml-2")} {...props}>
          {children}
        </li>
      );
    },
    input: ({ type, checked, ...props }) => {
      if (type === "checkbox") {
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 mt-1 mr-3 border border-gray-300 rounded bg-white shrink-0">
            {checked ? (
              <Check className="w-3.5 h-3.5 text-gray-900" strokeWidth={3} />
            ) : (
              null
            )}
          </span>
        );
      }
      return <input type={type} checked={checked} {...props} />;
    },
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="text-gray-900 underline decoration-gray-400 underline-offset-4 hover:decoration-gray-900 transition-all decoration-1"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    ),
    code: ({ className, children, ...props }: any) => {
      const isInline = !className;
      return isInline ? (
        <code
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code className={clsx("block p-4 overflow-x-auto text-sm", className)} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden my-8 border border-gray-800 shadow-sm"
        {...props}
      >
        {children}
      </pre>
    ),
    hr: ({ ...props }) => (
      <hr className="my-12 border-gray-200" {...props} />
    ),
    img: ({ src, alt, ...props }) => (
      <figure className="my-10">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto rounded-lg shadow-md"
          {...props}
        />
        {alt && (
          <figcaption className="text-center text-sm text-gray-500 mt-3 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
  };

  return (
    <div className="font-serif">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>
    </div>
  );
};

export default ArticleRenderer;
