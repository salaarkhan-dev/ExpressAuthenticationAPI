import { NextFunction, Request, Response } from "express";
import Post, { IPost } from "../models/Post";
import { ErrorException } from "../errors/ErrorExceptions";
import Comment, { IComment } from "../models/Comment";
import User from "../models/User";
import cloudinary from "cloudinary";

// createPost
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { caption }: IPost = req.body;

    const pictureFiles = req.files as Array<Express.Multer.File>;
    //Check if files exist
    if (!pictureFiles)
      return res.status(400).json({ message: "No picture attached!" });
    //map through images and create a promise array using cloudinary upload function
    let multiplePicturePromise = pictureFiles.map((picture: any) =>
      cloudinary.v2.uploader.upload(picture.path)
    );
    // await all the cloudinary upload functions in promise.all, exactly where the magic happens
    let imageResponses = await Promise.all(multiplePicturePromise);
    let filteredResponse = imageResponses.map((img) => {
      return {
        public_id: img.public_id,
        url: img.secure_url,
      };
    });

    const newPost = await Post.create({
      user: req.user._id,
      caption,
      images: filteredResponse,
    });
    const post = await newPost.populate("user").execPopulate();
    return res.status(201).json({
      success: true,
      post,
    });
  } catch (err) {
    return next(
      new ErrorException("Error occured while creating post", 403, err)
    );
  }
};

// updatePost /:postId
export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { caption }: IPost = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return next(new ErrorException("Couldn't find the post", 403));

    if (post.user.toString() === req.user._id.toString()) {
      const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $set: { caption } },
        { new: true, useFindAndModify: false }
      ).populate("user");
      return res.status(200).json({
        success: true,
        post: updatedPost,
      });
    } else {
      return next(new ErrorException("You can only edit your own posts.", 401));
    }
  } catch (err) {
    return next(new ErrorException("Error occured while updating post", 401));
  }
};
// deletePost /:postId
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(new ErrorException("Couldn't find the post", 403));

    if (post.user.toString() === req.user._id.toString()) {
      await post.delete();
      return res.status(204).json({ success: true });
    } else {
      return next(
        new ErrorException("You can only delete your own posts.", 401)
      );
    }
  } catch (err) {
    return next(new ErrorException("Error occured while deleting post", 401));
  }
};
// getPost /:postId/post
export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate({
        path: "comments",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .populate("user");
    if (!post) return next(new ErrorException("Couldn't find the post", 403));

    return res.status(200).json({ success: true, post });
  } catch (err) {
    return next(
      new ErrorException("Error occured while fetching post", 401, err)
    );
  }
};
// getFeed
export const getFeed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const LIMIT: number = 10;
    const { page = 1 as number } = req.query;
    const totalCount = await Post.countDocuments();

    const feed = await Post.find({
      $or: [{ user: req.user._id }, { user: { $in: req.user.followings } }],
    })
      .populate("user")
      .limit(LIMIT * 1)
      .skip((+page - 1) * LIMIT)
      .sort("-createdAt")
      .exec();

    return res.status(200).json({
      success: true,
      totalPages: Math.ceil(totalCount / LIMIT),
      currentPage: +page,
      totalCount,
      feed,
    });
  } catch (err) {
    return next(
      new ErrorException("Error occured while fetching feed.", 401, err)
    );
  }
};
// getUserPost /:username
export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const LIMIT: number = 20;
    const { page = 1 as number } = req.query;

    const user = await User.findOne({ username: req.params.username });

    const userPosts: IPost[] = await Post.find({ user: user?._id })
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .limit(LIMIT * 1)
      .skip((+page - 1) * LIMIT)
      .sort("-createdAt")
      .exec();
    if (!userPosts) return next(new ErrorException("No Posts found yet!", 403));

    const totalCount = userPosts.length;
    return res.status(200).json({
      success: true,
      totalPages: Math.ceil(totalCount / LIMIT),
      currentPage: +page,
      totalCount,
      userPosts,
    });
  } catch (err) {
    return next(
      new ErrorException("Error occured while fetching user's feed.", 401, err)
    );
  }
};
// getUserFeed
export const getUserFeed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const LIMIT: number = 20;
    const { page = 1 as number } = req.query;

    const userFeed: IPost[] = await Post.find({ user: req.user._id })
      .populate("user")
      .limit(LIMIT * 1)
      .skip((+page - 1) * LIMIT)
      .sort("-createdAt")
      .exec();
    if (!userFeed) return next(new ErrorException("No Posts found yet!", 403));

    const totalCount = userFeed.length;
    return res.status(200).json({
      success: true,
      totalPages: Math.ceil(totalCount / LIMIT),
      currentPage: +page,
      totalCount,
      userFeed,
    });
  } catch (err) {
    return next(
      new ErrorException("Error occured while fetching user's feed.", 401, err)
    );
  }
};
// getExploreFeed
export const getExploreFeed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const LIMIT: number = 20;
    const { page = 1 as number } = req.query;

    const exploreFeed: IPost[] = await Post.find({
      $and: [
        { user: { $ne: req.user._id } },
        { user: { $nin: req.user.followings } },
      ],
    })
      .limit(LIMIT * 1)
      .skip((+page - 1) * LIMIT)
      .sort("-createdAt")
      .exec();
    if (!exploreFeed)
      return next(new ErrorException("No explore's found!", 403));
    const sortedExploreFeed = exploreFeed.sort(
      (a, b) => b.likes.length - a.likes.length
    );

    const totalCount = exploreFeed.length;
    return res.status(200).json({
      success: true,
      totalPages: Math.ceil(totalCount / LIMIT),
      currentPage: +page,
      totalCount,
      explore: sortedExploreFeed,
    });
  } catch (err) {
    return next(
      new ErrorException("Error occured while fetching explore feed.", 401, err)
    );
  }
};

