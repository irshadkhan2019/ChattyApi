const { config } = require("../../config");
const postService = require("../services/db/post.service");

//consumer which will process the job
class PostWorker {
  async addPostToDB(job, done) {
    try {
      const { key, value } = job.data;
      //key is userId and value is Post itself

      //add method to send data to DB
      await postService.addPostToDB(key, value);

      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }

  async deletePostFromDB(job, done) {
    try {
      const { postId, userId } = job.data;

      //add method to send data to DB
      await postService.deletePost(postId, userId);

      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
  //
  async updatePostInDB(job, done) {
    try {
      const { postId, updatedPost } = job.data;

      //add method to send data to DB
      await postService.editPost(postId, updatedPost);

      job.progress(100);
      done(null, job.data); //success
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}
const postWorker = new PostWorker();
module.exports = postWorker;
