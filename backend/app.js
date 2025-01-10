// app.js

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const emailVerificationRoutes = require("./routes/emailVerification");
const searchRoutes = require("./routes/search");
const mainRoutes = require("./routes/main");
const categoryRoutes = require("./routes/category");
const blogRoutes = require("./routes/blogs");
const calenderRoutes = require("./routes/calender");
const storesRoutes = require("./routes/stores");
const mapRoutes = require("./routes/map");

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(morgan("dev"));
app.use(express.json());
// app.use(cors({
//     origin: "http://localhost:5173", // React 앱의 주소
// })); // CORS를 설정하여 특정 도메

app.use(cors());

app.use((req, res, next) => {
  console.log("Request Origin: ", req.get("Origin"));
  next();
}); // Origin 헤더를 확인해서 요청이 어디서 왔는지 알 수 있음.
// 정적 파일 제공
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 라우트 연결
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/signup", emailVerificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/main", mainRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/calendar", calenderRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api/map", mapRoutes);

// 기본 라우트
app.get("/", (req, res) => res.send("API Running..."));

// 서버 시작
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
