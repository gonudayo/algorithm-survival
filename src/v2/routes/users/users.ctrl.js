const { User } = require("../../../models/User/User");
const { userUpdateByScrap } = require("../../../services/userUpdate");
const logger = require("../../../../logger");
const moment = require("moment-timezone");
const { userRank } = require("../../../utils/checkRank");

const get = {
  info: async (req, res) => {
    try {
      const handle = req.params.handle;
      let user = await User.findOne({ handle })
        .select("-password -initial -current -initialCount -currentCount -__v")
        .populate(
          "joinedGroupList",
          "groupName _id description score maxStreak size"
        )
        .lean();

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "찾을 수 없는 아이디 입니다." });
      }

      user = await userRank(user);

      user.createdAt = moment(user.createdAt).tz("Asia/Seoul").format();
      user.updatedAt = moment(user.updatedAt).tz("Asia/Seoul").format();
      user.currentStreak = user.currentStreak - user.initialStreak;

      delete user.initialStreak;

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      logger.error(`${error}`);
      return res
        .status(500)
        .json({ success: false, message: "서버 오류 발생" });
    }
  },
  all: async (req, res) => {
    try {
      const users = await User.find({}, "-_id -__v -password").lean();
      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      logger.error(`${error}`);
      return res
        .status(500)
        .json({ success: false, message: "서버 오류 발생" });
    }
  },
  updateInfo: async (req, res) => {
    try {
      const user = await userUpdateByScrap(req.params.handle);

      if (!user) {
        return res
          .status(200)
          .json({ success: false, message: "스크래핑에 실패하였습니다." });
      }

      const userScore = user.score;
      const userCount = user.count;
      const userMaxStreak = user.maxStreak;

      const scoreRank =
        (await User.countDocuments({ score: { $gt: userScore } })) + 1;
      const countRank =
        (await User.countDocuments({ count: { $gt: userCount } })) + 1;
      const streakRank =
        (await User.countDocuments({ maxStreak: { $gt: userMaxStreak } })) + 1;

      const userObj = user.toObject();

      delete userObj._id;
      userObj.joinedGroupList.forEach((group) => {
        delete group.memberData;
      });

      userObj.scoreRank = scoreRank;
      userObj.countRank = countRank;
      userObj.streakRank = streakRank;
      userObj.createdAt = moment(user.createdAt).tz("Asia/Seoul").format();
      userObj.updatedAt = moment(user.updatedAt).tz("Asia/Seoul").format();

      return res.status(200).json({
        success: true,
        user: userObj,
      });
    } catch (error) {
      logger.error(`${error}`);
      return res
        .status(500)
        .json({ success: false, message: "서버 오류 발생" });
    }
  },
};

const post = {
  edit: async (req, res) => {
    try {
      if (req.user.handle !== req.params.handle) {
        return res.status(200).json({
          success: false,
          message: "권한이 없습니다.",
        });
      }

      const user = await User.findOneAndUpdate(
        { handle: req.params.handle },
        {
          name: req.body.name,
        },
        { new: true }
      )
        .select("-_id -__v -password")
        .populate("joinedGroupList", "groupName score");

      const userScore = user.score;
      const userCount = user.count;
      const userMaxStreak = user.maxStreak;

      const scoreRank =
        (await User.countDocuments({ score: { $gt: userScore } })) + 1;
      const countRank =
        (await User.countDocuments({ count: { $gt: userCount } })) + 1;
      const streakRank =
        (await User.countDocuments({ maxStreak: { $gt: userMaxStreak } })) + 1;

      const userObj = user.toObject();

      userObj.scoreRank = scoreRank;
      userObj.countRank = countRank;
      userObj.streakRank = streakRank;
      userObj.createdAt = moment(user.createdAt).tz("Asia/Seoul").format();
      userObj.updatedAt = moment(user.updatedAt).tz("Asia/Seoul").format();

      return res.status(200).json({
        success: true,
        user: userObj,
      });
    } catch (error) {
      logger.error(`${error}`);
      return res
        .status(500)
        .json({ success: false, message: "서버 오류 발생" });
    }
  },
};

module.exports = {
  get,
  post,
};
