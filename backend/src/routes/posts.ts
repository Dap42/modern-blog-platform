import express, { Request, Response, NextFunction } from "express";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import Joi from "joi";
import sqlite3, { RunResult } from "sqlite3";

// Extend Express Request interface to include db
declare global {
  namespace Express {
    interface Request {
      db: sqlite3.Database;
    }
  }
}

const router = express.Router();

// Setup DOMPurify
const window = new JSDOM("").window;
const DOMPurifyServer = DOMPurify(window as any); // Cast to any to resolve type incompatibility

// Validation schemas
const createPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).max(10000).required(),
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).max(10000).required(),
});

// Types
interface Post {
  id: number;
  title: string;
  content: string;
  content_html: string;
  created_at: string;
  updated_at: string;
}

interface CreatePostRequest {
  title: string;
  content: string;
}

// Helper functions for SQLite async operations
const runAsync = (db: sqlite3.Database, sql: string, params: any[] = []) => {
  return new Promise<RunResult>((resolve, reject) => {
    db.run(sql, params, function (this: RunResult, err: Error | null) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const getAsync = <T>(db: sqlite3.Database, sql: string, params: any[] = []) => {
  return new Promise<T | undefined>((resolve, reject) => {
    db.get<T>(sql, params, (err: Error | null, row: T) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allAsync = <T>(db: sqlite3.Database, sql: string, params: any[] = []) => {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: T[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Middleware to get database
const getDb = (req: Request, res: Response, next: NextFunction) => {
  req.db = (req.app as any).locals.db;
  next();
};

// Sanitize and convert markdown to HTML
const processMarkdown = async (markdown: string): Promise<string> => {
  const html = await marked(markdown, {
    breaks: true,
    gfm: true,
  });
  return DOMPurifyServer.sanitize(html);
};

// GET /api/posts - List all posts
router.get("/", getDb, async (req: Request, res: Response) => {
  try {
    const db = req.db;
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const posts = await new Promise<Post[]>((resolve, reject) => {
      db.all(
        "SELECT * FROM posts ORDER BY created_at DESC",
        (err, rows: Post[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    return res.json({
      success: true,
      data: posts,
      count: posts.length,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      error: "Failed to fetch posts",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

// POST /api/posts - Create a new post
router.post("/", getDb, async (req: Request, res: Response) => {
  const db = req.db;
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  // Validate request body
  const { error, value } = createPostSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details.map((detail) => detail.message),
    });
  }

  const { title, content }: CreatePostRequest = value;
  const contentHtml = await processMarkdown(content);

  // Insert post into database
  const result = await runAsync(
    db,
    `INSERT INTO posts (title, content, content_html) VALUES (?, ?, ?)`,
    [title, content, contentHtml]
  );

  // Get the created post
  const createdPost = await getAsync<Post>(
    db,
    "SELECT * FROM posts WHERE id = ?",
    [result.lastID]
  );

  if (!createdPost) {
    return res.status(500).json({ error: "Failed to retrieve created post" });
  }

  return res.status(201).json({
    success: true,
    data: createdPost,
    message: "Post created successfully",
  });
});

// GET /api/posts/:id - Get a single post
router.get("/:id", getDb, async (req: Request, res: Response) => {
  try {
    const db = req.db;
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const { id } = req.params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await getAsync<Post>(db, "SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({
      error: "Failed to fetch post",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

// PUT /api/posts/:id - Update a post
router.put("/:id", getDb, async (req: Request, res: Response) => {
  try {
    const db = req.db;
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const { id } = req.params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    // Validate request body
    const { error, value } = updatePostSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => detail.message),
      });
    }

    const { title, content }: CreatePostRequest = value;
    const contentHtml = await processMarkdown(content);

    const result = await runAsync(
      db,
      `UPDATE posts SET title = ?, content = ?, content_html = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [title, content, contentHtml, postId]
    );

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ error: "Post not found or no changes made" });
    }

    // Get the updated post
    const updatedPost = await getAsync<Post>(
      db,
      "SELECT * FROM posts WHERE id = ?",
      [postId]
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Updated post not found" });
    }

    return res.json({
      success: true,
      data: updatedPost,
      message: "Post updated successfully",
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({
      error: "Failed to update post",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

// DELETE /api/posts/:id - Delete a post
router.delete("/:id", getDb, async (req: Request, res: Response) => {
  try {
    const db = req.db;
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const { id } = req.params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const result = await runAsync(db, "DELETE FROM posts WHERE id = ?", [
      postId,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({
      error: "Failed to delete post",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

export default router;
