const express = require("express");
const authenticateJWT = require("../middleware/authenticateJWT");
const db = require("../config/db");
const upload = require("../middleware/upload");

const router = express.Router();

// 유저 프로필 정보 등록
router.post("/", authenticateJWT, async (req, res) => {
  const { email, name } = req.body;

  // 입력 검증
  if (!email || !name) {
    return res.status(400).json({ error: "email and name are required" });
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const checkEmailQuery = `SELECT COUNT(*) AS count FROM user WHERE email = ?`;
  const insertUserQuery = `INSERT INTO user (email, name) VALUES (?, ?)`;

  try {
    // 이메일 중복 체크
    const [emailCheckResult] = await db.promise().query(checkEmailQuery, [email]);
    if (emailCheckResult[0].count > 0) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // 사용자 등록
    const [insertResult] = await db.promise().query(insertUserQuery, [email, name]);

    res.status(201).json({
      message: "User profile registered successfully",
      userId: insertResult.insertId, // 삽입된 유저의 ID 반환
    });
  } catch (err) {
    console.error("Error during user registration:", err.message);
    res.status(500).json({ error: "Failed to register user profile" });
  }
});

// 유저 정보 수정
router.put("/:u_id/profile", authenticateJWT, async (req, res) => {
  const { u_id } = req.params;
  const { email, name } = req.body;

  // 필수 필드 검증
  if (!email || !name) {
    return res.status(400).json({ error: "email and name are required" });
  }

  // 이메일 형식 검증
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const checkEmailQuery = `SELECT COUNT(*) AS count FROM user WHERE email = ? AND u_id != ?`;
  const updateUserQuery = `
        UPDATE user
        SET email = ?, name = ?
        WHERE u_id = ?
    `;

  try {
    // 이메일 중복 체크
    const [emailCheckResult] = await db.promise().query(checkEmailQuery, [email, u_id]);
    if (emailCheckResult[0].count > 0) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // 사용자 정보 업데이트
    const [updateResult] = await db.promise().query(updateUserQuery, [email, name, u_id]);
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (err) {
    console.error("Error during user profile update:", err.message);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// 유저 정보 삭제
router.delete("/:u_id", authenticateJWT, async (req, res) => {
  const { u_id } = req.params;

  try {
    await db.promise().beginTransaction();

    // 좋아요 삭제
    const deleteLikesQuery = `DELETE FROM likes WHERE u_id = ?`;
    await db.promise().query(deleteLikesQuery, [u_id]);

    // 카테고리 삭제
    const deleteCategoriesQuery = `DELETE FROM category WHERE s_id IN (SELECT s_id FROM store WHERE u_id = ?)`;
    await db.promise().query(deleteCategoriesQuery, [u_id]);

    // 스토어 이미지 삭제
    const deleteStoreImagesQuery = `DELETE FROM store_image WHERE s_id IN (SELECT s_id FROM store WHERE u_id = ?)`;
    await db.promise().query(deleteStoreImagesQuery, [u_id]);

    // 스토어 삭제
    const deleteStoresQuery = `DELETE FROM store WHERE u_id = ?`;
    await db.promise().query(deleteStoresQuery, [u_id]);

    // 사용자 삭제
    const deleteUserQuery = `DELETE FROM user WHERE u_id = ?`;
    const [deleteUserResult] = await db.promise().query(deleteUserQuery, [u_id]);

    if (deleteUserResult.affectedRows === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: "User not found" });
    }

    await db.promise().commit();
    res.status(200).json({ message: `User with ID ${u_id} and related data deleted successfully` });
  } catch (err) {
    console.error("Error during user deletion:", err.message);
    await db.promise().rollback();
    res.status(500).json({ error: "Failed to delete user and related data" });
  }
});

// 사용자 디테일 프로필 정보 조회
router.get("/:u_id/profile", authenticateJWT, async (req, res) => {
  const { u_id } = req.params;

  try {
    // 사용자 인증을 통과한 사용자의 u_id와 요청된 u_id가 일치하는지 확인
    if (parseInt(u_id) !== req.user.u_id) {
      return res.status(403).json({ error: "You are not authorized to access this user's data" });
    }

    // u_id가 숫자 형식인지 확인
    if (isNaN(u_id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const query = `
            SELECT u_id, email, name, created_at
            FROM user
            WHERE u_id = ?
        `;

    const [results] = await db.promise().query(query, [u_id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    res.status(200).json({
      user: {
        u_id: user.u_id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err.message);
    res.status(500).json({ error: "Failed to retrieve user profile" });
  }
});

// 유저가 팝업스토어어 등록하는 기능
router.post("/:u_id/stores", upload.array("image[]", 10), async (req, res) => {
  // console.log("Files: ", req.files); // 업로드된 파일 확인
  // console.log("Body: ", req.body); // 폼 데이터 확인

  const { u_id } = req.params;
  const { s_name, owner, contact, location, s_date, e_date, business_hours, description, category } = req.body;

  // 필수 필드 확인
  if (!s_name || !owner || !contact || !location || !s_date || !e_date || !business_hours || !description || !category) {
    return res.status(400).json({ error: "All fields, including category, are required" });
  }

  // 이미지 검증
  const imageFiles = req.files;
  console.log("imageFiles: ", imageFiles);
  if (!imageFiles || imageFiles.length === 0) {
    return res.status(400).json({ error: "At least one image is required" });
  }

  // DB 트랜잭션 시작
  try {
    // DB 트랜잭션 시작
    await db.promise().beginTransaction();

    // Store 등록
    const storeQuery = `
            INSERT INTO store (u_id, s_name, owner, contact, location, s_date, e_date, business_hours, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const storeValues = [u_id, s_name, owner, contact, location, s_date, e_date, business_hours, description];

    const [storeResult] = await db.promise().query(storeQuery, storeValues);
    const s_id = storeResult.insertId;

    // 이미지 삽입
    const imageQuery = `INSERT INTO store_image (s_id, image_url) VALUES ?`;
    const imageValues = imageFiles.map((file) => [s_id, `/uploads/${file.filename}`]);

    await db.promise().query(imageQuery, [imageValues]);

    // 카테고리 삽입
    const categoryQuery = `INSERT INTO category (s_id, name) VALUES (?, ?)`;
    await db.promise().query(categoryQuery, [s_id, category]);

    // 트랜잭션 커밋
    await db.promise().commit();

    res.status(201).json({
      message: "Store, images, and category registered successfully",
      store: { s_id, s_name, owner, contact, location, s_date, e_date, business_hours, description },
      images: imageFiles.map((file) => `/uploads/${file.filename}`),
      category: category,
    });
  } catch (err) {
    // 트랜잭션 롤백
    await db.promise().rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to register store, images, or category" });
  }
});

// 유저가 작성한 팝업스토어어 조회
router.get("/:u_id/stores", async (req, res) => {
  const { u_id } = req.params;

  const query = `
        SELECT 
            store.s_id, 
            store.owner, 
            store.s_name, 
            store.contact, 
            store.location, 
            store.s_date, 
            store.e_date, 
            store.business_hours, 
            store.description,
            JSON_ARRAYAGG(store_image.image_url) AS images,
            category.name AS category
        FROM store
        LEFT JOIN store_image ON store.s_id = store_image.s_id
        LEFT JOIN category ON store.s_id = category.s_id
        WHERE store.u_id = ?
        GROUP BY store.s_id, category.name
    `;

  try {
    const [results] = await db.promise().query(query, [u_id]);

    // 결과가 없을 때
    if (results.length === 0) {
      return res.status(404).json({ error: "Stores not found" });
    }

    res.status(200).json({
      stores: results.map((store) => ({
        s_id: store.s_id,
        owner: store.owner,
        s_name: store.s_name,
        contact: store.contact,
        location: store.location,
        s_date: store.s_date,
        e_date: store.e_date,
        business_hours: store.business_hours,
        description: store.description,
        images: store.images ? store.images : [], // JSON 배열로 파싱
        category: store.category || null,
      })),
    });
  } catch (err) {
    console.error("Database error:", err.message);
    return res.status(500).json({ error: "Failed to retrieve user stores" });
  }
});

// 유저가 작성한 팝업스토어 수정 접근 권한 확인
router.post("/:u_id/stores/:s_id/check-popup-permission", async (req, res) => {
  const { u_id, s_id } = req.params;

  try {
    // store 테이블에 s_id 찾고 그 컬럼에 해당하는 u_id가 req.params.u_id와 일치하면 T, 다르면 F.
    const query = `SELECT u_id FROM store WHERE s_id = ?`;
    const [results] = await db.promise().query(query, [s_id]);

    // 결과가 없을 때
    if (results.length === 0) {
      return res.status(404).json({
        hasPermission: false,
        message: "Store not found",
      });
    }

    // 결과가 있는데 사용자 인증을 통과한 사용자의 u_id와 요청된 u_id가 일치하지 않을 때
    if (results[0].u_id !== parseInt(u_id)) {
      return res.status(403).json({
        hasPermission: false,
        message: "You are not authorized to access this user's data",
      });
    }

    // 결과가 있는데 사용자 인증을 통과한 사용자의 u_id와 요청된 u_id가 일치할 때
    return res.status(200).json({
      hasPermission: true,
      message: "You have permission to edit this popup.",
    });
  } catch (err) {
    console.error("Error occurred:", err.message);
    return res.status(500).json({
      hasPermission: false,
      message: "An unexpected error occurred",
    });
  }
});

// 유저가 작성한 팝업스토어어 수정
router.put("/:u_id/stores/:s_id", upload.array("image[]", 10), async (req, res) => {
  const { u_id, s_id } = req.params;
  const { s_name, owner, contact, location, s_date, e_date, business_hours, description, category, deleteImages } = req.body;

  // 업로드된 파일 정보
  const files = req.files;
  console.log("files: ", files);
  const newImageUrls = files.map((file) => `/uploads/${file.filename}`); // 새로 업로드된 이미지 URL 생성

  // 필수 필드 확인
  if (!s_name || !owner || !contact || !location || !s_date || !e_date || !business_hours || !description || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // 시작 트랜잭션
    await db.promise().beginTransaction();

    const storeQuery = `
            UPDATE store
            SET s_name = ?, owner = ?, contact = ?, location = ?, s_date = ?, e_date = ?, business_hours = ?, description = ?
            WHERE s_id = ? AND u_id = ?
        `;
    const storeValues = [s_name, owner, contact, location, s_date, e_date, business_hours, description, s_id, u_id];

    // Store 테이블에 데이터 업데이트
    const [storeResult] = await db.promise().query(storeQuery, storeValues);

    if (storeResult.affectedRows === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: "Store not found" });
    }

    // 1. 기존 이미지 URL 가져오기
    const getExistingImagesQuery = `SELECT image_url FROM store_image WHERE s_id = ?`;
    const [existingImages] = await db.promise().query(getExistingImagesQuery, [s_id]);

    const existingImageUrls = existingImages.map((image) => image.image_url);

    // 2. 삭제 대상 이미지 처리
    const deletedImageUrls = JSON.parse(deleteImages || "[]"); // 삭제하려는 이미지 URL 목록 (JSON 문자열로 전달된다고 가정)
    if (deletedImageUrls.length > 0) {
      const deleteImageQuery = `DELETE FROM store_image WHERE s_id = ? AND image_url IN (?)`;
      await db.promise().query(deleteImageQuery, [s_id, deletedImageUrls]);
    }

    // 3. 새로 추가된 이미지 처리
    const remainingImageUrls = existingImageUrls.filter((url) => !deletedImageUrls.includes(url));
    const finalImageUrls = [...remainingImageUrls, ...newImageUrls];

    if (newImageUrls.length > 0) {
      const imageQuery = `
                INSERT INTO store_image (s_id, image_url) VALUES ?
            `;
      const imageValues = newImageUrls.map((url) => [s_id, url]);

      await db.promise().query(imageQuery, [imageValues]);
    }

    // 4. 기존 카테고리 삭제 및 새로운 카테고리 추가
    const deleteCategoryQuery = `DELETE FROM category WHERE s_id = ?`;
    await db.promise().query(deleteCategoryQuery, [s_id]);

    const insertCategoryQuery = `INSERT INTO category (s_id, name) VALUES (?, ?)`;
    await db.promise().query(insertCategoryQuery, [s_id, category]);

    // 5. 트랜잭션 커밋
    await db.promise().commit();

    res.status(200).json({
      message: "Store, images, and category updated successfully",
      store: {
        s_id,
        s_name,
        owner,
        contact,
        location,
        s_date,
        e_date,
        business_hours,
        description,
        category,
      },
      images: finalImageUrls,
    });
  } catch (err) {
    console.error("Error during store update:", err.message);
    await db.promise().rollback();
    res.status(500).json({ error: "Failed to update store, images, or category" });
  }
});

// router.put("/:u_id/stores/:s_id", upload.array("image[]", 10), async (req, res) => {
//   const { u_id, s_id } = req.params;
//   const { s_name, owner, contact, location, s_date, e_date, business_hours, description, category } = req.body;

//   // 업로드된 파일 정보
//   const files = req.files;
//   console.log("files: ", files);
//   const imageUrls = files.map((file) => `/uploads/${file.filename}`); // 저장된 이미지 URL 생성

//   // 필수 필드 확인
//   if (!s_name || !owner || !contact || !location || !s_date || !e_date || !business_hours || !description || !category) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     // 시작 트랜잭션
//     await db.promise().beginTransaction();

//     const storeQuery = `
//             UPDATE store
//             SET s_name = ?, owner = ?, contact = ?, location = ?, s_date = ?, e_date = ?, business_hours = ?, description = ?
//             WHERE s_id = ? AND u_id = ?
//         `;
//     const storeValues = [s_name, owner, contact, location, s_date, e_date, business_hours, description, s_id, u_id];

//     // Store 테이블에 데이터 업데이트
//     const [storeResult] = await db.promise().query(storeQuery, storeValues);

//     if (storeResult.affectedRows === 0) {
//       await db.promise().rollback();
//       return res.status(404).json({ error: "Store not found" });
//     }

//     // 1. 기존 이미지 URL 가져오기
//     const getExistingImagesQuery = `SELECT image_url FROM store_image WHERE s_id = ?`;
//     const [existingImages] = await db.promise().query(getExistingImagesQuery, [s_id]);

//     const existingImageUrls = existingImages.map((image) => image.image_url);
//     const allImageUrls = [...existingImageUrls, ...imageUrls];

//     // 2. store_image 테이블에 새 이미지 추가
//     const imageQuery = `
//             INSERT INTO store_image (s_id, image_url) VALUES ?
//         `;
//     const imageValues = allImageUrls.map((url) => [s_id, url]);

//     await db.promise().query(imageQuery, [imageValues]);

//     // 3. 기존 카테고리 삭제 및 새로운 카테고리 추가
//     const deleteCategoryQuery = `DELETE FROM category WHERE s_id = ?`;
//     await db.promise().query(deleteCategoryQuery, [s_id]);

//     const insertCategoryQuery = `INSERT INTO category (s_id, name) VALUES (?, ?)`;
//     await db.promise().query(insertCategoryQuery, [s_id, category]);

//     // 4. 트랜잭션 커밋
//     await db.promise().commit();

//     res.status(200).json({
//       message: "Store, images, and category updated successfully",
//       store: {
//         s_id,
//         s_name,
//         owner,
//         contact,
//         location,
//         s_date,
//         e_date,
//         business_hours,
//         description,
//         category,
//       },
//       images: allImageUrls,
//     });
//   } catch (err) {
//     console.error("Error during store update:", err.message);
//     await db.promise().rollback();
//     res.status(500).json({ error: "Failed to update store, images, or category" });
//   }
// });

// router.put("/:u_id/stores/:s_id", upload.array("image[]", 10), async (req, res) => {
//   const { u_id, s_id } = req.params;
//   const { s_name, owner, contact, location, s_date, e_date, business_hours, description, category, existingImageUrls = [] } = req.body;

//   // 업로드된 파일 정보
//   const files = req.files;
//   const newImageUrls = files.map((file) => `/uploads/${file.filename}`); // 새로 추가된 이미지 URL
//   const allImageUrls = [...existingImageUrls, ...newImageUrls];

//   if (!s_name || !owner || !contact || !location || !s_date || !e_date || !business_hours || !description || !category) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   try {
//     // 시작 트랜잭션
//     await db.promise().beginTransaction();

//     const storeQuery = `
//           UPDATE store
//           SET s_name = ?, owner = ?, contact = ?, location = ?, s_date = ?, e_date = ?, business_hours = ?, description = ?
//           WHERE s_id = ? AND u_id = ?
//       `;
//     const storeValues = [s_name, owner, contact, location, s_date, e_date, business_hours, description, s_id, u_id];

//     const [storeResult] = await db.promise().query(storeQuery, storeValues);

//     if (storeResult.affectedRows === 0) {
//       await db.promise().rollback();
//       return res.status(404).json({ error: "Store not found" });
//     }

//     // 1. 기존 이미지 URL 가져오기
//     const getExistingImagesQuery = `SELECT image_url FROM store_image WHERE s_id = ?`;
//     const [existingImages] = await db.promise().query(getExistingImagesQuery, [s_id]);

//     const dbImageUrls = existingImages.map((image) => image.image_url);

//     // 2. 삭제된 이미지 URL 계산
//     const deletedImageUrls = dbImageUrls.filter((url) => !existingImageUrls.includes(url));

//     if (deletedImageUrls.length > 0) {
//       const deleteImageQuery = `
//               DELETE FROM store_image WHERE s_id = ? AND image_url IN (?)
//           `;
//       await db.promise().query(deleteImageQuery, [s_id, deletedImageUrls]);
//     }

//     // 3. 새 이미지 URL 추가
//     if (newImageUrls.length > 0) {
//       const imageQuery = `
//               INSERT INTO store_image (s_id, image_url) VALUES ?
//           `;
//       const imageValues = newImageUrls.map((url) => [s_id, url]);
//       await db.promise().query(imageQuery, [imageValues]);
//     }

//     // 4. 기존 카테고리 삭제 및 새로운 카테고리 추가
//     const deleteCategoryQuery = `DELETE FROM category WHERE s_id = ?`;
//     await db.promise().query(deleteCategoryQuery, [s_id]);

//     const insertCategoryQuery = `INSERT INTO category (s_id, name) VALUES (?, ?)`;
//     await db.promise().query(insertCategoryQuery, [s_id, category]);

//     // 5. 트랜잭션 커밋
//     await db.promise().commit();

//     res.status(200).json({
//       message: "Store, images, and category updated successfully",
//       store: {
//         s_id,
//         s_name,
//         owner,
//         contact,
//         location,
//         s_date,
//         e_date,
//         business_hours,
//         description,
//         category,
//       },
//       images: allImageUrls,
//     });
//   } catch (err) {
//     console.error("Error during store update:", err.message);
//     await db.promise().rollback();
//     res.status(500).json({ error: "Failed to update store, images, or category" });
//   }
// });

// 유저가 작성한 게시글 삭제
router.delete("/:u_id/stores/:s_id", async (req, res) => {
  const { u_id, s_id } = req.params;

  try {
    // 트랜잭션 시작
    await db.promise().beginTransaction();

    // 1. 카테고리 삭제
    const deleteCategoryQuery = `DELETE FROM category WHERE s_id = ?`;
    await db.promise().query(deleteCategoryQuery, [s_id]);

    // 2. 이미지 삭제
    const deleteImagesQuery = `DELETE FROM store_image WHERE s_id = ?`;
    await db.promise().query(deleteImagesQuery, [s_id]);

    // 3. 스토어 삭제
    const deleteStoreQuery = `DELETE FROM store WHERE s_id = ? AND u_id = ?`;
    const [storeResult] = await db.promise().query(deleteStoreQuery, [s_id, u_id]);

    if (storeResult.affectedRows === 0) {
      await db.promise().rollback();
      return res.status(404).json({ error: "Store not found" });
    }

    // 4. 트랜잭션 커밋
    await db.promise().commit();

    res.status(200).json({ message: `Store with ID ${s_id} deleted successfully` });
  } catch (err) {
    console.error("Error during store deletion:", err.message);
    await db.promise().rollback();
    res.status(500).json({ error: "Failed to delete store, images, or category" });
  }
});

router.get("/:u_id/stores/:s_id/likes", async (req, res) => {
  const { u_id, s_id } = req.params;

  // 입력 검증
  if (!u_id || isNaN(u_id) || !s_id || isNaN(s_id)) {
    return res.status(400).json({ error: "Invalid user ID or store ID" });
  }

  const query = `SELECT COUNT(*) AS totalLikes FROM likes WHERE u_id = ? AND s_id = ?`;

  try {
    const [results] = await db.promise().query(query, [u_id, s_id]);

    if (results[0].totalLikes > 0) {
      return res.status(200).json({ liked: true });
    } else {
      return res.status(200).json({ liked: false });
    }
  } catch (err) {
    console.error("Database error:", err.message);
    return res.status(500).json({ error: "Failed to retrieve like status" });
  }
});

// 사용자가 팝업 스토어에 좋아요 추가
router.post("/:u_id/stores/:s_id/likes", async (req, res) => {
  const { u_id, s_id } = req.params;

  // 입력 검증
  if (!u_id || isNaN(u_id) || !s_id || isNaN(s_id)) {
    return res.status(400).json({ error: "Invalid user ID or store ID" });
  }

  try {
    // 좋아요 추가
    const insertQuery = `
            INSERT INTO likes (u_id, s_id)
            VALUES (?, ?)
        `;

    await db.promise().query(insertQuery, [u_id, s_id]);

    res.status(201).json({ message: "Like added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Like already exists" });
    }
    console.error("Database error during like addition:", err.message);
    res.status(500).json({ error: "Failed to add like" });
  }
});

// 사용자가 팝업 스토어에 좋아요 취소
router.delete("/:u_id/stores/:s_id/likes", async (req, res) => {
  const { u_id, s_id } = req.params;

  // 입력 검증
  if (!u_id || isNaN(u_id) || !s_id || isNaN(s_id)) {
    return res.status(400).json({ error: "Invalid user ID or store ID" });
  }

  try {
    // 좋아요 취소 쿼리
    const deleteQuery = `
            DELETE FROM likes
            WHERE u_id = ? AND s_id = ?
        `;

    const [results] = await db.promise().query(deleteQuery, [u_id, s_id]);

    if (results.affectedRows > 0) {
      return res.status(200).json({
        message: "Like removed successfully",
        liked: false,
      });
    } else {
      return res.status(404).json({ error: "Like not found" });
    }
  } catch (err) {
    console.error("Database error during like removal:", err.message);
    return res.status(500).json({ error: "Failed to remove like" });
  }
});

// 사용자가 좋아요 누른 게시글 조회
router.get("/:u_id/likes", async (req, res) => {
  const { u_id } = req.params;

  // 입력 검증
  if (!u_id || isNaN(u_id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const query = `
        SELECT 
            store.s_id, 
            store.owner, 
            store.s_name, 
            store.contact, 
            store.location, 
            store.s_date, 
            store.e_date, 
            store.business_hours, 
            store.description,
            JSON_ARRAYAGG(store_image.image_url) AS images,
            category.name AS category
        FROM store
        JOIN likes ON store.s_id = likes.s_id
        LEFT JOIN store_image ON store.s_id = store_image.s_id
        LEFT JOIN category ON store.s_id = category.s_id
        WHERE likes.u_id = ?
        GROUP BY store.s_id, category.name
    `;

  try {
    const [results] = await db.promise().query(query, [u_id]);

    // 결과가 없을 때
    if (results.length === 0) {
      return res.status(404).json({ error: "Likes not found" });
    }

    // 데이터 포맷팅 및 응답
    res.status(200).json({
      likes: results.map((store) => ({
        s_id: store.s_id,
        owner: store.owner,
        s_name: store.s_name,
        contact: store.contact,
        location: store.location,
        s_date: store.s_date,
        e_date: store.e_date,
        business_hours: store.business_hours,
        description: store.description,
        images: store.images || [], // JSON 배열로 파싱
        category: store.category || null,
      })),
    });
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Failed to retrieve user likes" });
  }
});

module.exports = router;
