import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 255,
    },
    thumbnail: { type: String, default: "" },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 500,
    },
    content: { type: String, required: true, minlength: 50 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: { type: Number, default: 0 },
    slug: { type: String, unique: true },
  },
  { timestamps: true }
);

postSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

postSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

postSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

const Post = mongoose.model("Post", postSchema);
export default Post;
