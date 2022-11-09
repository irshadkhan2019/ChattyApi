const {
  authMockRequest,
  authMockResponse,
} = require("../../../../mocks/auth.mock");
const SignUp = require("./../signup");
const { StatusCodes } = require("http-status-codes");

// const root = "./../../../../../src/";
jest.mock(`./../../../../../src/shared/services/queues/base.queue`);
jest.mock(`./../../../../../src/shared/services/redis/user.cache`);
jest.mock(`./../../../../../src/shared/services/queues/user.queue`);
jest.mock(`./../../../../../src/shared/services/queues/auth.queue`);
jest.mock(`./../../../../../src/shared/globals/helpers/cloudinary-upload`);

describe("signUp", () => {
  it("should throw an error if username is not available", () => {
    const req = authMockRequest(
      {},
      {
        username: "",
        email: "manny@me.com",
        avatarColor: "#9c27b0",
        password: "pass123",
        avatarImage:
          "https://res.cloudinary.com/dnslnpn4l/image/upload/v1667630010/636603b7660fd48a850d800f.png",
      }
    );

    const res = authMockResponse();

    SignUp.prototype.create(req, res).catch((err) => {
      console.log(err);
      expect(err.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
