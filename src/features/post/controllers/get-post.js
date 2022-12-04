const { StatusCodes } = require("http-status-codes");
const { parseInt } = require("lodash");
const postService = require("../../../shared/services/db/post.service");
const PostCache = require("../../../shared/services/redis/post.cache");

const postCache = new PostCache();
const PAGE_SIZE = 5;

class Get {
  async posts(req, res) {
    const { page } = req.params;
    const skip = (parseInt(page) - 1) * PAGE_SIZE;
    const limit = PAGE_SIZE * parseInt(page);
    const start = skip === 0 ? skip : skip + 1;
    let posts = [];
    let totalPosts = 0;

    //get post from cache

    const cachedPosts = await postCache.getPostsFromCache("post", start, limit);
    console.log("A REQ was made for posts :", start, limit, cachedPosts.length);

    if (!cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsInCache();
    } else {
      //if cache doesn't give posts then seach in **Mongo db**
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postService.postsCount();
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "All posts", posts, totalPosts });
  } //eof

  async postsWithImages(req, res) {
    const { page } = req.params;
    const skip = (parseInt(page) - 1) * PAGE_SIZE;
    const limit = PAGE_SIZE * parseInt(page);
    const start = skip === 0 ? skip : skip + 1;
    let posts = [];

    //get post from cache
    const cachedPosts = await postCache.getPostsWithImagesFromCache(
      "post",
      start,
      limit
    );

    posts = cachedPosts.length
      ? cachedPosts
      : await postService.getPosts(
          { imgId: "$ne", gifUrl: "$ne" },
          skip,
          limit,
          { createdAt: -1 }
        );

    res
      .status(StatusCodes.OK)
      .json({ message: "All posts with images ", posts });
  } //eof

  async postsWithVideos(req, res) {
    const { page } = req.params;
    const skip = (parseInt(page) - 1) * PAGE_SIZE;
    const limit = PAGE_SIZE * parseInt(page);
    const newSkip = skip === 0 ? skip : skip + 1;
    let posts = [];
    const cachedPosts = await postCache.getPostsWithVideosFromCache(
      "post",
      newSkip,
      limit
    );
    posts = cachedPosts.length
      ? cachedPosts
      : await postService.getPosts({ videoId: "$ne" }, skip, limit, {
          createdAt: -1,
        });
    res
      .status(StatusCodes.OK)
      .json({ message: "All posts with videos", posts });
  }
} //eoc

module.exports = Get;
