const { Group } = require("./src/models/Group/Group");
const { MemberData } = require("./src/models/Group/MemberData");
const { User } = require("./src/models/User/User");
const { UserVerification } = require("./src/models/User/UserVerification");
const solved = require("./src/apis/solvedac");
const logger = require("./logger");

const restoreMember = async () => {
  const users = await User.find({});
  const members = await MemberData.find({});

  for (const user of users) {
    const isMatched = await members.some((member) =>
      member.user.equals(user._id)
    );

    if (isMatched) {
      console.log(`SKIP : ${user.name}`);
      continue;
    }
    console.log(`NEW : ${user.name}`);
    const memberData = new MemberData({
      user: user._id,
      initialStreak: user.initialStreak,
      initialCount: user.initialCount,
      initial: user.initial,
      score: user.score,
      count: user.count,
    });
    await memberData.save();

    // 그룹 업데이트
    await Group.findByIdAndUpdate(1, {
      $addToSet: {
        memberData: memberData._id,
      },
    });
  }
};

const migrateScore = async () => {
  const users = await User.find({});

  for (const user of users) {
    const current = await solved.problem(user.handle);

    await MemberData.updateOne(
      { user: user._id },
      {
        $set: {
          initial: current,
        },
      }
    );

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          initial: current,
          current: current,
        },
      }
    );
  }
};

const migrateGroups = async () => {
  const result = await Group.updateMany(
    {
      $or: [{ members: { $exists: true } }],
    },
    {
      $unset: {
        members: "",
      },
    },
    { strict: false }
  );

  logger.info(
    `[MIGRATION] 그룹 마이그레이션 완료: ${result.modifiedCount}개 그룹 업데이트`
  );
};

const migrateMemberDatas = async () => {
  const memberDatas = await MemberData.find({
    user: { $exists: true },
  }).populate("user");

  let updatedCount = 0;

  for (const member of memberDatas) {
    const score = member.user.currentSolved - member.initialSolved;

    await MemberData.updateOne(
      { _id: member._id },
      { $set: { score } },
      { strict: false }
    );

    updatedCount++;
  }

  logger.info(
    `[MIGRATION] 멤버데이터 마이그레이션 완료: ${updatedCount}개 멤버데이터 업데이트`
  );
};

const migrateUsers = async () => {
  const result = await User.updateMany(
    {
      $or: [
        { verificationCode: { $exists: true } },
        { isVerified: { $exists: true } },
      ],
    },
    {
      $unset: {
        verificationCode: "",
        isVerified: "",
      },
    },
    { strict: false }
  );

  logger.info(
    `[MIGRATION] 유저 마이그레이션 완료: ${result.modifiedCount}개 유저 업데이트`
  );
};

const migrateUserVerifications = async () => {
  const users = await User.find({}, "handle");

  let created = 0;
  for (const user of users) {
    const exists = await UserVerification.findOne({ handle: user.handle });
    if (exists) continue;

    await UserVerification.create({
      handle: user.handle,
      verificationCode: "",
      isVerified: true,
    });

    created++;
  }

  logger.info(`[MIGRATION] UserVerification 생성 완료: ${created}개 생성됨`);
};

module.exports = {
  restoreMember,
  migrateScore,
  migrateGroups,
  migrateMemberDatas,
  migrateUsers,
  migrateUserVerifications,
};
