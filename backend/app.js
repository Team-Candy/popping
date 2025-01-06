require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const emailVerificationRoutes = require("./routes/emailVerification");
const searchRoutes = require("./routes/search");
const mainRoutes = require("./routes/main");
const categoryRoutes = require("./routes/category");
const blogRoutes = require("./routes/blogs"); 
const calenderRoutes = require("./routes/calender"); 
const storesRoutes = require("./routes/stores");

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(morgan("dev"));
app.use(express.json());

// 라우트 연결
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/signup", emailVerificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/main", mainRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/calender", calenderRoutes);
app.use("/api/stores", storesRoutes);

// 기본 라우트
app.get("/", (req, res) => res.send("API Running..."));

// 서버 시작
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));