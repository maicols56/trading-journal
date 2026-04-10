import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import bgGif from "./assets/trading_background_animated.gif";
const theme = {
    bg: "#07080d",
    panel: "rgba(15, 18, 31, 0.88)",
    panel2: "rgba(18, 22, 38, 0.94)",
    border: "rgba(139, 92, 246, 0.16)",
    borderStrong: "rgba(139, 92, 246, 0.34)",
    text: "#f5f7fb",
    textSoft: "#c8d0e0",
    textMuted: "#94a3b8",
    purple: "#8b5cf6",
    purple2: "#7c3aed",
    cyan: "#22d3ee",
    green: "#22c55e",
    red: "#ef4444",
    shadow: "0 20px 60px rgba(0,0,0,0.45)",
    innerShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
    radius: "24px",
};
export default function AuthPage() {
    const [mode, setMode] = useState("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errorText, setErrorText] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const title = useMemo(() => mode === "signin"
        ? "Bienvenido de vuelta"
        : "Crea tu cuenta de trader", [mode]);
    const subtitle = useMemo(() => mode === "signin"
        ? "Entra a tu bitácora y sigue ejecutando con disciplina."
        : "Empieza a registrar tus trades, emociones y progreso en un entorno serio.", [mode]);
    const validate = () => {
        setErrorText("");
        setMessage("");
        if (!email.trim()) {
            setErrorText("Escribe tu correo.");
            return false;
        }
        if (!password.trim()) {
            setErrorText("Escribe tu contraseña.");
            return false;
        }
        if (mode === "signup" && password.length < 6) {
            setErrorText("La contraseña debe tener al menos 6 caracteres.");
            return false;
        }
        return true;
    };
    const signUp = async () => {
        if (!validate())
            return;
        setLoading(true);
        setErrorText("");
        setMessage("");
        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
        });
        setLoading(false);
        if (error) {
            setErrorText(error.message);
            return;
        }
        setMessage("Cuenta creada. Revisa tu correo para confirmar el acceso si Supabase lo solicita.");
    };
    const signIn = async () => {
        if (!validate())
            return;
        setLoading(true);
        setErrorText("");
        setMessage("");
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });
        setLoading(false);
        if (error) {
            setErrorText(error.message);
            return;
        }
        setMessage("Sesión iniciada correctamente.");
    };
    const handleSubmit = async () => {
        if (mode === "signin") {
            await signIn();
        }
        else {
            await signUp();
        }
    };
    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            await handleSubmit();
        }
    };
    const cardStyle = {
        background: theme.panel,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow: `${theme.shadow}, ${theme.innerShadow}`,
    };
    const inputStyle = {
        width: "100%",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        color: theme.text,
        padding: "17px 18px",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box",
        transition: "all 0.2s ease",
    };
    const labelStyle = {
        fontSize: "11px",
        color: theme.textMuted,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: "8px",
        display: "block",
        fontWeight: 700,
    };
    return (_jsxs("div", { className: "auth-shell", style: {
            minHeight: "100vh",
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            background: `
  linear-gradient(rgba(5,6,10,0.90), rgba(7,8,13,0.3)),
  url(${bgGif})
`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: theme.text,
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }, children: [_jsx("style", { children: `
          * {
            box-sizing: border-box;
          }

          .auth-input::placeholder {
            color: #64748b;
          }

          .auth-input:focus {
            border-color: rgba(139, 92, 246, 0.40) !important;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.10);
            background: rgba(255,255,255,0.05) !important;
          }

          .auth-switch-btn:hover {
            transform: translateY(-1px);
          }

          .auth-main-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 34px rgba(124,58,237,0.24);
          }

          .auth-secondary-btn:hover {
            background: rgba(255,255,255,0.06) !important;
          }

          .feature-card:hover {
            transform: translateY(-4px);
            border-color: rgba(139,92,246,0.32) !important;
            box-shadow: 0 18px 40px rgba(0,0,0,0.26);
          }

          @media (max-width: 1100px) {
            .feature-grid {
              grid-template-columns: 1fr !important;
              max-width: 520px !important;
            }
          }

          @media (max-width: 980px) {
            .auth-shell {
              grid-template-columns: 1fr !important;
            }

            .auth-left {
              display: none !important;
            }

            .auth-right {
              padding: 28px 18px !important;
            }

            .auth-panel {
              max-width: 100% !important;
              padding: 26px 20px !important;
            }
          }
        ` }), _jsxs("div", { className: "auth-left", style: {
                    position: "relative",
                    overflow: "hidden",
                    padding: "48px",
                    borderRight: "1px solid rgba(139,92,246,0.10)",
                }, children: [_jsx("div", { style: {
                            position: "absolute",
                            inset: 0,
                            background: "radial-gradient(circle at 20% 20%, rgba(139,92,246,0.18), transparent 22%), radial-gradient(circle at 80% 30%, rgba(34,211,238,0.10), transparent 18%), radial-gradient(circle at 50% 80%, rgba(34,197,94,0.08), transparent 20%)",
                            pointerEvents: "none",
                        } }), _jsxs("div", { style: {
                            position: "relative",
                            zIndex: 1,
                            maxWidth: "760px",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            margin: "0 auto",
                        }, children: [_jsxs("div", { style: {
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                }, children: [_jsxs("div", { style: {
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "38px",
                                            width: "100%",
                                        }, children: [_jsx("div", { style: {
                                                    width: "90px",
                                                    height: "90px",
                                                    borderRadius: "26px",
                                                    background: "linear-gradient(135deg, rgba(139,92,246,1), rgba(34,211,238,1))",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "36px",
                                                    boxShadow: "0 16px 40px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                                                    marginBottom: "20px",
                                                }, children: "\uD83D\uDCC8" }), _jsxs("div", { style: {
                                                    fontWeight: 900,
                                                    fontSize: "36px",
                                                    color: "#fff",
                                                    letterSpacing: "0.12em",
                                                    textTransform: "uppercase",
                                                    textAlign: "center",
                                                    lineHeight: 1.15,
                                                    maxWidth: "680px",
                                                }, children: ["Bit\u00E1cora", _jsx("br", {}), "Royal Hack Trade"] })] }), _jsxs("div", { style: {
                                            fontSize: "40px",
                                            lineHeight: 0.94,
                                            fontWeight: 900,
                                            letterSpacing: "-0.05em",
                                            maxWidth: "640px",
                                            fontFamily: 'Georgia, "Times New Roman", serif',
                                        }, children: ["Construye disciplina.", _jsx("span", { style: {
                                                    display: "block",
                                                    background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 35%, #67e8f9 100%)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                }, children: "Ejecuta con enfoque." })] }), _jsxs("div", { style: {
                                            marginTop: "22px",
                                            maxWidth: "580px",
                                            color: "#d8e1ef",
                                            fontSize: "20px",
                                            lineHeight: 1.85,
                                            fontFamily: 'Georgia, "Times New Roman", serif',
                                            fontStyle: "italic",
                                        }, children: [_jsx("br", {}), _jsx("br", {})] })] }), _jsx("div", { className: "feature-grid", style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                    gap: "20px",
                                    marginTop: "34px",
                                }, children: [
                                    ["📊", "Estadísticas", "Mide tu evolución real"],
                                    ["🧠", "Psicología", "Detecta zonas de descontrol"],
                                    ["🎯", "Disciplina", "Opera con estructura"],
                                ].map(([icon, titleText, text]) => (_jsxs("div", { className: "feature-card", style: Object.assign(Object.assign({}, cardStyle), { background: "rgba(255,255,255,0.03)", padding: "28px", minHeight: "180px", borderRadius: "22px", transition: "all 0.25s ease", display: "flex", flexDirection: "column", justifyContent: "center" }), children: [_jsx("div", { style: {
                                                fontSize: "32px",
                                                marginBottom: "14px",
                                                lineHeight: 1,
                                            }, children: icon }), _jsx("div", { style: {
                                                fontSize: "20px",
                                                fontWeight: 800,
                                                color: "#fff",
                                                marginBottom: "8px",
                                            }, children: titleText }), _jsx("div", { style: {
                                                fontSize: "14px",
                                                color: theme.textSoft,
                                                lineHeight: 1.7,
                                            }, children: text })] }, titleText))) })] })] }), _jsx("div", { className: "auth-right", style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "36px",
                }, children: _jsxs("div", { className: "auth-panel", style: Object.assign(Object.assign({ width: "100%", maxWidth: "560px" }, cardStyle), { padding: "38px 36px", background: "linear-gradient(135deg, rgba(17,20,34,0.96), rgba(24,18,43,0.94))" }), children: [_jsxs("div", { style: {
                                display: "flex",
                                gap: "8px",
                                padding: "6px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                marginBottom: "28px",
                            }, children: [_jsx("button", { className: "auth-switch-btn", type: "button", onClick: () => {
                                        setMode("signin");
                                        setErrorText("");
                                        setMessage("");
                                    }, style: {
                                        flex: 1,
                                        border: "none",
                                        borderRadius: "999px",
                                        padding: "14px 16px",
                                        cursor: "pointer",
                                        fontWeight: 800,
                                        fontSize: "14px",
                                        color: mode === "signin" ? "#fff" : theme.textSoft,
                                        background: mode === "signin"
                                            ? "linear-gradient(135deg, rgba(139,92,246,0.32), rgba(34,211,238,0.18))"
                                            : "transparent",
                                        transition: "all 0.2s ease",
                                    }, children: "Iniciar sesi\u00F3n" }), _jsx("button", { className: "auth-switch-btn", type: "button", onClick: () => {
                                        setMode("signup");
                                        setErrorText("");
                                        setMessage("");
                                    }, style: {
                                        flex: 1,
                                        border: "none",
                                        borderRadius: "999px",
                                        padding: "14px 16px",
                                        cursor: "pointer",
                                        fontWeight: 800,
                                        fontSize: "14px",
                                        color: mode === "signup" ? "#fff" : theme.textSoft,
                                        background: mode === "signup"
                                            ? "linear-gradient(135deg, rgba(139,92,246,0.32), rgba(34,211,238,0.18))"
                                            : "transparent",
                                        transition: "all 0.2s ease",
                                    }, children: "Crear cuenta" })] }), _jsx("div", { style: {
                                fontSize: "36px",
                                lineHeight: 1.02,
                                fontWeight: 900,
                                color: "#fff",
                                letterSpacing: "-0.03em",
                                marginBottom: "10px",
                            }, children: title }), _jsx("div", { style: {
                                color: theme.textMuted,
                                fontSize: "15px",
                                lineHeight: 1.8,
                                marginBottom: "28px",
                            }, children: subtitle }), _jsxs("div", { style: { marginBottom: "18px" }, children: [_jsx("label", { style: labelStyle, children: "Correo electr\u00F3nico" }), _jsx("input", { className: "auth-input", type: "email", placeholder: "tucorreo@email.com", value: email, onChange: (e) => setEmail(e.target.value), onKeyDown: handleKeyDown, style: inputStyle })] }), _jsxs("div", { style: { marginBottom: "16px" }, children: [_jsx("label", { style: labelStyle, children: "Contrase\u00F1a" }), _jsxs("div", { style: { position: "relative" }, children: [_jsx("input", { className: "auth-input", type: showPassword ? "text" : "password", placeholder: "Escribe tu contrase\u00F1a", value: password, onChange: (e) => setPassword(e.target.value), onKeyDown: handleKeyDown, style: Object.assign(Object.assign({}, inputStyle), { paddingRight: "92px" }) }), _jsx("button", { type: "button", onClick: () => setShowPassword((p) => !p), style: {
                                                position: "absolute",
                                                right: "12px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                border: "none",
                                                background: "transparent",
                                                color: theme.textMuted,
                                                cursor: "pointer",
                                                fontWeight: 700,
                                                fontSize: "12px",
                                            }, children: showPassword ? "Ocultar" : "Mostrar" })] })] }), errorText && (_jsx("div", { style: {
                                marginBottom: "16px",
                                padding: "14px 15px",
                                borderRadius: "16px",
                                background: "rgba(239,68,68,0.10)",
                                border: "1px solid rgba(239,68,68,0.22)",
                                color: "#ffd6d6",
                                fontSize: "13px",
                                lineHeight: 1.6,
                            }, children: errorText })), message && (_jsx("div", { style: {
                                marginBottom: "16px",
                                padding: "14px 15px",
                                borderRadius: "16px",
                                background: "rgba(34,197,94,0.10)",
                                border: "1px solid rgba(34,197,94,0.22)",
                                color: "#d8ffe8",
                                fontSize: "13px",
                                lineHeight: 1.6,
                            }, children: message })), _jsx("button", { className: "auth-main-btn", type: "button", onClick: handleSubmit, disabled: loading, style: {
                                width: "100%",
                                border: "none",
                                borderRadius: "18px",
                                padding: "17px 18px",
                                cursor: loading ? "not-allowed" : "pointer",
                                fontWeight: 900,
                                fontSize: "14px",
                                letterSpacing: "0.14em",
                                color: "#fff",
                                background: loading
                                    ? "rgba(255,255,255,0.08)"
                                    : "linear-gradient(135deg, #8b5cf6, #22d3ee)",
                                boxShadow: loading
                                    ? "none"
                                    : "0 14px 34px rgba(124,58,237,0.24)",
                                transition: "all 0.2s ease",
                                opacity: loading ? 0.7 : 1,
                            }, children: loading
                                ? mode === "signin"
                                    ? "ENTRANDO..."
                                    : "CREANDO CUENTA..."
                                : mode === "signin"
                                    ? "INICIAR SESIÓN"
                                    : "CREAR CUENTA" }), _jsx("button", { className: "auth-secondary-btn", type: "button", onClick: () => {
                                setMode(mode === "signin" ? "signup" : "signin");
                                setErrorText("");
                                setMessage("");
                            }, style: {
                                width: "100%",
                                marginTop: "14px",
                                borderRadius: "18px",
                                padding: "16px 18px",
                                cursor: "pointer",
                                fontWeight: 700,
                                fontSize: "14px",
                                color: theme.textSoft,
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                transition: "all 0.2s ease",
                            }, children: mode === "signin"
                                ? "No tengo cuenta todavía"
                                : "Ya tengo una cuenta" }), _jsx("div", { style: {
                                marginTop: "22px",
                                paddingTop: "18px",
                                borderTop: "1px solid rgba(255,255,255,0.08)",
                                color: theme.textMuted,
                                fontSize: "13px",
                                lineHeight: 1.7,
                                textAlign: "center",
                            }, children: "Tu progreso, tus trades y tu disciplina, sincronizados en la nube." })] }) })] }));
}
