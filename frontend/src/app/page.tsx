"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Moon, Sun, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import CreatePostForm from "../components/CreatePostForm";
import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  title: string;
  content: string;
  content_html: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null); // New state for editing
  const [darkMode, setDarkMode] = useState(true);

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    setShowCreateForm(false);
    setEditingPost(null); // Clear editing post after creation/update
    fetchPosts();
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setShowCreateForm(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-950 to-secondary-800 text-white font-sans">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-modern rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white animate-pulse-light" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient tracking-tight">
                  Modern Blog
                </h1>
                <p className="text-sm text-primary-200/80">
                  Beautifully crafted posts
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="btn-modern p-2 text-primary-300 hover:text-primary-100"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingPost(null); // Ensure new post form is empty
                }}
                className="btn-modern flex items-center space-x-2 text-primary-300 hover:text-primary-100"
              >
                <Plus className="w-5 h-5" />
                <span>New Post</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <CreatePostForm
              onPostCreated={handlePostCreated}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingPost(null); // Clear editing post on cancel
              }}
              post={editingPost} // Pass the post data if in edit mode
            />
          </motion.div>
        )}

        {/* Posts Grid */}
        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="glass-card max-w-md mx-auto p-10 rounded-3xl shadow-lg">
                <div className="w-20 h-20 bg-gradient-modern rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Sparkles className="w-10 h-10 text-white animate-pulse-light" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  No posts yet
                </h3>
                <p className="text-primary-200/80 mb-8">
                  Create your first blog post to get started with this beautiful
                  platform.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-modern text-primary-300 hover:text-primary-100"
                >
                  Create Your First Post
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <PostCard
                    post={post}
                    onPostDeleted={fetchPosts}
                    onEdit={handleEditPost} // Pass the handleEditPost function
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-primary-200/60">
            <p>Built with modern web technologies and beautiful design</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
