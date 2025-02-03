import PropTypes from "prop-types";
import { useState, useEffect } from "react";

const BlogReview = ({ name }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async (name) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BE_PORT}/api/blogs?query=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs data");
      }

      const data = await response.json();

      if (data.blogs && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err.message);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (name) {
      fetchBlogs(name);
    }
  }, [name]);

  return (
    <div className="p-5 bg-gray-100  rounded-2xl shadow-md space-y-6">
      {loading ? (
        <div className="space-y-4">
          <div className="h-[150px] rounded-2xl bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-[150px] rounded-2xl bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-[150px] rounded-2xl bg-gray-300 rounded w-full animate-pulse"></div>
        </div>
      ) : (
        <ul className="list-none p-0">
          {blogs.length > 0 ? (
            blogs.map((blog, index) => (
              <li key={index} className="mb-5">
                <div onClick={() => window.open(blog.link, "_blank")} className="rounded-2xl rounded-lg p-4 shadow-md bg-white cursor-pointer hover:bg-gray-200 transition duration-200">
                  <h3 className="text-lg font-semibold" dangerouslySetInnerHTML={{ __html: blog.title }}></h3>
                  <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: blog.description }}></p>
                  <small className="text-sm text-gray-500">작성 날짜: {blog.postdate}</small>
                </div>
              </li>
            ))
          ) : (
            <p>검색 결과가 없습니다.</p>
          )}
        </ul>
      )}
    </div>
  );
};

BlogReview.propTypes = {
  name: PropTypes.string.isRequired,
};

export default BlogReview;
