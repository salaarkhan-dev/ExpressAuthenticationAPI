import { Router } from "express";
import {
  createPost,
  deletePost,
  getUserFeed,
  getExploreFeed,
  updatePost,
  likePost,
  likeUnlikePost,
  createPostComment,
  updatePostComment,
  deletePostComment,
  getPostComments,
  getPost,
  getFeed,
  likeUnlikePostComment,
  getUserPosts,
} from "../controllers/postController";
import asyncHandler from "../middlewares/asyncHandler";
import isAuthenticatedUser from "../middlewares/requestAuth";
import upload from "../utils/multer";

const postRoutes: Router = Router();

// api/posts/
postRoutes
  .route("/")
  .post(
    isAuthenticatedUser,
    upload.array("images", 10),
    asyncHandler(createPost)
  );

// api/posts/feed
postRoutes.route("/feed").get(isAuthenticatedUser, asyncHandler(getFeed));
// api/posts/me
postRoutes.route("/me").get(isAuthenticatedUser, asyncHandler(getUserFeed));
// api/posts/explore
postRoutes
  .route("/explore")
  .get(isAuthenticatedUser, asyncHandler(getExploreFeed));

// api/posts/:username
postRoutes
  .route("/:username")
  .get(isAuthenticatedUser, asyncHandler(getUserPosts));

// api/posts/:postId
postRoutes
  .route("/:postId/post")
  .get(isAuthenticatedUser, asyncHandler(getPost))
  .put(isAuthenticatedUser, asyncHandler(updatePost))
  .delete(isAuthenticatedUser, asyncHandler(deletePost));
// api/posts/:postId/like
postRoutes
  .route("/:postId/like")
  .put(isAuthenticatedUser, asyncHandler(likePost));
// api/posts/:postId/likeunlike
postRoutes
  .route("/:postId/likeunlike")
  .put(isAuthenticatedUser, asyncHandler(likeUnlikePost));
// api/posts/:postId/comments/
postRoutes
  .route("/:postId/comments/")
  .get(isAuthenticatedUser, asyncHandler(getPostComments))
  .post(isAuthenticatedUser, asyncHandler(createPostComment));
postRoutes
  .route("/:postId/comments/:commentId/likeunlike")
  .put(isAuthenticatedUser, asyncHandler(likeUnlikePostComment));
// api/posts/:postId/comments/:commentId
postRoutes
  .route("/:postId/comments/:commentId")
  .put(isAuthenticatedUser, asyncHandler(updatePostComment))
  .delete(isAuthenticatedUser, asyncHandler(deletePostComment));

export default postRoutes;
