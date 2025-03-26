import Post from "../models/post.model.js";
import Category from "../models/category.model.js";
import { postValidationSchema } from "../schemas/post.js";

/**
 * @desc Create a new post
 * @route POST /api/posts
 * @access Private
 */
export const create = async (req, res) => {
  const { title, description, content, category, tags, thumbnail, author } =
    req.body;

  try {
    // Validate request data
    const { error } = postValidationSchema.validate(
      { title, description, content, category, tags, thumbnail, author },
      { abortEarly: false }
    );
    if (error) {
      return res.status(400).json({
        meta: {
          message: "Validation errors",
          errors: error.details.map((err) => err.message),
        },
      });
    }

    // Create new post
    const post = await Post.create({
      title,
      description,
      content,
      category,
      tags: tags || [],
      thumbnail: thumbnail || "",
      author,
    });

    res.status(201).json({
      meta: { message: "Post created successfully" },
      data: { post },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      meta: {
        message: "Error creating post",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Get all posts (with pagination, category filter, search, sort)
 * @route GET /api/posts?page=&limit=&search=&sort=&category=
 * @access Public
 */
export const list = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sort = "",
    category,
    tags,
  } = req.query;

  try {
    // Create a query object for filters
    let query = {};

    // Search by post title
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Sorting options
    let sortOptions = {};
    if (sort === "date") {
      sortOptions.createdAt = -1; // Sort by newest first
    } else if (sort === "-date") {
      sortOptions.createdAt = 1; // Sort by oldest first
    } else if (sort === "title") {
      sortOptions.title = 1; // Sort by title (A-Z)
    } else if (sort === "-title") {
      sortOptions.title = -1; // Sort by title (Z-A)
    } else if (sort === "views") {
      sortOptions.views = -1; // Sort by most views first
    } else if (sort === "-views") {
      sortOptions.views = 1; // Sort by least views first
    }

    // Fetch posts with filters, pagination, and sorting
    const posts = await Post.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("category", "name")
      .populate("author", "fullName");

    // Count total posts based on the query
    const totalPosts = await Post.countDocuments(query);

    // Response
    res.status(200).json({
      meta: { message: "Post list retrieved successfully" },
      data: {
        posts,
        pagination: {
          itemsPerPage: parseInt(limit),
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / limit),
          totalItems: totalPosts,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      meta: {
        message: "Error retrieving post list",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Get post by slug
 * @route GET /api/posts/:slug
 * @access Public
 */
export const show = async (req, res) => {
  const { slug } = req.params;

  try {
    // Find post by slug
    const post = await Post.findOne({ slug })
      .populate("category", "name")
      .populate("author", "fullName");

    if (!post) {
      return res
        .status(404)
        .json({ meta: { message: "Post not found", errors: true } });
    }

    // Increment views count
    await post.incrementViews();

    res.status(200).json({
      meta: { message: "Post retrieved successfully" },
      data: { post },
    });
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    res.status(500).json({
      meta: {
        message: "Error retrieving post",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Update post
 * @route PUT /api/posts/:id
 * @access Private
 */
export const update = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, category, tags, thumbnail, author } =
    req.body;

  try {
    // Validate request data
    const { error } = postValidationSchema.validate(
      { title, description, content, category, tags, thumbnail, author },
      { abortEarly: false }
    );

    if (error) {
      return res.status(400).json({
        meta: {
          message: "Validation errors",
          errors: error.details.map((err) => err.message),
        },
      });
    }

    // Check if category exists
    const categoryRef = await Category.findById(category);
    if (!categoryRef) {
      return res
        .status(404)
        .json({ meta: { message: "Category does not exist", errors: true } });
    }

    // Update post
    const post = await Post.findByIdAndUpdate(
      id,
      { title, description, content, category, tags, thumbnail },
      { new: true }
    ).populate("category", "name").populate("author", "fullName");

    if (!post) {
      return res
        .status(404)
        .json({ meta: { message: "Post not found", errors: true } });
    }

    res.status(200).json({
      meta: { message: "Post updated successfully" },
      data: { post },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      meta: {
        message: "Error updating post",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Delete post
 * @route DELETE /api/posts/:id
 * @access Private
 */
export const remove = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res
        .status(404)
        .json({ meta: { message: "Post not found", errors: true } });
    }

    res.status(200).json({
      meta: { message: "Post deleted successfully" },
      data: { post: null },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      meta: {
        message: "Error deleting post",
        errors: error.message || error,
      },
    });
  }
};
