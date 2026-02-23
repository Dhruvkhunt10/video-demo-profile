import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Otp = () => {
    const location = useLocation();
    const { phoneNumber, phoneNumberCode, referenceId } = location.state || {};
    const navigate = useNavigate()
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        let newErrors = {};

        if (!otp) {
            newErrors.otp = "otp is required";
        } else if (!/^\d+$/.test(otp)) {
            newErrors.otp = "Only numbers are allowed";
        } else if (otp.length != 6) {
            newErrors.otp = "Invalid otp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        try {
            setLoading(true);

            const payload = {
                referenceId: referenceId,
                otp: otp,
            };

            const res = await axios.post(
                "https://api.klimatenet.io/api/v1/notification/verifyotp",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (!res?.data?.isError) {
                try {

                    const payload = {
                        phoneNumberCode: phoneNumberCode,
                        phoneNumber: phoneNumber,
                        password: "",
                        referralCode: "",
                    };

                    const res = await axios.post(
                        "https://api.klimatenet.io/api/v1/user/login",
                        payload,
                        {
                            headers: {
                                "Content-Type": "application/json", "x-reference-id": referenceId, 'x-timezone': new Date().getTimezoneOffset(),
                                'x-app-version': "9.0.0"
                            },
                        }
                    );

                    if (!res?.data?.isError) {
                        localStorage.setItem("user", JSON.stringify(res.data.result));
                        toast.success("Login successful");
                        navigate("/");
                    } else {
                        toast.error(res?.data?.message || "Login failed");
                    }
                } catch (error) {
                    const apiMessage =
                        error?.response?.data?.responseException?.exceptionMessage ||
                        error?.response?.data?.message;

                    toast.error(apiMessage || "Server error. Please try again.");
                } finally {
                    setLoading(false);
                }
            } else {
                toast.error(res?.data?.message || "Login failed");
            }
        } catch (error) {
            const apiMessage =
                error?.response?.data?.responseException?.exceptionMessage ||
                error?.response?.data?.message;

            toast.error(apiMessage || "Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resendOpt = async () => {
        try {

            const payload = {
                phoneNumberCode: phoneNumberCode,
                phoneNumber: phoneNumber,
                referenceId: referenceId,
            };

            const res = await axios.post(
                "https://api.klimatenet.io/api/v1/notification/retryotp",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (!res?.data?.isError) {
                toast.success("Re-send otp successfully");
            } else {
                toast.error(res?.data?.message || "Re-send otp failed");
            }
        } catch (error) {
            const apiMessage =
                error?.response?.data?.responseException?.exceptionMessage ||
                error?.response?.data?.message;

            toast.error(apiMessage || "Server error. Please try again.");
        } finally {
        }
    };

    useEffect(() => {
        document.body.style.margin = "0";
        document.body.style.overflow = "hidden";
        const style = document.createElement("style");
        style.innerHTML = `
      input::placeholder {
        color: rgba(255,255,255,0.7);
      }
    `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.token) {
            navigate('/')
        }
    }, [])

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{ textAlign: "center", marginBottom: "25px" }}>OTP</h2>
                <div>
                    <label style={labelStyle}>otp</label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={"text"}
                            placeholder="Enter otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            style={{ ...inputStyle, paddingRight: "42px" }}
                            onFocus={(e) => (e.target.style.border = "1px solid #CDE800")}
                            onBlur={(e) =>
                                (e.target.style.border = "1px solid rgba(255,255,255,0.4)")
                            }
                        />
                    </div>
                    {errors.otp && (
                        <span style={errorStyle}>{errors.otp}</span>
                    )}
                </div>
                <div
                    style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.8)",
                        textAlign: "end",
                        marginBottom: '18px',
                        marginTop: '2px',
                    }}
                >
                    Didn’t receive the OTP?{" "}
                    <span
                        style={{
                            color: "#CDE800",
                            cursor: "pointer",
                            fontWeight: "600",
                            textDecoration: "underline",
                        }}
                        onClick={() => resendOpt()}
                    >
                        Resend OTP
                    </span>
                </div>
                <button
                    style={buttonStyle}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
                <div
                    style={{
                        marginTop: "14px",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.8)",
                        textAlign: "center",
                    }}
                >
                    Already have an account?{" "}
                    <span
                        style={{
                            color: "#CDE800",
                            cursor: "pointer",
                            fontWeight: "600",
                            textDecoration: "underline",
                        }}
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </span>
                </div>
            </div>
        </div>
    );
};

const containerStyle = {
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    background:
        "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/images/loginBgthree.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px",
    boxSizing: "border-box",
};

const cardStyle = {
    width: "100%",
    maxWidth: "380px",
    padding: "30px 25px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    boxSizing: "border-box",
};

const labelStyle = {
    fontSize: "14px",
    display: "block",
    marginBottom: "6px",
};

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "0.3s",
};

const errorStyle = {
    color: "#ff4d4f",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
};

const buttonStyle = {
    width: "100%",
    padding: "11px",
    borderRadius: "8px",
    border: "none",
    background: "#CDE800",
    color: "#000",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxSizing: "border-box",
};

export default Otp;
