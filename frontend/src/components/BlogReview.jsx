import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const BlogReview = ({ name }) => {
  const [blogs, setBlogs] = useState([]);

  // API 호출 - blog data 받기
  const fetchBlogs = async (name) => {
    try {
      const response = await fetch(`http://localhost:3000/api/blogs?query=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs data");
      }

      const data = await response.json();

      if (data.blogs && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      } else {
        setBlogs([]); // result가 없거나, []이 아닐 경우
      }
    } catch (err) {
      console.error("Error fetching blogs:", err.message);
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
          <p></p>
          // <p>검색 결과가 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

BlogReview.propTypes = {
  name: PropTypes.string.isRequired,
};

export default BlogReview;
