const express = require("express");

const router = express.Router();

const ctrl = require("./auth.ctrl");
const auth = require("../../middleware/auth");

router.get("/me", auth, ctrl.get.me); // 로그인한 사용자 정보 조회

router.post("/code", ctrl.post.code); // 인증 코드 생성
router.post("/register", ctrl.post.register); // 회원가입
router.post("/login", ctrl.post.login); // 로그인
router.post("/logout", auth, ctrl.post.logout); // 로그아웃
router.post("/reset", ctrl.post.reset); // 비밀번호 변경을 위한 인증 코드 생성
router.post("/password", ctrl.post.password); // 비밀번호 변경

module.exports = router;
