const ObjectId = require("mongodb").ObjectId;
const { mongoose } = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const FollowerCache = require("../../../shared/services/redis/follower.cache");
const UserCache = require("../../../shared/services/redis/user.cache");
const followerQueue = require("../../../shared/services/queues/follower.queue");
const { getSocketServerInstance } = require("../../../ioServerStore");

const followerCache = new FollowerCache();
const userCache = new UserCache();

//followerId=THe logged in user who will follow other user
//followeeId=To whom we are following
class Add {
  async follower(req, res) {
    const { followerId } = req.params; //to whom the logged in user will follow

    //update count in users cache.
    //updating count of the account to whom logged in user followed.
    const followersCount = followerCache.updateFollowersCountInCache(
      `${followerId}`,
      "followersCount",
      1
    );
    //upgrading the count of logged in user who follows other user
    const followeeCount = followerCache.updateFollowersCountInCache(
      `${req.currentUser?.userId}`,
      "followingCount",
      1
    );
    await Promise.all([followersCount, followeeCount]);

    //get user data of followedTo and the one who follows other
    const cachedFollower = userCache.getUserFromCache(followerId); //followedTo
    const cachedFollowee = userCache.getUserFromCache(
      `${req.currentUser?.userId}` //one who follows logged in user
    );
    const response = await Promise.all([cachedFollower, cachedFollowee]);

    const addFolloweeData = Add.prototype.userData(response[0]); //followedTo user

    //sending logged in user data  via socket conn abt whom he followed.
    const socketIOFollowerObject = getSocketServerInstance();
    socketIOFollowerObject.emit("add follower", addFolloweeData);

    //following:loggedinUserId->[user1,user2..] i.e logged in users is following user1,user2 ,...
    const addFollowerToCache = followerCache.saveFollowerToCache(
      `following:${req.currentUser?.userId}`,
      `${followerId}`
    );

    //followers:followerId->[loggedInuser,others ] i.e A user is followed by list of other users
    const addFolloweeToCache = followerCache.saveFollowerToCache(
      `followers:${followerId}`,
      `${req.currentUser?.userId}`
    );
    await Promise.all([addFollowerToCache, addFolloweeToCache]);
    const followerObjectId = new ObjectId();
    //db queues
    followerQueue.addFollowerJob("addFollowerToDB", {
      keyOne: `${req.currentUser?.userId}`, //logged in
      keyTwo: `${followerId}`, //other user
      username: req.currentUser?.username,
      followerDocumentId: followerObjectId,
    });
    res.status(StatusCodes.OK).json({ message: "Following user now" });
  } //eof

  //creating data of user to whom logged in user followed.
  userData(user) {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username,
      avatarColor: user.avatarColor,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId,
      userProfile: user,
    };
  }
} //eoc

module.exports = Add;
