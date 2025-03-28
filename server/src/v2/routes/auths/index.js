const express = require("express");

const router = express.Router();

const ctrl = require("./auth.ctrl");
const auth = require("../../middlewares/auth");


router.get("/me", auth, ctrl.get.me); // 로그인한 사용자 정보 조회

router.post("/login", ctrl.post.login); // 로그인
router.post("/code", ctrl.post.code); // 인증 코드 생성
router.post("/verify", ctrl.post.verify); // 인증 코드 검증

router.delete("/logout", auth, ctrl.delete.logout); // 로그아웃

module.exports = router;
