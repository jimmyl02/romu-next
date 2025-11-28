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
        className="mt-6 mb-6 text-3xl leading-tight font-bold tracking-tight text-gray-900 md:text-4xl"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="mt-6 mb-5 text-2xl leading-snug font-bold text-gray-900 md:text-3xl"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="mt-6 mb-4 text-xl leading-snug font-semibold text-gray-900 md:text-2xl"
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        className="mt-6 mb-3 text-lg font-semibold text-gray-900 md:text-xl"
        {...props}
      >
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p
        className="mb-6 text-lg leading-relaxed text-gray-800 last:mb-0"
        {...props}
      >
        {children}
      </p>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="my-8 rounded-r-lg border-l-4 border-gray-300 bg-gray-50/50 py-2 pl-6 text-xl text-gray-700 italic"
        {...props}
      >
        {children}
      </blockquote>
    ),
    ul: ({ children, className, ...props }) => {
      const isTaskList = className?.includes("contains-task-list");
      return (
        <ul
          className={clsx(
            "mb-6 space-y-2 text-lg text-gray-800",
            isTaskList
              ? "ml-0 list-none"
              : "ml-6 list-outside list-disc marker:text-gray-400",
          )}
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol: ({ children, ...props }) => (
      <ol
        className="mb-6 ml-6 list-outside list-decimal space-y-2 text-lg text-gray-800 marker:text-gray-400"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, className, ...props }) => {
      // Check if this li contains a task list item (checkbox)
      // In remark-gfm, task list items often have className="task-list-item"
      const isTaskListItem = className?.includes("task-list-item");
      return (
        <li
          className={clsx("pl-2", isTaskListItem && "-ml-2 flex items-start")}
          {...props}
        >
          {children}
        </li>
      );
    },
    input: ({ type, checked, ...props }) => {
      if (type === "checkbox") {
        return (
          <span className="mt-1 mr-3 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white">
            {checked ? (
              <Check className="h-3.5 w-3.5 text-gray-900" strokeWidth={3} />
            ) : null}
          </span>
        );
      }
      return <input type={type} checked={checked} {...props} />;
    },
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="text-gray-900 underline decoration-gray-400 decoration-1 underline-offset-4 transition-all hover:decoration-gray-900"
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
          className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code
          className={clsx("block overflow-x-auto p-4 text-sm", className)}
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className="my-8 overflow-hidden rounded-lg border border-gray-800 bg-gray-900 text-gray-100 shadow-sm"
        {...props}
      >
        {children}
      </pre>
    ),
    hr: ({ ...props }) => <hr className="my-12 border-gray-200" {...props} />,
    img: ({ src, alt, ...props }) => (
      <figure className="my-10">
        <img
          src={src}
          alt={alt}
          className="h-auto w-full rounded-lg shadow-md"
          {...props}
        />
        {alt && (
          <figcaption className="mt-3 text-center text-sm text-gray-500 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
  };

  return (
    <div className="font-serif">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default ArticleRenderer;
