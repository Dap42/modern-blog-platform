import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownTips = [
  { syntax: "**text**", description: "Bold text", effect: "**bold**" },
  { syntax: "*text*", description: "Italic text", effect: "*italic*" },
  {
    syntax: "- List item",
    description: "Lists",
    effect: "- List item 1\\n- List item 2",
  },
  {
    syntax: "[link text](url)",
    description: "Links",
    effect: "[Example Link](https://example.com)",
  },
  {
    syntax: "`inline code`",
    description: "Inline code",
    effect: "`const x = 1;`",
  },
  {
    syntax: "```js\\n// code\\n```",
    description: "Code blocks",
    effect: '```js\\nconsole.log("Hello");\\n```',
  },
];

const MarkdownTips: React.FC = () => {
  return (
    <div className="glass-card p-5 rounded-2xl border-primary-700/20 shadow-inner">
      <h4 className="text-base font-semibold text-white mb-3">
        Markdown Tips:
      </h4>
      <div className="text-sm text-primary-200/80 space-y-2">
        {markdownTips.map((tip, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-2 items-baseline"
          >
            <div className="flex items-center space-x-2">
              <span className="text-primary-300">•</span>
              <code className="text-accent-400 bg-primary-700/30 px-1 py-0.5 rounded whitespace-pre-wrap">
                {tip.syntax}
              </code>
            </div>
            <p className="text-primary-200/80">{tip.description}:</p>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {tip.effect}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarkdownTips;
