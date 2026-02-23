import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Login = () => {
    const navigate = useNavigate()
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("91");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        let newErrors = {};

        if (!phone) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d+$/.test(phone)) {
            newErrors.phone = "Only numbers are allowed";
        } else if (phone.length < 8) {
            newErrors.phone = "Invalid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const phonePayload = {
            phoneNumberCode: `+${countryCode}`,
            phoneNumber: phone.slice(countryCode.length),
        };
        if (password) {
            try {
                setLoading(true);

                const payload = {
                    ...phonePayload,
                    password,
                    referralCode: "",
                    uid: "",
                };

                const res = await axios.post(
                    "https://api.klimatenet.io/api/v1/user/login",
                    payload,
                    { headers: { "Content-Type": "application/json" } }
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
        }
        else {
            try {
                setLoading(true);

                const payload = {
                    mobileNumberCode: `+${countryCode}`,
                    mobileNumber: phone.slice(countryCode.length),
                    context: "Registration",
                    subContext: "Send OTP",
                    placeHolders: {},
                    referralCode: "",
                };

                const res = await axios.post(
                    "https://api.klimatenet.io/api/v1/notification/single/template",
                    payload,
                    { headers: { "Content-Type": "application/json" } }
                );

                if (!res?.data?.isError) {
                    toast.success("OTP send successfully");
                    navigate("/otp", {
                        state: {...phonePayload, referenceId: res?.data?.result?.output},
                    });
                } else {
                    toast.error(res?.data?.message || "Send otp failed");
                }
            } catch (error) {
                const apiMessage =
                    error?.response?.data?.responseException?.exceptionMessage ||
                    error?.response?.data?.message;

                toast.error(apiMessage || "Server error. Please try again.");
            } finally {
                setLoading(false);
            }
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
                <h2 style={{ textAlign: "center", marginBottom: "25px" }}>Login</h2>
                <div style={{ marginBottom: "18px" }}>
                    <label style={labelStyle}>Phone Number</label>
                    <PhoneInput
                        country={"in"}
                        value={phone}
                        onChange={(value, data) => {
                            setCountryCode(data.dialCode);
                            setPhone(value);
                        }}
                        inputStyle={{
                            width: "100%",
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.4)",
                            color: "#fff",
                            borderRadius: "8px",
                            height: "42px",
                        }}
                        buttonStyle={{
                            border: "none",
                            background: "transparent",
                        }}
                        dropdownStyle={{
                            color: "#000",
                        }}
                        enableSearch
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmit();
                        }}
                    />
                    {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                </div>
                <div style={{ marginBottom: "22px" }}>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ ...inputStyle, paddingRight: "42px" }}
                            onFocus={(e) => (e.target.style.border = "1px solid #CDE800")}
                            onBlur={(e) =>
                                (e.target.style.border = "1px solid rgba(255,255,255,0.4)")
                            }
                        />
                        <div
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {showPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.64 1.8-3.13 3.06-4.44" />
                                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a10.94 10.94 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </div>
                    </div>
                    {errors.password && (
                        <span style={errorStyle}>{errors.password}</span>
                    )}
                </div>
                <div
                    style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.75)",
                        marginBottom: "18px",
                        lineHeight: "1.5",
                        background: "rgba(255,255,255,0.05)",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.15)",
                    }}
                >
                    🔐 <strong>Password login:</strong> Enter your password to sign in instantly.
                    <br />
                    📲 <strong>OTP login:</strong> Leave password empty and click <b>Login</b> to receive an OTP on your phone.
                </div>
                <button
                    style={buttonStyle}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? password ? "Logging in..." : "Sending Otp..." : "Login"}
                </button>
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

export default Login;
