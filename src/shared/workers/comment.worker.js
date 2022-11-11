const commentService = require("../services/db/comment.service");

class CommentWorker {
  async addCommentToDB(job, done) {
    try {
      const { data } = job;
      await commentService.addCommentToDB(data);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      done(error);
    }
  }
}

const commentWorker = new CommentWorker();
module.exports = commentWorker;
