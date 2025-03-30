import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { commentValidationSchema } from "../schemas/comment.js";

/**
 * @desc Create a new comment
 * @route POST /api/comments
 * @access Private
 */
export const create = async (req, res) => {
  const { post, content, parentComment } = req.body;
  const user = req.user.id; // Assuming user ID is stored in req.user

  try {
    // Validate input data
    const { error } = commentValidationSchema.validate(
      { post, user, content, parentComment },
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

    // Check if the post exists
    const postExists = await Post.findById(post);
    if (!postExists) {
      return res
        .status(404)
        .json({ meta: { message: "Post not found", errors: true } });
    }

    // Create new comment
    const comment = await Comment.create({
      post,
      user,
      content,
      parentComment: parentComment || null,
    });

    res.status(201).json({
      meta: { message: "Comment added successfully" },
      data: { comment },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      meta: {
        message: "Error creating comment",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Get all comments for a post (with replies)
 * @route GET /api/comments?post=&page=&limit=
 * @access Public
 */
export const list = async (req, res) => {
  const { post, page = 1, limit = 5 } = req.query;

  try {
    if (!post) {
      return res.status(400).json({
        meta: { message: "Post ID is required", errors: true },
      });
    }

    const skip = (page - 1) * limit;

    // Fetch parent comments (top-level comments)
    const comments = await Comment.find({ post, parentComment: null })
      .populate("user", "fullName avatar")
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(Number(limit))
      .select("-__v"); // Exclude __v field

    // Extract comment IDs for fetching replies
    const commentIds = comments.map((c) => c._id);

    // Fetch replies for the above comments
    const replies = await Comment.find({ parentComment: { $in: commentIds } })
      .populate("user", "fullName avatar")
      .sort({ createdAt: 1 }) // Sort replies by oldest first
      .select("-__v");

    // Format comments and include their respective replies
    const commentWithReplies = comments.map((comment) => {
      const cleanComment = comment.toObject();
      cleanComment.id = cleanComment._id; // Rename _id to id
      delete cleanComment._id; // Remove _id field

      // Attach replies to each comment
      cleanComment.replies = replies
        .filter((reply) => reply.parentComment.equals(comment._id))
        .map((reply) => {
          const cleanReply = reply.toObject();
          cleanReply.id = cleanReply._id;
          delete cleanReply._id;
          return cleanReply;
        });

      return cleanComment;
    });

    // Count total number of parent comments (excluding replies)
    const total = await Comment.countDocuments({ post, parentComment: null });

    res.status(200).json({
      meta: {
        message: "Comments fetched successfully",
      },
      data: {
        comments: commentWithReplies,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          perPage: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      meta: {
        message: "Error fetching comments",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Delete a comment
 * @route DELETE /api/comments/:id
 * @access Private
 */
export const remove = async (req, res) => {
  const { id } = req.params;
  const user = req.user.id; // Assuming user ID is stored in req.user

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res
        .status(404)
        .json({ meta: { message: "Comment not found", errors: true } });
    }

    // Check if the user owns the comment
    if (comment.user.toString() !== user) {
      return res
        .status(403)
        .json({ meta: { message: "Unauthorized", errors: true } });
    }

    await comment.deleteOne();
    res.status(200).json({ meta: { message: "Comment deleted successfully" } });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      meta: {
        message: "Error deleting comment",
        errors: error.message || error,
      },
    });
  }
};

/**
 * @desc Like or unlike a comment
 * @route POST /api/comments/:id/like
 * @access Private
 */
export const toggleLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming user ID is stored in req.user

  try {
    const comment = await Comment.findById(id);

    if (!comment) {
      return res
        .status(404)
        .json({ meta: { message: "Comment not found", errors: true } });
    }

    await comment.toggleLike(userId);
    res.status(200).json({
      meta: { message: "Like status updated successfully" },
      data: { likes: comment.likes.length },
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({
      meta: {
        message: "Error toggling like",
        errors: error.message || error,
      },
    });
  }
};
