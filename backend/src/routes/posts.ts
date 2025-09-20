import express, { Request, Response, NextFunction } from "express";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import Joi from "joi";
import sqlite3 from "sqlite3";

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
const DOMPurifyServer = DOMPurify(window);

// Validation schemas
const createPostSchema = Joi.object({
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

// Middleware to get database
const getDb = (req: Request, res: Response, next: NextFunction) => {
  req.db = (req.app as any).locals.db;
  next();
};

// Sanitize and convert markdown to HTML
const processMarkdown = (markdown: string): string => {
  const html = marked(markdown, {
    breaks: true,
    gfm: true,
  });
  return DOMPurifyServer.sanitize(html);
};

// GET /api/posts - List all posts
router.get("/", getDb, (req: Request, res: Response) => {
  const db = req.db;
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  db.all(
    "SELECT * FROM posts ORDER BY created_at DESC",
    (err, rows: Post[]) => {
      if (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({
          error: "Failed to fetch posts",
          details: process.env.NODE_ENV === "development" ? err : undefined,
        });
      }

      res.json({
        success: true,
        data: rows,
        count: rows.length,
      });
    }
  );
});

// POST /api/posts - Create a new post
router.post("/", getDb, (req: Request, res: Response) => {
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
  const contentHtml = processMarkdown(content);

  // Insert post into database
  db.run(
    `INSERT INTO posts (title, content, content_html) VALUES (?, ?, ?)`,
    [title, content, contentHtml],
    function (err) {
      if (err) {
        console.error("Error creating post:", err);
        return res.status(500).json({
          error: "Failed to create post",
          details: process.env.NODE_ENV === "development" ? err : undefined,
        });
      }

      // Get the created post
      db.get<Post>(
        "SELECT * FROM posts WHERE id = ?",
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error("Error fetching created post:", err);
            return res.status(500).json({
              error: "Failed to fetch created post",
              details: process.env.NODE_ENV === "development" ? err : undefined,
            });
          }

          res.status(201).json({
            success: true,
            data: row,
            message: "Post created successfully",
          });
        }
      );
    }
  );
});

// GET /api/posts/:id - Get a single post
router.get("/:id", getDb, (req: Request, res: Response) => {
  const db = req.db;
  if (!db) {
    return res.status(500).json({ error: "Database not available" });
  }

  const { id } = req.params;
  const postId = parseInt(id, 10);

  if (isNaN(postId)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  db.get<Post>("SELECT * FROM posts WHERE id = ?", [postId], (err, row) => {
    if (err) {
      console.error("Error fetching post:", err);
      return res.status(500).json({
        error: "Failed to fetch post",
        details: process.env.NODE_ENV === "development" ? err : undefined,
      });
    }

    if (!row) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({
      success: true,
      data: row,
    });
  });
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

    const result = await db.run("DELETE FROM posts WHERE id = ?", [postId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      error: "Failed to delete post",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

export default router;
