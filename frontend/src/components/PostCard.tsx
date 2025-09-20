"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Trash2, ExternalLink, PencilLine } from "lucide-react";
import axios from "axios";

interface Post {
  id: string;
  title: string;
  content: string;
  content_html: string;
  created_at: string;
  updated_at: string;
}

interface PostCardProps {
  post: Post;
  onPostDeleted: () => void;
  onEdit: (post: Post) => void; // New prop for edit functionality
}

export default function PostCard({
  post,
  onPostDeleted,
  onEdit,
}: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateContent = (html: string, maxLength: number = 200) => {
    // Simple HTML tag remover for preview
    const text = html.replace(/<[^>]*>/g, "");
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`/api/posts/${post.id}`);
      onPostDeleted();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-card group cursor-pointer"
      onClick={() => setShowFullContent(!showFullContent)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center text-sm text-white/60">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(post); // Call onEdit with the current post
              }}
              className="btn-modern p-2 text-primary-300 hover:text-primary-100"
              aria-label="Edit post"
            >
              <PencilLine className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(!showFullContent);
              }}
              className="btn-modern p-2"
              aria-label="Toggle content"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isDeleting}
              className="btn-modern p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
              aria-label="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div
            className="text-white/80 leading-relaxed prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: showFullContent
                ? post.content_html
                : truncateContent(post.content_html),
            }}
          />

          {!showFullContent &&
            post.content_html.replace(/<[^>]*>/g, "").length > 200 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullContent(true);
                }}
                className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
              >
                Read more →
              </button>
            )}

          {showFullContent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(false);
              }}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
            >
              Show less ↑
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center text-xs text-white/50">
            <span>Click to {showFullContent ? "collapse" : "expand"}</span>
            <span>Post #{post.id}</span>
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
    </motion.div>
  );
}
