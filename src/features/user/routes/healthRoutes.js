const express = require("express");
const moment = require("moment");
const axios = require("axios");
const { performance } = require("perf_hooks");
const { StatusCodes } = require("http-status-codes");
const { config } = require("../../../config");

class HealthRoutes {
  constructor() {
    this.router = express.Router();
  }

  health() {
    this.router.get("/health", (req, res) => {
      res
        .status(StatusCodes.OK)
        .send(
          `Health: Server instance is healthy with process id ${
            process.pid
          } on ${moment().format("LL")}`
        );
    });

    return this.router;
  }

  env() {
    this.router.get("/env", (req, res) => {
      res
        .status(StatusCodes.OK)
        .send(`This is the ${config.NODE_ENV} environment`);
    });

    return this.router;
  }

  instance() {
    this.router.get("/instance", async (req, res) => {
      const response = await axios({
        method: "get",
        url: config.EC2_URL,
      });
      res
        .status(StatusCodes.OK)
        .send(
          `Server is running on EC2 instance with id ${
            response.data
          } and process id ${process.pid} on ${moment().format("LL")}`
        );
    });

    return this.router;
  }

  fiboRoutes() {
    this.router.get("/fibo/:num", async (req, res) => {
      const { num } = req.params;
      const start = performance.now();
      const result = this.fibo(parseInt(num, 10));
      const end = performance.now();
      const response = await axios({
        method: "get",
        url: config.EC2_URL,
      });
      res
        .status(StatusCodes.OK)
        .send(
          `Fibonacci series of ${num} is ${result} and it took ${
            end - start
          }ms and runs with process id ${process.pid} on ${
            response.data
          } at ${moment().format("LL")}`
        );
    });

    return this.router;
  }

  fibo(data) {
    if (data < 2) {
      return 1;
    } else {
      return this.fibo(data - 2) + this.fibo(data - 1);
    }
  }
}

const healthRoutes = new HealthRoutes();
module.exports = healthRoutes;
