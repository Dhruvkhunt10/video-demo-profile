import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [paidProfile, setPaidProfile] = useState([]);
  const [loadingPaidProfile, setLoadingPaidProfile] = useState(false);
  const [userPersonlizationProfile, setUserPersonlizationProfile] = useState(
    [],
  );
  const [loadingUserPersonlizationVideos, setLoadingUserPersonlizationVideos] =
    useState(false);
  const [allMembers, setAllMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paidPageNumber, setPaidPageNumber] = useState(1);
  const [paidHasMore, setPaidHasMore] = useState(true);
  const [loadingMorePaid, setLoadingMorePaid] = useState(false);

  const renewToken = async (loginToken, refreshToken) => {
    try {
      const formData = new FormData();
      formData.append("token", encodeURIComponent(refreshToken));
      const res = await axios.post(
        `https://api.klimatenet.io/api/v1/user/token/renew`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${loginToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return res.data;
    } catch {
      return null;
    }
  };

  const getValidToken = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.token) return null;
    const decodedJwt = parseJwt(user.token);
    const now = Math.floor(Date.now() / 1000);
    if (decodedJwt?.exp <= now + 120) {
      const newTokens = await renewToken(user.token, user.refreshToken);
      if (newTokens?.result?.token) {
        const updatedUser = {
          ...user,
          token: newTokens.result.token.token,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser.token;
      } else {
        localStorage.removeItem("user");
        return null;
      }
    }
    return user.token;
  };

  const paidMembers = async (token, page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMorePaid(true);
      } else {
        setLoadingPaidProfile(true);
      }

      const res = await axios.post(
        `https://api.klimatenet.io/api/v1/user/PaidMembers?PageNumber=${page}&PageSize=10`,
        { searchCriteria: "" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newData = res?.data?.result || [];

      setPaidProfile((prev) => (append ? [...prev, ...newData] : newData));

      // if less than 10 → no more pages
      setPaidHasMore(newData.length === 10);
    } catch (err) {
      console.error(err);
      if (!append) setPaidProfile([]);
    } finally {
      setLoadingPaidProfile(false);
      setLoadingMorePaid(false);
    }
  };

  const userPersonlization = async (token) => {
    try {
      setLoadingUserPersonlizationVideos(true);
      const res = await axios.get(
        "https://api.klimatenet.io/api/v1/user-personalization/UserPersonlization",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setUserPersonlizationProfile(
        res?.data?.result?.map((item) => item?.up_users)?.flat(),
      );
    } catch (err) {
      console.error(err);
      setUserPersonlizationProfile([]);
    } finally {
      setLoadingUserPersonlizationVideos(false);
    }
  };

  const handlePaidScroll = async (e) => {
    const el = e.target;

    if (loadingMorePaid || !paidHasMore) return;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 100) {
      const t = await getValidToken();
      if (!t) return;

      const nextPage = paidPageNumber + 1;
      setPaidPageNumber(nextPage);
      paidMembers(t, nextPage, true);
    }
  };

  const search = async (token, text = "", page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      }
      const res = await axios.post(
        `https://api.klimatenet.io/api/v1/user/search?PageNumber=${page}&PageSize=10`,
        { searchCriteria: text },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newData = res?.data?.result || [];

      setAllMembers((prev) => (append ? [...prev, ...newData] : newData));

      // if less than page size → no more data
      setHasMore(newData.length === 10);
    } catch (err) {
      console.error(err);
      if (!append) setAllMembers([]);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const runSearch = async () => {
      const t = await getValidToken();
      if (!t) return navigate("/login");

      setPageNumber(1);
      setHasMore(true);
      search(t, debouncedSearch, 1, false);
    };

    runSearch();
  }, [debouncedSearch]);

  useEffect(() => {
    const init = async () => {
      const t = await getValidToken();
      if (!t) return navigate("/login");

      paidMembers(t, 1, false); // page 1
      userPersonlization(t);
    };
    init();
  }, []);

  useEffect(() => {
    const handleScroll = async () => {
      if (loadingMore || !hasMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= fullHeight - 200) {
        const t = await getValidToken();
        if (!t) return;

        const nextPage = pageNumber + 1;
        setPageNumber(nextPage);
        search(t, debouncedSearch, nextPage, true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pageNumber, loadingMore, hasMore, debouncedSearch]);

  return (
    <div className="home">
      <Header />
      <div className="searchWrapper">
        <div className="searchBox">
          <span className="searchIcon">🔍</span>
          <input
            type="text"
            placeholder="Search members by name"
            value={searchText}
            onChange={handleSearch}
          />
          {searchText && (
            <button
              className="clearBtn"
              onClick={() => handleSearch({ target: { value: "" } })}
            >
              ✖
            </button>
          )}
        </div>
      </div>
      {!debouncedSearch && (
        <>
          <div>
            <h2 className="sectionTitle">Featured Members</h2>
            <div className="paidRow">
              {loadingUserPersonlizationVideos
                ? Array.from({ length: 10 }).map((_, i) => (
                  <div className="paidCard skeleton" key={i}>
                    <div className="cardTop skeletonBox"></div>
                    <div className="cardBody">
                      <div className="skeletonText title"></div>
                      <div className="skeletonText"></div>
                      <div className="skeletonText small"></div>
                      <div className="skeletonText small"></div>
                      <div className="skeletonText small"></div>
                    </div>
                  </div>
                ))
                : userPersonlizationProfile.map((user) => (
                  <div className="paidCard" key={user.id}>
                    <div className="cardTop">
                      <img
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <span className="role paid">Paid</span>
                    </div>

                    <div className="cardBody">
                      <h3 className="ellipsis">
                        {user.firstName} {user.lastName}
                      </h3>

                      <p className="company ellipsis">{user.companyname}</p>
                      <p className="job ellipsis">{user.designation}</p>
                      <div className="infoRow ellipsis">
                        📍 {user.location}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div style={{ marginTop: "16px" }}>
            <h2 className="sectionTitle">Friend+, Patron, Project+ Members</h2>
            <div className="paidRow" onScroll={handlePaidScroll}>
              {loadingPaidProfile ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div className="paidCard skeleton" key={i}>
                    <div className="cardTop skeletonBox"></div>
                    <div className="cardBody">
                      <div className="skeletonText title"></div>
                      <div className="skeletonText"></div>
                      <div className="skeletonText small"></div>
                      <div className="skeletonText small"></div>
                      <div className="skeletonText small"></div>
                    </div>
                  </div>
                ))
              ) : paidProfile?.length === 0 ? (
                <div className="noData">No data found</div>
              ) : (
                paidProfile.map((user) => (
                  <div className="paidCard" key={user.id}>
                    <div className="cardTop">
                      <img src={user.profilePic} alt={user.name} />
                      <span className={`role ${user.role?.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="cardBody">
                      <h3 className="ellipsis">{user.name}</h3>
                      <p className="company ellipsis">{user.companyName}</p>
                      <p className="job ellipsis">{user.jobTitle}</p>
                      <div className="infoRow ellipsis">📍 {user.location}</div>
                      <div className="infoRow ellipsis">📧 {user.email}</div>
                      <div className="infoRow ellipsis">
                        📞 {user.phoneCountryCode} {user.phoneNumber}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loadingMorePaid &&
                Array.from({ length: 10 }).map((_, i) => (
                  <div className="paidCard skeleton" key={`paid-sk-${i}`}>
                    <div className="cardTop skeletonBox"></div>
                    <div className="cardBody">
                      <div className="skeletonText title"></div>
                      <div className="skeletonText"></div>
                      <div className="skeletonText small"></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
      <div style={{ marginTop: "16px" }}>
        <h2 className="sectionTitle">All Members</h2>
        <div className={allMembers?.length === 0 ? "paidRow" : "paidRowAll"}>
          {allMembers.map((user) => (
            <div className="paidCard" key={user.id}>
              <div className="cardTop">
                <img src={user.profilePic} alt={user.name} />
                <span className={`role ${user.role?.toLowerCase()}`}>
                  {user.role}
                </span>
              </div>

              <div className="cardBody">
                <h3 className="ellipsis">{user.name}</h3>
                <p className="company ellipsis">{user.companyName}</p>
                <p className="job ellipsis">{user.jobTitle}</p>
                <div className="infoRow ellipsis">📍 {user.location}</div>
                <div className="infoRow ellipsis">📧 {user.email}</div>
                <div className="infoRow ellipsis">
                  📞 {user.phoneCountryCode} {user.phoneNumber}
                </div>
              </div>
            </div>
          ))}
          {loadingMore &&
            Array.from({ length: 10 }).map((_, i) => (
              <div className="paidCard skeleton" key={`sk-${i}`}>
                <div className="cardTop skeletonBox"></div>
                <div className="cardBody">
                  <div className="skeletonText title"></div>
                  <div className="skeletonText"></div>
                  <div className="skeletonText small"></div>
                  <div className="skeletonText small"></div>
                  <div className="skeletonText small"></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
