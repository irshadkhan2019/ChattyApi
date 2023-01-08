const Queue = require("bull");
const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");
const { config } = require("../../../config");

let bullAdapters = [];
let serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/queues");

class BaseQueue {
  constructor(queueName) {
    //create Queue for particular producer
    this.queue = new Queue(queueName, {
      redis: {
        port: parseInt(config.REDIS_PORT, 10),
        host: config.REDIS_HOST,
        password: config.REDIS_PASSWORD,
      },
    });

    //for BULL UI dashboard access
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    // serverAdapter = new ExpressAdapter();
    // serverAdapter.setBasePath("/queues");

    createBullBoard({
      queues: bullAdapters,
      serverAdapter,
    });

    //listeners for an event
    this.queue.on("completed", (job) => {
      job.remove();
    });

    this.queue.on("global:completed", (jobId) => {
      console.log(`Job ${jobId} completed`);
    });

    this.queue.on("global:stalled", (jobId) => {
      console.log(`Job ${jobId} is stalled`);
    });
  }

  //method to add data/Job to queue

  addJob(name, data) {
    this.queue.add(name, data, {
      attempts: 3, //max 3 times retry a job
      //wait 5 sec if job fails b4 each retries
      backoff: { type: "fixed", delay: 5000 },
    });
  }
  //method to process Job from queue ,the callback fn does the processing .
  //takes concurrency no of jobs to process at a time
  processJob(name, concurrency, callback) {
    //callback fn is called by passing the job and done callback fn to it .
    this.queue.process(name, concurrency, callback);
  }
}

module.exports = { serverAdapter, BaseQueue };
