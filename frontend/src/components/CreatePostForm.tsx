"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import MarkdownTips from "./MarkdownTips";

interface Post {
  id: string;
  title: string;
  content: string;
}

interface CreatePostFormProps {
  onPostCreated: () => void;
  onCancel: () => void;
  post?: Post | null; // Optional post prop for editing, now allows null
}

interface FormData {
  title: string;
  content: string;
}

export default function CreatePostForm({
  onPostCreated,
  onCancel,
  post,
}: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const POST_VALIDATION_RULES = {
    title: {
      required: "Title is required",
      minLength: { value: 1, message: "Title cannot be empty" },
      maxLength: {
        value: 200,
        message: "Title must be less than 200 characters",
      },
    },
    content: {
      required: "Content is required",
      minLength: { value: 1, message: "Content cannot be empty" },
      maxLength: {
        value: 10000,
        message: "Content must be less than 10,000 characters",
      },
    },
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: post // Pre-fill form if post prop is provided
      ? { title: post.title, content: post.content }
      : { title: "", content: "" },
  });

  // Effect to reset form when `post` prop changes (e.g., switching from edit to new post)
  useEffect(() => {
    if (post) {
      reset({ title: post.title, content: post.content });
    } else {
      reset({ title: "", content: "" });
    }
  }, [post, reset]);

  const content = watch("content", "");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setFormError(null); // Clear any previous form errors
    try {
      if (post) {
        // Editing an existing post
        const response = await axios.put(`/api/posts/${post.id}`, {
          title: data.title,
          content: data.content,
        });
        if (response.status === 200) {
          onPostCreated(); // Assuming onPostCreated handles refresh for both create/edit
        }
      } else {
        // Creating a new post
        const response = await axios.post("/api/posts", {
          title: data.title,
          content: data.content,
        });
        if (response.status === 201) {
          reset();
          onPostCreated();
        }
      }
    } catch (error: any) {
      console.error(`Error ${post ? "updating" : "creating"} post:`, error);
      setFormError(
        `Failed to ${post ? "update" : "create"} post: ${
          error.response?.data?.message || error.message
        }. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-card max-w-4xl mx-auto p-8 rounded-3xl shadow-lg"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">
          {post ? "Edit Post" : "Create New Post"}
        </h2>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              previewMode
                ? "bg-primary-600 text-white shadow-md"
                : "glass text-primary-200 hover:text-white hover:border-primary-300"
            }`}
          >
            {previewMode ? "Edit" : "Preview"}
          </button>
          <button
            onClick={onCancel}
            className="btn-modern p-2 text-primary-300 hover:text-primary-100"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {formError && (
          <div className="p-4 bg-red-800/30 text-red-300 rounded-xl border border-red-600 mb-4">
            <p className="font-medium">{formError}</p>
          </div>
        )}

        {!previewMode ? (
          <>
            {/* Markdown Tips - Moved to the top */}
            <MarkdownTips />

            {/* Title Input */}
            <div className="mt-8">
              {" "}
              {/* Added margin-top for spacing */}
              <label
                htmlFor="title"
                className="block text-sm font-medium text-primary-100 mb-2"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                {...register("title", POST_VALIDATION_RULES.title)}
                className="input-modern w-full focus-ring"
                placeholder="Enter your post title..."
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content Input */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-primary-100 mb-2"
              >
                Content (Markdown supported)
              </label>
              <textarea
                id="content"
                rows={15}
                {...register("content", POST_VALIDATION_RULES.content)}
                className="input-modern w-full resize-y focus-ring"
                placeholder="Write your post content here... You can use Markdown!"
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.content.message}
                </p>
              )}
            </div>
          </>
        ) : (
          /* Preview Mode */
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl shadow-inner">
              <h3 className="text-2xl font-bold text-white mb-4">
                {watch("title") || "Post Title"}
              </h3>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: React.HTMLAttributes<HTMLElement> & {
                      inline?: boolean;
                      className?: string;
                      node?: any;
                    }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow as any}
                          language={match[1]} // Correctly extract language
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {/* Placeholder for empty content, rendered as a plain string */}
                  {content || "Content preview will appear here..."}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-modern flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-primary-300 hover:text-primary-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{post ? "Saving..." : "Creating..."}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{post ? "Save Changes" : "Create Post"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
