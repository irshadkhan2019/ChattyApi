let io = null;

const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

const getSocketServerInstance = () => {
  return io;
};

module.exports = {
  setSocketServerInstance,
  getSocketServerInstance,
};
