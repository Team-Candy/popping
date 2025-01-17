const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// JWT 검증 미들웨어
function authenticateJWT(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "토큰이 필요합니다." });
  }

  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "토큰이 만료되었습니다." });
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateJWT;
