import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { FaSearch, FaMoon, FaSun } from "react-icons/fa"; 



const GIPHY_API_KEY = "rcB3iINFCqUlqGqz2P4QddKllAqVlZBe";
// 3GvKpE4Dic35UrrbfnAcolbb6LYTef6U
// rcB3iINFCqUlqGqz2P4QddKllAqVlZBe
// mMlbR9018kOUp9UCtcR4RymBEReMKNG5
// 67Q9YUJ9xH6QDeW0i8lsdUnwVX58IzMU
// uRn6ByHAlte9eEcBf997VDczfU3drMSB
// TSjbUaNC3jgIDgsKwtjxGA0RfLDuoucu

export default function GiphySearch() {
  const [query, setQuery] = useState("");
  const [displayQuery, setDisplayQuery] = useState(""); 
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState("dark");
  const observer = useRef();

  // get gifs from api
  const fetchGifs = async (searchQuery = "", reset = false) => {
    if (loading) return;
    setLoading(true);
    setError("");

    const isSearching = searchQuery.trim().length > 0;
    const endpoint = isSearching
      ? "https://api.giphy.com/v1/gifs/search"
      : "https://api.giphy.com/v1/gifs/trending";

    try {
      const response = await axios.get(endpoint, {
        params: {
          api_key: GIPHY_API_KEY,
          q: searchQuery,
          limit: 100,
          offset: reset ? 0 : (page - 1) * 100,
        },
      });

      if (reset) {
        setGifs(response.data.data);
      } else {
        setGifs((prevGifs) => [...prevGifs, ...response.data.data]);
      }
    } catch (err) {
      setError("Failed to fetch GIFs. Please try again.");
    }

    setLoading(false);
  };

  // initial load (getting trending gifs)
  useEffect(() => {
    fetchGifs("", true);
  }, []);

  // handles searching 
  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setDisplayQuery(query); 
    setPage(1);
    setGifs([]);
    fetchGifs(query, true);
  };

  // can press enter to search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // infinite scrolling
  const lastGifRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading]);

  // get more gifs when page is updated (inf scrolling)
  useEffect(() => {
    if (page > 1) fetchGifs(query);
  }, [page]);

  // go back to trending when clicking home
  const handleHomeClick = () => {
    setQuery("");
    setDisplayQuery("");
    setSearching(false);
    setPage(1);
    setGifs([]);
    fetchGifs("", true);
  };

  // detect scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // light/dark theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`flex flex-col items-center w-full min-h-screen ${theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-black"}`}>
      
      {/* header */}
      <div className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 p-4 flex flex-col items-center 
        ${isScrolled ? (theme === "dark" ? "bg-gray-900/90 shadow-lg backdrop-blur-md" : "bg-gray-200/90 shadow-lg backdrop-blur-md") : 
        theme === "dark" ? "bg-gray-900" : "bg-gray-300"}`}>

          {/* "home" title/button */}
        <h1 
          className="text-3xl font-bold cursor-pointer mb-3 transition-all hover:scale-105" 
          onClick={handleHomeClick}
        >
          Giphy Search
        </h1>

        {/* search input & button */}
        <div className="flex items-center w-full max-w-2xl space-x-3">
          <input
            type="text"
            placeholder="Search for GIFs..."
            className={`p-3 rounded-lg focus:ring-2 focus:ring-blue-400 transition duration-300 w-full
              ${theme === "dark" ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-black hover:bg-gray-200"}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown} 
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition duration-300 shadow-md"
          >
            <FaSearch size={18} />
          </button>
        </div>

        {/* dark/light mode button */}
        <div className="absolute top-5 right-5">
          <button 
            onClick={toggleTheme} 
            className={`p-3 rounded-full shadow-md transition-all hover:scale-110 border-2 
              ${theme === "dark" ? "bg-gray-700 border-gray-500" : "bg-gray-300 border-gray-600"}`}        
          >
            {theme === "dark" ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>

      {/* search result heading */}
      <div className="mt-40 mb-4 text-center text-2xl font-bold">
        {searching ? `Showing results for "${displayQuery}"` : "Current Trending GIFs:"}
      </div>

      {/* loading/error msgs */}
      {loading && <p className="text-center mt-6 animate-pulse">Loading...</p>}
      {error && <p className="text-red-400 text-center mt-6">{error}</p>}

      
      {/* display GIFs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 w-full max-w-6xl">
        {gifs.map((gif, index) => (
          <div
            key={gif.id}
            ref={index === gifs.length - 1 ? lastGifRef : null}
            className="overflow-hidden rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
          >
            <img
              src={gif.images.fixed_height.url}
              alt={gif.title}
              className="w-full h-48 object-cover rounded-lg"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}






