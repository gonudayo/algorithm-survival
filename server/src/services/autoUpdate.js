const solvedac = require("../apis/solvedac");
const scrap = require("../apis/scrap");
const { User } = require("../models/User/User");

let userQueue = [];
let currentIndex = 0;
let interval = 0;

async function loadUsersFromDB() {
  try {
    const users = await User.find({}, "handle");
    // console.log(users);
    return users;
  } catch (error) {
    console.error(`UPDATE USER : Error loading user:`, error.message);
  }
}

async function updateUser() {
  console.log(
    `UPDATE USER : Current User Queue : ${currentIndex + 1}/${userQueue.length}`
  );
  if (userQueue.length === 0) {
    console.log("UPDATE USER : No users to update.");
    return;
  }

  const user = userQueue[currentIndex];

  try {
    console.time("autoUpdate: scrap profile");
    const profile = await scrap.profile(user.handle);
    console.timeEnd("autoUpdate: scrap profile");

    if (profile.success === true) {
      User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            currentSolved: profile.solved,
            currentStreak: profile.streak,
            tier: profile.tier,
          },
        }
      )
        .then(() => {
          console.log(`UPDATE USER : User "${user.handle}" updated`);
        })
        .catch((err) => {
          console.error(`UPDATE USER : Error updating user ${user.handle}:`, err);
        });
    } else {
      console.log("SKIP USER : FAIL TO SCRAPING.");
    }
  } catch (error) {
    console.error(
      `UPDATE USER : Error updating user ${user.handle}:`,
      error.message
    );
  }

  currentIndex = (currentIndex + 1) % userQueue.length;
}

function startUpdating() {
  if (interval) return; // 이미 실행 중이면 중복 실행 방지

  // interval = setInterval(updateUser, 7100); // 서비스 용
  interval = setInterval(updateUser, 15000); // 개발 용
  console.log("UPDATE USER : User update process started!");
}

function addUserInQueue(handle) {
  userQueue.push({ handle: handle });
  console.log(`UPDATE USER : New user "${handle}" added!`);
}

async function init() {
  userQueue = await loadUsersFromDB();
  console.log(`UPDATE USER : Loaded ${userQueue.length} users from DB.`);
  startUpdating();
}

module.exports = {
  init,
  addUserInQueue,
};
