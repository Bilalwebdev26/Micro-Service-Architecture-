import { Post } from "../models/post.model.js";
import { logger } from "../utils/logger.js";
import { publishEvent } from "../utils/rabbitmq.js";

async function inValidatePostCache(req, input) {
  //first old cache post get
  const key = await req.redisClient.keys("posts:*");
  if (key.length > 0) {
    await req.redisClient.del(key);
  }
}

export const createPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
    const newPost = await Post.create({
      user: req.user._id,
      content,
      mediaIds: mediaIds || [],
    });
    await inValidatePostCache(req, newPost._id.toString());
    //implement caching
    logger.info("Post created successfully : ", newPost);
    await publishEvent("post.created", {
      postId: newPost._id.toString(),
      userId: req.user._id.toString(),
      content: newPost.content,
      createdAt: newPost.createdAt,
    });
    return res
      .status(201)
      .json({ success: true, message: "Post created SuccessFully", newPost });
  } catch (error) {
    logger.error("Error while creating Post");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while generate POST",
    });
  }
};

export const getAllPost = async (req, res) => {
  try {
    //pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const cacheKey = `posts: ${page} , limit : ${limit}`;
    const cachedPost = await req.redisClient.get(cacheKey);
    if (cachedPost) {
      return res.json({
        message: "Get from redis",
        data: JSON.parse(cachedPost),
      });
    }
    //if post not present in cache
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    const totalPosts = await Post.countDocuments();
    const result = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
    };
    //first save all in this redis
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    res.json(result);
  } catch (error) {
    logger.error("Error while show all post", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while show all POST",
    });
  }
};
export const getPost = async (req, res) => {
  try {
    const cachedkey = `post :${req.params.id}`;
    const cachedPost = await req.redisClient.get(cachedkey);
    //if we get that post from cached than return that response
    if (cachedPost) {
      return res.status(200).json({
        success: true,
        message: "Post Found from redis client.",
        data: JSON.parse(cachedPost),
      });
    }
    //if not get than check in DB
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    //if that post not in cached than store init
    await req.redisClient.setex(cachedkey, 3600, JSON.stringify(post));
    return res
      .status(200)
      .json({ success: true, message: "Post Found from DB.", post });
  } catch (error) {
    logger.error("Error while show post", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while show POST",
    });
  }
};
export const deletePost = async (req, res) => {
  try {
    //invalidate post from redis client
    const cachekey = `post:${req.params.id}`;
    const cachePost = await req.redisClient.get(cachekey);
    if (cachePost) {
      //invalidate cache
      await req.redisClient.del(cachekey);
      logger.info("Successfully delete from cache");
    }
    await inValidatePostCache(req, req.params.id);
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    //publish event post delete method
    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user._id,
      mediaIds: post.mediaIds,
    });
    return res
      .status(200)
      .json({ success: true, message: "Successfully delete post." });
  } catch (error) {
    logger.error("Error while delete post", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while delete POST",
    });
  }
};
