import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const BlogReview = ({ name }) => {
  const [blogs, setBlogs] = useState([]);

  // API 호출 - blog data 받기
  const fetchBlogs = async (name) => {
    try {
      const response = await fetch(`/api/blogs?query=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs data");
      }

      // const data = await response.json();

      // 임시 데이터
      const data = {
        result: [
          {
            title: "블로그 제목 1",
            link: "https://blog.example.com/1",
            description: "이 블로그는 JavaScript에 대한 내용을 다룹니다.",
            postdate: "2024-12-01",
          },
          {
            title: "블로그 제목 2",
            link: "https://blog.example.com/2",
            description: "React를 사용한 프로젝트 경험 공유.",
            postdate: "2024-11-30",
          },
        ],
      };

      console.log(data);

      if (data.result && Array.isArray(data.result)) {
        // {”result” : [{”title”: “(블로그 글 제목)”, “link”: “(블로그 포스트의 URL)”, “description”:”(블로그 포스트 내용 요약 정보)”, “postdate”:”(블로그 포스트 작성된 날짜)” }]}
        setBlogs(data.result);
      } else {
        setBlogs([]); // result가 없거나, []이 아닐 경우
      }
    } catch (err) {
      console.err("Error fetching blogs:", err.message);
      setBlogs([]);
    }
  };

  useEffect(() => {
    if (name) {
      fetchBlogs(name);
    }
  }, [name]);

  return (
    <div>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {blogs.length > 0 ? (
          blogs.map((blog, index) => (
            <li key={index} style={{ marginBottom: "20px" }}>
              <div
                onClick={() => window.open(blog.link, "_blank")}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f9f9f9",
                  cursor: "pointer",
                }}
              >
                <h3 dangerouslySetInnerHTML={{ __html: blog.title }}></h3>
                <p dangerouslySetInnerHTML={{ __html: blog.description }}></p>
                <small>작성 날짜: {blog.postdate}</small>
              </div>
            </li>
          ))
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

BlogReview.propTypes = {
  name: PropTypes.string.isRequired,
};

export default BlogReview;
