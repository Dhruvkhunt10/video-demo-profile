import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
};

const ProfileDetails = () => {
    const location = useLocation()
    const { id } = location.state
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(
        [],
    );
    const [loading, setLoading] = useState(true);

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

    const userData = async (token) => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://api.klimatenet.io/api/v1/user/${id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUserDetails(res?.data?.result);
        } catch (err) {
            console.error(err);
            setUserDetails([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            const init = async () => {
                const t = await getValidToken();
                if (!t) return navigate("/login");
                userData(t);
            };
            init();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="home">
                <Header />
                <div className="profile-dark">
                    <div className="left-panel">
                        <div className="skeleton avatar-skel" />
                        <div className="skeleton text-skel w-60" />
                        <div className="skeleton text-skel w-40" />
                        <div className="skeleton text-skel w-50" />

                        <div className="follow-box">
                            <div className="skeleton box-skel" />
                            <div className="skeleton box-skel" />
                            <div className="skeleton box-skel" />
                        </div>

                        <div className="skeleton token-skel" />
                        <div className="skeleton score-skel" />
                    </div>

                    <div className="right-panel">
                        <div className="card skeleton card-skel" />
                        <div className="card skeleton card-skel" />
                        <div className="card skeleton card-skel" />
                        <div className="card skeleton card-skel" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="home">
            <Header />
            <div className="profile-dark">
                <div className="left-panel">
                    <div className="avatar-wrap">
                        <img
                            src={userDetails?.additionalUserInfo?.profilePicture}
                            alt="profile"
                        />
                        {userDetails?.userBadges?.[0]?.icon && (
                            <img
                                src={userDetails.userBadges[0].icon}
                                alt="badge"
                                className="badge-icon"
                            />
                        )}
                    </div>
                    <h2>{userDetails?.additionalUserInfo?.username}</h2>
                    <span className="role-badge">{userDetails?.roleName}</span>
                    <p className="job">{userDetails?.additionalUserInfo?.jobTitle}</p>
                    <p className="company">{userDetails?.additionalUserInfo?.companyName}</p>
                    <p className="address">{userDetails?.additionalUserInfo?.address}</p>
                    <div className="follow-box">
                        <div><strong>{userDetails?.followers}</strong><span>Followers</span></div>
                        <div><strong>{userDetails?.following}</strong><span>Following</span></div>
                        <div><strong>{userDetails?.posts}</strong><span>Posts</span></div>
                    </div>
                    <div className="token-card">
                        <div>
                            <p>K Tokens</p>
                            <h3>{userDetails?.kTokens}</h3>
                        </div>
                        <div>
                            <p>P Tokens</p>
                            <h3>{userDetails?.pTokens}</h3>
                        </div>
                    </div>
                    <div className="score-card">
                        <p>Profile Score</p>
                        <div className="progress">
                            <div
                                style={{
                                    width:
                                        userDetails?.scoreResponse?.profileScoreResponse?.obtainedScore +
                                        "%",
                                }}
                            />
                        </div>
                        <span>
                            {userDetails?.scoreResponse?.profileScoreResponse?.obtainedScore}%
                        </span>
                    </div>
                </div>
                <div className="right-panel">
                    <div className="card">
                        <h3>About</h3>
                        <p>{userDetails?.additionalUserInfo?.about}</p>
                    </div>
                    <div className="card">
                        <h3>Contact</h3>
                        <p>Email: {userDetails?.email}</p>
                        <p>
                            Phone: {userDetails?.phoneCountryCode} ******{userDetails?.phoneNumber?.slice(-2)}
                        </p>
                        <a href={userDetails?.linkedIn} target="_blank" className="link-btn">
                            View LinkedIn
                        </a>
                    </div>
                    <div className="card">
                        <h3>Expertise</h3>
                        <div className="tags">
                            {userDetails?.userTags?.offeredTags?.map((t) => (
                                <span key={t.uid}>{t.name}</span>
                            ))}
                        </div>
                    </div>
                    <div className="card">
                        <h3>Looking For</h3>
                        <div className="tags need">
                            {userDetails?.userTags?.neededTags?.map((t) => (
                                <span key={t.uid}>{t.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;