// Like a post :postId
export const likePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return next(new ErrorException("No post found!", 403));

    if (!post.likes.includes(req.user._id)) {
      await post.updateOne({ $push: { likes: req.user._id } });
      return res.status(200).json({
        success: true,
        liked: true,
        msg: "You liked the post.",
        id: req.user._id,
        postId: post._id,
      });
    }
    return res.status(200).json({
      success: true,
      msg: "You already liked the post.",
    });
  } catch (err) {
    return next(
      new ErrorException("Error occured while liking post.", 401, err)
    );
  }
};
// Like/unlike a post
export const likeUnlikePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return next(new ErrorException("No post found!", 403));

    if (!post.likes.includes(req.user._id)) {
      await post.updateOne({ $push: { likes: req.user._id } });
      return res.status(200).json({
        success: true,
        liked: true,
        msg: "You liked the post.",
        id: req.user._id,
        postId: post._id,
      });
    } else {
      await post.updateOne({ $pull: { likes: req.user._id } });
      return res.status(200).json({
        success: true,
        msg: "You unliked the post.",
        liked: false,
        id: req.user._id,
        postId: post._id,
      });
    }
  } catch (err) {
    return next(
      new ErrorException("Error occured while liking post.", 401, err)
    );
  }
};

// [Post] Create Comments  /:postId/comments/
export const createPostComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { desc }: IComment = req.body;
    const comment = await Comment.create({
      user: req.user._id,
      post: req.params.postId,
      desc,
    });
    if (comment) {
      await Post.findByIdAndUpdate(req.params.postId, {
        $push: { comments: comment._id },
      });
      return res.status(201).json({
        success: true,
        comment,
      });
    } else {
      return next(
        new ErrorException("Error occured while creating comment.", 403)
      );
    }
  } catch (err) {
    return next(
      new ErrorException("Error occured while creating comment.", 403, err)
    );
  }
};

// Edit Comment [Comment owner] /:postId/comments/:commentId
export const updatePostComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { desc }: IComment = req.body;
    const comment = await Comment.findOne({
      post: req.params.postId,
      _id: req.params.commentId,
    });
    if (!comment)
      return next(new ErrorException("Couldn't find the comment", 403));
    if (comment.user.toString() === req.user._id.toString()) {
      const updatedComment = await Comment.findByIdAndUpdate(
        req.params.commentId,
        { $set: { desc } },
        { new: true, useFindAndModify: false }
      );
      return res.status(200).json({
        success: true,
        comment: updatedComment,
      });
    } else {
      return next(
        new ErrorException("You can only edit your own comments.", 401)
      );
    }
  } catch (err) {
    return next(
      new ErrorException("Error occured while updating comment", 401)
    );
  }
};
// Delete Comment [post owner and comment owner] /:postId/comments/:commentId
export const deletePostComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await Post.findById(req.params.postId);
    const comment = await Comment.findOne({
      post: req.params.postId,
      _id: req.params.commentId,
    });
    if (!comment)
      return next(new ErrorException("Couldn't find the comment", 403));
    if (!post) return next(new ErrorException("Couldn't find the post", 403));

    if (
      post.user.toString() === req.user._id.toString() ||
      comment.user.toString() === req.user._id.toString()
    ) {
      await post.updateOne({ $pull: { comments: comment._id } });
      await comment.delete();
      return res.status(204).json({ success: true });
    } else {
      return next(
        new ErrorException(
          "Only post or comment owner can only delete the commnet.",
          401
        )
      );
    }
  } catch (err) {
    return next(
      new ErrorException("Error occured while deleting comment", 401)
    );
  }
};
// [Get] all post comments  /:postId/comments/
export const getPostComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const LIMIT: number = 20;
    const { page = 1 as number } = req.query;

    const comments: IComment[] = await Comment.find({ post: req.params.postId })
      .limit(LIMIT * 1)
      .skip((+page - 1) * LIMIT)
      .sort("-createdAt")
      .exec();

    const totalCount = comments.length;
    return res.status(200).json({
      success: true,
      totalPages: Math.ceil(totalCount / LIMIT),
      currentPage: +page,
      totalCount,
      comments,
    });
  } catch (err) {
    return next(
      new ErrorException("Error occured while fetching explore feed.", 401, err)
    );
  }
};

// Like/Unlike Comment /:postId/comments/:commentsId
export const likeUnlikePostComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      post: req.params.postId,
    });

    if (!comment) return next(new ErrorException("No comment found!", 403));

    if (!comment.likes.includes(req.user._id)) {
      await comment.updateOne({ $push: { likes: req.user._id } });
      return res.status(200).json({
        success: true,
        msg: "You liked the comment.",
      });
    } else {
      await comment.updateOne({ $pull: { likes: req.user._id } });
      return res.status(200).json({
        success: true,
        msg: "You unliked the comment.",
      });
    }
  } catch (err) {
    return next(
      new ErrorException("Error occured while liking comment.", 401, err)
    );
  }
};
