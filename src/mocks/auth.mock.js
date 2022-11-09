exports.authMockRequest = (sessionData, body, currentUser, params) => ({
  session: sessionData,
  body,
  params,
  currentUser,
});

exports.authMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

exports.authUserPayload = {
  userId: "60263f14648fed5246e322d9",
  uId: "1621613119252066",
  username: "Manny",
  email: "manny@me.com",
  avatarColor: "#9c27b0",
  iat: 12345,
};

exports.authMock = {
  _id: "60263f14648fed5246e322d3",
  uId: "1621613119252066",
  username: "Manny",
  email: "manny@me.com",
  avatarColor: "#9c27b0",
  createdAt: "2022-08-31T07:42:24.451Z",
  save: () => {},
  comparePassword: () => false,
};
