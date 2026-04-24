var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
const DAILY_RISK_STORAGE_KEY = "mnq_daily_risk_v1";
const EVALUATION_TARGET_STORAGE_KEY = "mnq_evaluation_target_v1";
const HABITS_STORAGE_KEY = "mnq_habits_v1";
const defaultForm = {
    fecha: new Date().toISOString().split("T")[0],
    sesion: "new-york",
    direccion: "long",
    entrada: "",
    salida: "",
    contratos: "1",
    puntosPositivos: "",
    puntosNegativos: "",
    resultado: "",
    razon: "",
    emocion: "neutral",
    seguiPlan: "si",
    malasPracticas: [],
    notas: "",
};
const defaultHabits = {
    dormir: false,
    meditacion: false,
    alimentacion: false,
    hidratacion: false,
    entrenar: false,
    estudio: false,
    rutina: false,
    enfoque: false,
    sinDistracciones: false,
    sinEstres: false,
};
const emociones = [
    "😤 Ansioso",
    "😰 Miedoso",
    "😌 Tranquilo",
    "😎 Confiado",
    "😡 Frustrado",
    "🧘 Neutral",
];
const emotionGroups = [
    {
        zone: "rojo",
        title: "🔴 Descontrol",
        subtitle: "Miedo, presión, impulsividad",
        emotions: [
            { key: "ansioso", label: "😰 Ansioso" },
            { key: "miedoso", label: "😨 Miedoso" },
            { key: "frustrado", label: "😡 Frustrado" },
        ],
    },
    {
        zone: "azul",
        title: "🔵 Claridad",
        subtitle: "Paciencia, orden, control",
        emotions: [
            { key: "tranquilo", label: "😌 Tranquilo" },
            { key: "neutral", label: "🧘 Neutral" },
        ],
    },
    {
        zone: "verde",
        title: "🟢 Euforia",
        subtitle: "Confianza alta, ojo con exceso",
        emotions: [{ key: "confiado", label: "😎 Confiado" }],
    },
];
const emocionKey = [
    "ansioso",
    "miedoso",
    "tranquilo",
    "confiado",
    "frustrado",
    "neutral",
];
const razones = [
    "🏦 Punto institucional",
    "🔮 Oráculo",
    "⏱️ 10 minutos",
    "💥 Punto de ruptura",
    "🧱 Estructura",
];
const malasPracticasOptions = [
    "Moví mi stop loss más lejos",
    "Quité el stop loss",
    "Entré sin confirmación",
    "Entré tarde (FOMO)",
    "Entré antes de tiempo",
    "Entré fuera de mi zona",
    "Entré sin ver el contexto (tendencia / estructura)",
];
const MALAS_PRACTICAS_PREFIX = "__BAD_PRACTICES__=";
function parseStoredNotes(rawNotes) {
    const source = typeof rawNotes === "string" ? rawNotes : rawNotes !== null && rawNotes !== void 0 ? rawNotes : "";
    const markerIndex = source.indexOf(MALAS_PRACTICAS_PREFIX);
    if (markerIndex === -1) {
        return {
            notas: source.trim(),
            malasPracticas: [],
        };
    }
    const notas = source.slice(0, markerIndex).trim();
    const encoded = source.slice(markerIndex + MALAS_PRACTICAS_PREFIX.length).trim();
    try {
        const parsed = JSON.parse(encoded);
        return {
            notas,
            malasPracticas: Array.isArray(parsed) ? parsed : [],
        };
    }
    catch (error) {
        return {
            notas: source.trim(),
            malasPracticas: [],
        };
    }
}
function buildStoredNotes(notas, malasPracticas) {
    const cleanNotes = (notas || "").trim();
    const cleanPractices = Array.isArray(malasPracticas)
        ? malasPracticas.filter(Boolean)
        : [];
    if (!cleanPractices.length)
        return cleanNotes;
    return `${cleanNotes ? `${cleanNotes}\n\n` : ""}${MALAS_PRACTICAS_PREFIX}${JSON.stringify(cleanPractices)}`;
}
const emocionZonaMap = {
    ansioso: "rojo",
    miedoso: "rojo",
    frustrado: "rojo",
    tranquilo: "azul",
    neutral: "azul",
    confiado: "verde",
};
const zonaPuntajeMap = {
    rojo: -1,
    azul: 0,
    verde: 1,
};
const zonaMeta = {
    rojo: {
        label: "🔴 Descontrol",
        color: "#ef4444",
        soft: "rgba(239,68,68,0.16)",
        text: "#ffd1d1",
    },
    azul: {
        label: "🔵 Claridad",
        color: "#38bdf8",
        soft: "rgba(56,189,248,0.16)",
        text: "#d8f2ff",
    },
    verde: {
        label: "🟢 Euforia",
        color: "#22c55e",
        soft: "rgba(34,197,94,0.16)",
        text: "#dcffe8",
    },
};
const theme = {
    bg: "#07080d",
    bgSoft: "#0b0d14",
    panel: "rgba(15, 18, 31, 0.88)",
    panel2: "rgba(18, 22, 38, 0.92)",
    border: "rgba(139, 92, 246, 0.16)",
    borderStrong: "rgba(139, 92, 246, 0.3)",
    text: "#f5f7fb",
    textSoft: "#c8d0e0",
    textMuted: "#94a3b8",
    textDim: "#64748b",
    purple: "#8b5cf6",
    purple2: "#7c3aed",
    cyan: "#22d3ee",
    green: "#22c55e",
    yellow: "#facc15",
    red: "#ef4444",
    shadow: "0 10px 30px rgba(0,0,0,0.35)",
    innerShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
    radius: "18px",
};
const mensajesPorZona = {
    rojo: [
        "⚠️ Tu disciplina está fallando. O corriges ahora o el mercado te cobra.",
        "⚠️ No estás operando tu plan, estás operando tus emociones. Detente.",
        "⚠️ Hoy no estás en control. Reduce riesgo o prepárate para perder.",
        "⚠️ Tu ventaja desapareció. Cada trade así es dinero regalado.",
        "⚠️ Estás forzando entradas. El mercado no te debe nada.",
        "⚠️ Esto ya no es ejecución, es impulso. Vuelve al plan.",
        "⚠️ Tu base no es sólida. Operar así es sabotaje.",
        "⚠️ Estás reaccionando, no ejecutando. Respira y reinicia.",
        "⚠️ Si sigues así, el drawdown es inevitable. Ajusta ahora.",
        "⚠️ No hay claridad. Sin claridad no hay trade.",
    ],
    azul: [
        "🔵 Mantén la claridad. Tu disciplina te trajo hasta aquí, ejecútala.",
        "🔵 Estás haciendo lo correcto. Sigue el plan con mente limpia.",
        "🔵 Confía en tu proceso. Claridad mental, ejecución precisa.",
        "🔵 Tu compromiso se ve. No lo rompas ahora. Ejecuta con calma.",
        "🔵 Respira. Tienes claridad. Solo sigue tu sistema.",
        "🔵 Estás enfocado. No fuerces, deja que el trade llegue.",
        "🔵 La paciencia también es ejecución. Mantén la claridad.",
        "🔵 Vas bien. Disciplina + claridad = ventaja.",
        "🔵 Tu fortaleza hoy es la calma. Opera desde ahí.",
        "🔵 Mantén la mente fría. Tu plan ya está definido.",
    ],
    verde: [
        "🟢 Vas bien, pero cuidado. La euforia es traicionera.",
        "🟢 No confundas confianza con exceso de riesgo.",
        "🟢 Sigue disciplinado. No sobreoperes.",
        "🟢 La racha no es invencibilidad. Mantente firme.",
        "🟢 Controla la emoción. Protege lo ganado.",
    ],
};
const homeWelcomeMessages = [
    "👋 Bienvenido. Tómate un tiempo para entrar en este espacio con calma.",
    "🌅 Cada mañana trae una nueva oportunidad para hacerlo mejor.",
    "✨ Estás respirando, estás aquí y eso ya es una bendición.",
    "🧠 Hoy no vienes a correr. Hoy vienes a pensar claro y actuar bien.",
    "🙏 Agradece este momento. Tu nueva vida se construye desde decisiones pequeñas.",
];
const homeMotivationMessages = [
    "💭 No estás aquí para ganar cada trade, estás aquí para ejecutar bien tu sistema una y otra vez. Si haces eso, las ganancias llegan solas con el tiempo.",
    "⚖️ El mercado no es un lugar para demostrar que tienes razón. Es un lugar para gestionar riesgo. Si entras con ego, sales con pérdidas.",
    "🧠 Cada vez que rompes tu plan, estás enseñándole a tu mente que la indisciplina está permitida. Y eso, tarde o temprano, te cuesta dinero.",
    "🎯 No necesitas más indicadores, necesitas más control emocional. El problema no es la estrategia… eres tú ejecutándola.",
    "💥 Una operación no define tu día. Pero una mala decisión emocional sí puede destruir tu cuenta.",
    "😌 Si sientes ansiedad antes de entrar, probablemente no es una buena entrada. La claridad se siente tranquila, no desesperada.",
    "⏳ El dinero en trading se hace esperando. No operando constantemente. Aprende a aburrirte sin perder disciplina.",
    "🚫 El FOMO te hace entrar tarde, el miedo te hace salir temprano. Si no controlas eso, el mercado siempre te va a cobrar.",
    "✅ El mejor trade muchas veces es el que decides no tomar. No todo movimiento es una oportunidad para ti.",
    "🛑 Si necesitas recuperar pérdidas rápido, ya estás pensando mal. El mercado no se recupera… se respeta.",
];
const homeAdviceMessages = [
    "🎯 Hoy no opero por venganza.",
    "📋 Hoy respeto mi plan.",
    "🧘 Hoy espero contexto antes de entrar.",
    "👁️ Hoy busco claridad, no emoción.",
    "💡 Hoy doy un paso más hacia la vida que quiero.",
    "📈 Hoy soy mejor que ayer.",
    "🔥 Hoy soy el trader que soñé.",
];
const homeChecklistItems = [
    { key: "noRevenge", label: "Hoy no opero por venganza" },
    { key: "doRight", label: "Hoy vengo a hacer lo correcto" },
    { key: "oneStepCloser", label: "Hoy daré un paso más hacia la vida que quiero" },
    { key: "respectPlan", label: "Hoy respetaré mi plan" },
    { key: "betterThanYesterday", label: "Hoy soy mejor que ayer" },
    { key: "dreamTrader", label: "Hoy soy el trader que soñé" },
];
function getSeededMessage(messages, seed) {
    if (!Array.isArray(messages) || !messages.length)
        return "";
    let hash = 0;
    const input = String(seed || "0");
    for (let i = 0; i < input.length; i += 1) {
        hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return messages[hash % messages.length];
}
const emocionPnl = {};
const razonStats = {};
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
}
function getWeekLabel(weekStart) {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4);
    return `${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}`;
}
function getEmotionLabel(key) {
    return emociones[emocionKey.indexOf(key)] || key;
}
function getEmotionZone(key) {
    return emocionZonaMap[key] || "azul";
}
function buildPsychSeries(trades) {
    let acumulado = 0;
    return [...trades]
        .slice()
        .reverse()
        .map((t, idx) => {
        var _a;
        const zona = getEmotionZone(t.emocion);
        const delta = (_a = zonaPuntajeMap[zona]) !== null && _a !== void 0 ? _a : 0;
        acumulado += delta;
        return {
            index: idx + 1,
            id: t.id,
            fecha: t.fecha,
            emocion: t.emocion,
            emocionLabel: getEmotionLabel(t.emocion),
            zona,
            delta,
            acumulado,
            pnl: t.pnl,
            notas: t.notas || "",
        };
    });
}
function getPsychState(series) {
    if (!series.length)
        return null;
    const last = series[series.length - 1];
    return last.zona;
}
function getRepeatedZoneAlert(series) {
    if (series.length < 3)
        return null;
    const last3 = series.slice(-3);
    const same = last3.every((s) => s.zona === last3[0].zona);
    if (!same)
        return null;
    return last3[0].zona;
}
function getRecoveryInfo(series) {
    if (series.length < 4)
        return null;
    const last4 = series.slice(-4);
    const firstHalf = last4.slice(0, 2);
    const secondHalf = last4.slice(2);
    const hadRed = firstHalf.some((i) => i.zona === "rojo");
    const recovered = secondHalf.every((i) => i.zona === "azul" || i.zona === "verde");
    if (hadRed && recovered) {
        return "✅ Recuperación emocional detectada en los últimos trades.";
    }
    const allRed = last4.every((i) => i.zona === "rojo");
    if (allRed) {
        return "⚠️ Sigues en secuencia de descontrol. Baja el ritmo.";
    }
    return null;
}
export default function TradingJournal({ user }) {
    var _a, _b, _c, _d;
    const [mensajeActual, setMensajeActual] = useState("");
    const [trades, setTrades] = useState([]);
    const [form, setForm] = useState(defaultForm);
    const [vista, setVista] = useState("inicio");
    const [semaforo, setSemaforo] = useState("verde");
    const [guardado, setGuardado] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(getWeekStart(new Date()));
    const [dailyRisk, setDailyRisk] = useState({});
    const [evaluationTarget, setEvaluationTarget] = useState(1250);
    const [habits, setHabits] = useState({});
    const [homeChecklist, setHomeChecklist] = useState({
        noRevenge: false,
        doRight: false,
        oneStepCloser: false,
        respectPlan: false,
        betterThanYesterday: false,
        dreamTrader: false,
    });
    useEffect(() => {
        if (!trades.length)
            return;
        // 🔥 SOLO últimos trades (ajústalo a tu gusto)
        const recentTrades = trades.slice(0, 5); // últimos 5
        const score = recentTrades.reduce((acc, t) => {
            const zona = emocionZonaMap[t.emocion] || "azul";
            return acc + zonaMeta[zona].value;
        }, 0) / recentTrades.length;
        let zona = "azul";
        if (score < -0.35)
            zona = "rojo";
        else if (score > 0.35)
            zona = "verde";
        const mensajes = mensajesPorZona[zona];
        const random = mensajes[Math.floor(Math.random() * mensajes.length)];
        setMensajeActual(random);
    }, [trades]);
    useEffect(() => {
        const loadTrades = async () => {
            if (!(user === null || user === void 0 ? void 0 : user.id))
                return;
            const { data, error } = await supabase
                .from("trades")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (error) {
                console.error("Error cargando trades:", error.message);
                return;
            }
            const mappedTrades = (data || []).map((t) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                const parsedNotes = parseStoredNotes(t.notas);
                return {
                    id: t.id,
                    fecha: t.fecha,
                    sesion: t.sesion,
                    direccion: t.direccion,
                    entrada: (_a = t.entrada) !== null && _a !== void 0 ? _a : "",
                    salida: (_b = t.salida) !== null && _b !== void 0 ? _b : "",
                    contratos: String((_c = t.contratos) !== null && _c !== void 0 ? _c : 1),
                    puntosPositivos: t.puntos_positivos !== null && t.puntos_positivos !== undefined
                        ? String(t.puntos_positivos)
                        : "",
                    puntosNegativos: t.puntos_negativos !== null && t.puntos_negativos !== undefined
                        ? String(t.puntos_negativos)
                        : "",
                    resultado: String((_d = t.resultado) !== null && _d !== void 0 ? _d : 0),
                    razon: (_e = t.razon) !== null && _e !== void 0 ? _e : "",
                    emocion: (_f = t.emocion) !== null && _f !== void 0 ? _f : "neutral",
                    seguiPlan: (_g = t.segui_plan) !== null && _g !== void 0 ? _g : "si",
                    malasPracticas: parsedNotes.malasPracticas,
                    notas: parsedNotes.notas,
                    pnl: Number((_j = (_h = t.pnl) !== null && _h !== void 0 ? _h : t.resultado) !== null && _j !== void 0 ? _j : 0),
                };
            });
            setTrades(mappedTrades);
        };
        loadTrades();
        try {
            const storedRisk = localStorage.getItem(DAILY_RISK_STORAGE_KEY);
            if (storedRisk)
                setDailyRisk(JSON.parse(storedRisk));
        }
        catch (e) { }
        try {
            const storedTarget = localStorage.getItem(EVALUATION_TARGET_STORAGE_KEY);
            if (storedTarget) {
                const parsed = Number(storedTarget);
                if (Number.isFinite(parsed) && parsed > 0) {
                    setEvaluationTarget(parsed);
                }
            }
        }
        catch (e) { }
        try {
            const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
            if (storedHabits)
                setHabits(JSON.parse(storedHabits));
        }
        catch (e) { }
    }, [user === null || user === void 0 ? void 0 : user.id]);
    const guardar = (nuevos) => {
        setTrades(nuevos);
    };
    const guardarRiesgoPorDia = (riskMap) => {
        setDailyRisk(riskMap);
        try {
            localStorage.setItem(DAILY_RISK_STORAGE_KEY, JSON.stringify(riskMap));
        }
        catch (e) { }
    };
    const guardarHabitos = (map) => {
        setHabits(map);
        try {
            localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(map));
        }
        catch (e) { }
    };
    const setRiskForDate = (date, value) => {
        const cleanValue = Math.max(1, parseInt(value || "1", 10) || 1);
        const updated = Object.assign(Object.assign({}, dailyRisk), { [date]: cleanValue });
        guardarRiesgoPorDia(updated);
    };
    const setEvaluationGoal = (value) => {
        const cleanValue = Math.max(1, parseInt(value || "1", 10) || 1);
        setEvaluationTarget(cleanValue);
        try {
            localStorage.setItem(EVALUATION_TARGET_STORAGE_KEY, String(cleanValue));
        }
        catch (e) { }
    };
    const toggleHabit = (date, key) => {
        const current = habits[date] || defaultHabits;
        const updated = Object.assign(Object.assign({}, habits), { [date]: Object.assign(Object.assign({}, current), { [key]: !current[key] }) });
        guardarHabitos(updated);
    };
    const getNumericValue = (value) => {
        if (value === "")
            return "";
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : "";
    };
    const calcularResultadoPorPuntos = (positivos, negativos, contratos) => {
        const pos = Math.max(0, parseFloat(positivos || "0") || 0);
        const neg = Math.max(0, parseFloat(negativos || "0") || 0);
        const cont = Math.min(100, Math.max(1, parseInt(contratos || "1", 10) || 1));
        return (pos - neg) * cont * 2;
    };
    const f = (v) => setForm((p) => (Object.assign(Object.assign({}, p), v)));
    const toggleMalaPractica = (item) => {
        setForm((prev) => {
            const current = prev.malasPracticas || [];
            const exists = current.includes(item);
            return Object.assign(Object.assign({}, prev), { malasPracticas: exists
                    ? current.filter((value) => value !== item)
                    : [...current, item] });
        });
    };
    const actualizarPuntosYResultado = (campo, value) => {
        setForm((prev) => {
            const nextValue = getNumericValue(value);
            const next = Object.assign(Object.assign({}, prev), { [campo]: nextValue === "" ? "" : String(nextValue) });
            const hayPuntos = (parseFloat(next.puntosPositivos || "0") || 0) > 0 ||
                (parseFloat(next.puntosNegativos || "0") || 0) > 0;
            if (hayPuntos) {
                next.resultado = String(calcularResultadoPorPuntos(next.puntosPositivos, next.puntosNegativos, next.contratos));
            }
            return next;
        });
    };
    const actualizarContratos = (raw) => {
        setForm((prev) => {
            if (raw === "") {
                return Object.assign(Object.assign({}, prev), { contratos: "" });
            }
            const num = Math.min(100, Math.max(1, parseInt(raw, 10) || 1));
            const next = Object.assign(Object.assign({}, prev), { contratos: String(num) });
            const hayPuntos = (parseFloat(next.puntosPositivos || "0") || 0) > 0 ||
                (parseFloat(next.puntosNegativos || "0") || 0) > 0;
            if (hayPuntos) {
                next.resultado = String(calcularResultadoPorPuntos(next.puntosPositivos, next.puntosNegativos, next.contratos));
            }
            return next;
        });
    };
    const hoy = new Date().toISOString().split("T")[0];
    const riesgoBaseHoy = Math.max(1, Number((_a = dailyRisk[hoy]) !== null && _a !== void 0 ? _a : 150) || 150);
    const tradesHoy = trades.filter((t) => t.fecha === hoy);
    const pnlHoy = tradesHoy.reduce((a, b) => a + b.pnl, 0);
    const pnlTotal = trades.reduce((a, b) => a + b.pnl, 0);
    const ganadores = trades.filter((t) => t.pnl > 0).length;
    const winRate = trades.length
        ? Math.round((ganadores / trades.length) * 100)
        : 0;
    const barraRiesgo = Math.min((Math.abs(Math.min(pnlHoy, 0)) / riesgoBaseHoy) * 100, 100);
    const riesgoPorTrade = Math.round(riesgoBaseHoy * 0.25);
    useEffect(() => {
        if (pnlHoy <= -riesgoBaseHoy * 0.7) {
            setSemaforo("rojo");
        }
        else if (pnlHoy < 0) {
            setSemaforo("amarillo");
        }
        else {
            setSemaforo("verde");
        }
    }, [pnlHoy, riesgoBaseHoy]);
    const agregarTrade = async () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (semaforo === "rojo")
            return;
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
            alert("No hay usuario autenticado.");
            return;
        }
        const contratosNum = Math.min(100, Math.max(1, parseInt(form.contratos || "1", 10) || 1));
        const puntosPos = Math.max(0, parseFloat(form.puntosPositivos || "0") || 0);
        const puntosNeg = Math.max(0, parseFloat(form.puntosNegativos || "0") || 0);
        const hayPuntos = puntosPos > 0 || puntosNeg > 0;
        const tienePrecios = form.entrada !== "" && form.salida !== "";
        const resultadoCalculado = hayPuntos
            ? calcularResultadoPorPuntos(puntosPos, puntosNeg, contratosNum)
            : parseFloat(form.resultado || "0");
        if (!hayPuntos && !tienePrecios && !form.resultado)
            return;
        if (!hayPuntos && !form.resultado)
            return;
        const tradePayload = {
            user_id: user.id,
            fecha: form.fecha,
            sesion: form.sesion,
            direccion: form.direccion,
            entrada: form.entrada === "" ? null : Number(form.entrada),
            salida: form.salida === "" ? null : Number(form.salida),
            contratos: contratosNum,
            puntos_positivos: puntosPos,
            puntos_negativos: puntosNeg,
            resultado: resultadoCalculado,
            pnl: resultadoCalculado,
            razon: form.razon || null,
            emocion: form.emocion,
            segui_plan: form.seguiPlan,
            notas: buildStoredNotes(form.notas, form.malasPracticas) || null,
        };
        const { data, error } = await supabase
            .from("trades")
            .insert(tradePayload)
            .select()
            .single();
        console.log("tradePayload:", tradePayload);
        console.log("supabase error:", error);
        console.log("supabase data:", data);
        if (error) {
            console.error("Error guardando trade:", error.message);
            alert("No se pudo guardar el trade.");
            return;
        }
        const parsedNewNotes = parseStoredNotes(data.notas);
        const nuevo = {
            id: data.id,
            fecha: data.fecha,
            sesion: data.sesion,
            direccion: data.direccion,
            entrada: (_a = data.entrada) !== null && _a !== void 0 ? _a : "",
            salida: (_b = data.salida) !== null && _b !== void 0 ? _b : "",
            contratos: String((_c = data.contratos) !== null && _c !== void 0 ? _c : 1),
            puntosPositivos: data.puntos_positivos !== null && data.puntos_positivos !== undefined
                ? String(data.puntos_positivos)
                : "",
            puntosNegativos: data.puntos_negativos !== null && data.puntos_negativos !== undefined
                ? String(data.puntos_negativos)
                : "",
            resultado: String((_d = data.resultado) !== null && _d !== void 0 ? _d : 0),
            razon: (_e = data.razon) !== null && _e !== void 0 ? _e : "",
            emocion: (_f = data.emocion) !== null && _f !== void 0 ? _f : "neutral",
            seguiPlan: (_g = data.segui_plan) !== null && _g !== void 0 ? _g : "si",
            malasPracticas: parsedNewNotes.malasPracticas,
            notas: parsedNewNotes.notas,
            pnl: Number((_j = (_h = data.pnl) !== null && _h !== void 0 ? _h : data.resultado) !== null && _j !== void 0 ? _j : 0),
        };
        setTrades((prev) => [nuevo, ...prev]);
        setForm(Object.assign(Object.assign({}, defaultForm), { fecha: form.fecha }));
        setGuardado(true);
        setTimeout(() => setGuardado(false), 1800);
        if (form.seguiPlan === "no") {
            setTimeout(() => {
                alert("⚠️ Ojo: este trade quedó marcado como fuera del plan. Revísalo.");
            }, 120);
        }
    };
    const eliminar = async (id) => {
        const { error } = await supabase.from("trades").delete().eq("id", id);
        if (error) {
            console.error("Error eliminando trade:", error.message);
            alert("No se pudo eliminar el trade.");
            return;
        }
        setTrades((prev) => prev.filter((t) => t.id !== id));
    };
    const weekTrades = trades.filter((t) => getWeekStart(t.fecha) === selectedWeek);
    const weekPnl = weekTrades.reduce((a, b) => a + b.pnl, 0);
    const weekWinners = weekTrades.filter((t) => t.pnl > 0).length;
    const weekWinRate = weekTrades.length
        ? Math.round((weekWinners / weekTrades.length) * 100)
        : 0;
    const weekNewYork = weekTrades.filter((t) => t.sesion === "new-york");
    const weekAsia = weekTrades.filter((t) => t.sesion === "asia");
    const pnlNewYork = weekNewYork.reduce((a, b) => a + b.pnl, 0);
    const pnlAsia = weekAsia.reduce((a, b) => a + b.pnl, 0);
    const weekSiguioPlan = weekTrades.filter((t) => t.seguiPlan === "si").length;
    const weekNoSiguio = weekTrades.filter((t) => t.seguiPlan === "no").length;
    const emocionCount = {};
    weekTrades.forEach((t) => {
        emocionCount[t.emocion] = (emocionCount[t.emocion] || 0) + 1;
    });
    const topEmocion = Object.entries(emocionCount).sort((a, b) => b[1] - a[1])[0];
    const emocionRanking = Object.entries(emocionPnl)
        .map(([em, data]) => ({
        emocion: em,
        avg: data.count ? data.total / data.count : 0,
        total: data.total,
        count: data.count,
    }))
        .sort((a, b) => b.avg - a.avg);
    const razonRanking = Object.entries(razonStats)
        .map(([razon, data]) => ({
        razon,
        avg: data.count ? data.total / data.count : 0,
        total: data.total,
        count: data.count,
    }))
        .sort((a, b) => b.avg - a.avg);
    trades.forEach((t) => {
        if (!emocionPnl[t.emocion])
            emocionPnl[t.emocion] = { total: 0, count: 0 };
        emocionPnl[t.emocion].total += t.pnl;
        emocionPnl[t.emocion].count += 1;
    });
    const mejorEmocion = emocionRanking[0];
    const peorEmocion = emocionRanking[emocionRanking.length - 1];
    const weeks = [...new Set(trades.map((t) => getWeekStart(t.fecha)))]
        .sort()
        .reverse();
    if (!weeks.includes(getWeekStart(new Date())))
        weeks.unshift(getWeekStart(new Date()));
    const diasConGanancia = [
        ...new Set(weekTrades.filter((t) => t.pnl > 0).map((t) => t.fecha)),
    ].length;
    const perdidasNoPlan = trades
        .filter((t) => t.seguiPlan === "no")
        .reduce((a, b) => a + b.pnl, 0);
    trades.forEach((t) => {
        if (!t.razon)
            return;
        if (!razonStats[t.razon]) {
            razonStats[t.razon] = { total: 0, count: 0 };
        }
        razonStats[t.razon].total += t.pnl;
        razonStats[t.razon].count += 1;
    });
    const mejorSetup = razonRanking[0];
    const peorSetup = razonRanking[razonRanking.length - 1];
    const badPracticeStats = {};
    trades.forEach((t) => {
        const practices = Array.isArray(t.malasPracticas) ? t.malasPracticas : [];
        practices.forEach((practice) => {
            if (!badPracticeStats[practice]) {
                badPracticeStats[practice] = {
                    count: 0,
                    totalPnl: 0,
                    wins: 0,
                    losses: 0,
                };
            }
            badPracticeStats[practice].count += 1;
            badPracticeStats[practice].totalPnl += Number(t.pnl || 0);
            if (Number(t.pnl || 0) > 0)
                badPracticeStats[practice].wins += 1;
            if (Number(t.pnl || 0) < 0)
                badPracticeStats[practice].losses += 1;
        });
    });
    const badPracticeRanking = Object.entries(badPracticeStats)
        .map(([name, data]) => ({
        name,
        count: data.count,
        totalPnl: data.totalPnl,
        wins: data.wins,
        losses: data.losses,
        lossRate: data.count ? Math.round((data.losses / data.count) * 100) : 0,
    }))
        .sort((a, b) => b.count - a.count);
    const topBadPractice = badPracticeRanking[0];
    const mostExpensiveBadPractice = [...badPracticeRanking].sort((a, b) => a.totalPnl - b.totalPnl)[0];
    const mostToxicBadPractice = [...badPracticeRanking].sort((a, b) => b.lossRate - a.lossRate || b.count - a.count)[0];
    const todayHabits = habits[hoy] || defaultHabits;
    const habitList = [
        { key: "dormir", label: "😴 Dormí bien (7-8h)" },
        { key: "meditacion", label: "🧘 Medité" },
        { key: "alimentacion", label: "🥗 Buena alimentación" },
        { key: "hidratacion", label: "💧 Buena hidratación" },
        { key: "entrenar", label: "🏋️ Entrené" },
        { key: "estudio", label: "📚 Estudié / repasé trading" },
        { key: "rutina", label: "📅 Seguí rutina" },
        { key: "enfoque", label: "🎯 Enfoque total" },
        { key: "sinDistracciones", label: "📵 Sin distracciones" },
        { key: "sinEstres", label: "😌 Mente tranquila" },
    ];
    const habitsDone = Object.values(todayHabits).filter(Boolean).length;
    const habitsPercent = Math.round((habitsDone / habitList.length) * 100);
    const psychSeries = buildPsychSeries(trades);
    const psychCurrentState = getPsychState(psychSeries);
    const psychRepeatedAlert = getRepeatedZoneAlert(psychSeries);
    const psychRecoveryMessage = getRecoveryInfo(psychSeries);
    const zonaCount = { rojo: 0, azul: 0, verde: 0 };
    trades.forEach((t) => {
        const zona = getEmotionZone(t.emocion);
        zonaCount[zona] += 1;
    });
    const currentZoneMeta = psychCurrentState
        ? zonaMeta[psychCurrentState]
        : null;
    const displayName = ((_b = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _b === void 0 ? void 0 : _b.full_name) ||
        ((_c = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _c === void 0 ? void 0 : _c.name) ||
        ((user === null || user === void 0 ? void 0 : user.email) ? String(user.email).split("@")[0] : "Trader");
    const now = new Date();
    const currentHour = now.getHours();
    const formattedTime = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
    const timeGreeting = currentHour < 12 ? "Buenos días" : currentHour < 19 ? "Buenas tardes" : "Buenas noches";
    const todaySeed = `${hoy}-${trades.length}-${winRate}-${pnlTotal}`;
    const homeWelcome = getSeededMessage(homeWelcomeMessages, todaySeed);
    const homeMotivation = getSeededMessage(homeMotivationMessages, `${todaySeed}-motivation`);
    const homeAdvice = getSeededMessage(homeAdviceMessages, `${todaySeed}-advice`);
    const lastTrade = trades[0] || null;
    const homeMainMessage = "🙏 Bienvenido. Tómate un tiempo para este espacio, agradece que puedes hacer esto cada mañana, estás respirando y tienes una nueva oportunidad.";
    const homeNeedToHear = "Tu nueva vida te espera, pero solo si haces las cosas bien. Hoy no vienes a impresionar a nadie; hoy vienes a respetarte, a pensar con claridad y a ejecutar con disciplina.";
    const homeProjectIdea = "Un inicio limpio para centrarte antes de operar: recordar quién quieres ser, qué tienes que hacer hoy y entrar al mercado con la mente en su sitio.";
    const semaforoColor = {
        verde: {
            bg: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.06))",
            pill: theme.green,
            text: "#d8ffe8",
            label: "🟢 VERDE — Operar normal",
        },
        amarillo: {
            bg: "linear-gradient(135deg, rgba(250,204,21,0.2), rgba(250,204,21,0.06))",
            pill: theme.yellow,
            text: "#fff8d1",
            label: "🟡 AMARILLO — Modo defensivo",
        },
        rojo: {
            bg: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.06))",
            pill: theme.red,
            text: "#ffe2e2",
            label: "🔴 ROJO — No operar hoy",
        },
    };
    const navigate = useNavigate();
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };
    const analizarConIA = async () => {
        var _a;
        if (trades.length < 3) {
            setAiAnalysis("Necesitas al menos 3 trades registrados para obtener un análisis. ¡Sigue operando y vuelve aquí!");
            return;
        }
        setAiLoading(true);
        setAiAnalysis("");
        const resumen = trades
            .slice(0, 50)
            .map((t) => `Fecha: ${t.fecha} | Sesión: ${t.sesion === "new-york"
            ? "New York"
            : t.sesion === "asia"
                ? "Asia"
                : t.sesion} | ${t.direccion.toUpperCase()} | Resultado: $${t.pnl} | Emoción: ${t.emocion} | Zona: ${getEmotionZone(t.emocion)} | Razón: ${t.razon} | Siguió plan: ${t.seguiPlan} | Contratos: ${t.contratos} | Notas: ${t.notas}`)
            .join("\n");
        const stats = `
Total trades: ${trades.length}
Win rate global: ${winRate}%
P&L total: $${pnlTotal.toFixed(0)}
Trades siguiendo el plan: ${trades.filter((t) => t.seguiPlan === "si").length}
Trades sin seguir el plan: ${trades.filter((t) => t.seguiPlan === "no").length}
P&L sesión New York: $${pnlNewYork.toFixed(0)}
P&L sesión Asia: $${pnlAsia.toFixed(0)}
Mejor setup promedio: ${(mejorSetup === null || mejorSetup === void 0 ? void 0 : mejorSetup.razon) || "N/A"} ${mejorSetup ? `($${mejorSetup.avg.toFixed(0)})` : ""}
Peor setup promedio: ${(peorSetup === null || peorSetup === void 0 ? void 0 : peorSetup.razon) || "N/A"} ${peorSetup ? `($${peorSetup.avg.toFixed(0)})` : ""}
Costo de no seguir el plan: $${perdidasNoPlan.toFixed(0)}
Meta evaluación: $${evaluationTarget.toFixed(0)}
Hábitos hoy: ${habitsDone}/${habitList.length} (${habitsPercent}%)
Zona emocional actual: ${psychCurrentState || "N/A"}
Rojos: ${zonaCount.rojo}
Azules: ${zonaCount.azul}
Verdes: ${zonaCount.verde}
    `.trim();
        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: `Eres un coach experto en trading de futuros, especializado en MNQ (Micro Nasdaq). 
Analizas el diario de trading de un trader principiante con una cuenta de fondeo de $25K con un Max Loss Limit de $1,000.
Su objetivo semanal es +$300 y su riesgo máximo por trade es configurable por el usuario.
Opera en sesión New York y sesión Asia.

Analiza sus trades con empatía pero con honestidad. Identifica patrones concretos de fallo y da recomendaciones muy específicas y accionables.
Estructura tu respuesta SIEMPRE así (usa estos emojis y títulos exactos):

🔍 DIAGNÓSTICO GENERAL
(2-3 frases resumiendo el estado general)

❌ EN QUÉ ESTÁS FALLANDO
(lista de 2-4 puntos concretos con datos específicos de sus trades)

✅ QUÉ ESTÁS HACIENDO BIEN
(lista de 1-3 puntos positivos reales)

🎯 RECOMENDACIONES PARA ESTA SEMANA
(lista de 2-3 acciones muy concretas y específicas)

⚠️ ALERTA PRINCIPAL
(1 sola cosa crítica en la que debe enfocarse)

Sé directo, usa datos concretos de sus trades, habla en español y tutéale.`,
                    messages: [
                        {
                            role: "user",
                            content: `Analiza mi diario de trading:\n\nESTADÍSTICAS GENERALES:\n${stats}\n\nÚLTIMOS TRADES:\n${resumen}`,
                        },
                    ],
                }),
            });
            const data = await response.json();
            const text = ((_a = data.content) === null || _a === void 0 ? void 0 : _a.map((i) => i.text || "").join("")) ||
                "No se pudo obtener el análisis.";
            setAiAnalysis(text);
        }
        catch (err) {
            setAiAnalysis("Error al conectar con el análisis. Verifica tu conexión e inténtalo de nuevo.");
        }
        setAiLoading(false);
    };
    const formatAiText = (text) => {
        return text.split("\n").map((line, i) => {
            if (line.startsWith("🔍") ||
                line.startsWith("❌") ||
                line.startsWith("✅") ||
                line.startsWith("🎯") ||
                line.startsWith("⚠️")) {
                return (_jsx("div", { style: {
                        color: "#e9ddff",
                        fontWeight: 700,
                        marginTop: "18px",
                        marginBottom: "8px",
                        fontSize: "12px",
                        letterSpacing: "1.2px",
                    }, children: line }, i));
            }
            if (line.startsWith("- ") || line.startsWith("• ")) {
                return (_jsx("div", { style: {
                        color: theme.textSoft,
                        fontSize: "13px",
                        marginBottom: "7px",
                        paddingLeft: "10px",
                        borderLeft: "2px solid rgba(139, 92, 246, 0.25)",
                    }, children: line }, i));
            }
            return line ? (_jsx("div", { style: {
                    color: theme.textSoft,
                    fontSize: "13px",
                    marginBottom: "6px",
                    lineHeight: 1.75,
                }, children: line }, i)) : (_jsx("div", { style: { height: "6px" } }, i));
        });
    };
    const shellStyle = {
        minHeight: "100vh",
        color: theme.text,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: `
      radial-gradient(circle at top left, rgba(124,58,237,0.16), transparent 28%),
      radial-gradient(circle at top right, rgba(34,211,238,0.08), transparent 22%),
      linear-gradient(180deg, #05060a 0%, #07080d 45%, #090b11 100%)
    `,
        paddingBottom: "40px",
    };
    const cardStyle = {
        background: theme.panel,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius,
        boxShadow: `${theme.shadow}, ${theme.innerShadow}`,
    };
    return (_jsxs("div", { style: shellStyle, children: [_jsx("div", { style: {
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    background: "rgba(7, 8, 13, 0.78)",
                    borderBottom: "1px solid rgba(139, 92, 246, 0.12)",
                }, children: _jsx("div", { style: {
                        maxWidth: "920px",
                        margin: "0 auto",
                        padding: "22px 20px 16px",
                    }, children: _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px 18px 14px", background: "linear-gradient(135deg, rgba(17, 20, 34, 0.95), rgba(24, 18, 43, 0.92))" }), children: [_jsxs("div", { style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: "16px",
                                    flexWrap: "wrap",
                                }, children: [_jsxs("div", { style: { display: "flex", gap: "14px", alignItems: "center" }, children: [_jsx("div", { style: {
                                                    width: "52px",
                                                    height: "52px",
                                                    borderRadius: "16px",
                                                    background: "linear-gradient(135deg, rgba(139,92,246,1), rgba(34,211,238,1))",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "22px",
                                                    fontWeight: 800,
                                                    color: "#fff",
                                                    boxShadow: "0 12px 30px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                                                }, children: "\uD83D\uDCC8" }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "10px",
                                                            flexWrap: "wrap",
                                                        }, children: [_jsx("div", { style: {
                                                                    fontSize: "22px",
                                                                    fontWeight: 800,
                                                                    letterSpacing: "-0.02em",
                                                                    color: "#fff",
                                                                }, children: "MNQ BITACORA" }), _jsx("button", { onClick: () => setVista("inicio"), style: {
                                                                    border: vista === "inicio"
                                                                        ? "1px solid rgba(255,255,255,0.14)"
                                                                        : "1px solid rgba(255,255,255,0.08)",
                                                                    background: vista === "inicio"
                                                                        ? "rgba(255,255,255,0.08)"
                                                                        : "rgba(255,255,255,0.03)",
                                                                    color: "#fff",
                                                                    borderRadius: "999px",
                                                                    padding: "8px 12px",
                                                                    cursor: "pointer",
                                                                    fontSize: "12px",
                                                                    fontWeight: 700,
                                                                }, children: "Inicio" })] }), _jsx("div", { style: {
                                                            marginTop: "4px",
                                                            fontSize: "12px",
                                                            color: theme.textMuted,
                                                            letterSpacing: "0.16em",
                                                            textTransform: "uppercase",
                                                        }, children: "ROYAL HACK TRADE" })] })] }), _jsxs("div", { style: {
                                            display: "flex",
                                            gap: "8px",
                                            flexWrap: "wrap",
                                            justifyContent: "flex-end",
                                        }, children: [_jsx(TopPill, { label: "Win Rate", value: `${winRate}%`, valueColor: winRate >= 50 ? theme.green : theme.yellow }), _jsx(TopPill, { label: "P&L Total", value: `${pnlTotal >= 0 ? "+" : ""}$${pnlTotal.toFixed(0)}`, valueColor: pnlTotal >= 0 ? theme.green : theme.red }), _jsx(TopPill, { label: "Trades", value: trades.length, valueColor: theme.cyan })] })] }), _jsxs("div", { style: {
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "18px",
                                    overflowX: "auto",
                                    paddingBottom: "2px",
                                }, children: [[
                                        ["registro", "✏️ Registrar"],
                                        ["historial", "📋 Historial"],
                                        ["semana", "📅 Semana"],
                                        ["coach", "🤖 Coach IA"],
                                        ["habitos", "🧠 Hábitos"],
                                        ["psicologia", "📉 Psicología"],
                                        ["stats", "📊 Stats"],
                                    ].map(([key, label]) => {
                                        const active = vista === key;
                                        return (_jsx("button", { onClick: () => setVista(key), style: {
                                                border: active
                                                    ? "1px solid rgba(139,92,246,0.45)"
                                                    : "1px solid rgba(148,163,184,0.12)",
                                                background: active
                                                    ? "linear-gradient(135deg, rgba(139,92,246,0.28), rgba(34,211,238,0.16))"
                                                    : "rgba(255,255,255,0.02)",
                                                color: active ? "#fff" : theme.textSoft,
                                                borderRadius: "999px",
                                                padding: "10px 16px",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                                transition: "all 0.22s ease",
                                                boxShadow: active
                                                    ? "0 8px 20px rgba(139,92,246,0.18)"
                                                    : "none",
                                            }, children: label }, key));
                                    }), _jsx("button", { onClick: handleLogout, style: {
                                            padding: "10px 14px",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            background: "rgba(239,68,68,0.12)",
                                            color: "#fff",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                        }, children: "\uD83D\uDEAA Logout" })] })] }) }) }), _jsxs("div", { style: {
                    padding: "20px",
                    maxWidth: "920px",
                    margin: "0 auto",
                }, children: [vista !== "inicio" && (_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "18px", background: semaforoColor[semaforo].bg, border: `1px solid ${semaforo === "verde"
                                ? "rgba(34,197,94,0.22)"
                                : semaforo === "amarillo"
                                    ? "rgba(250,204,21,0.22)"
                                    : "rgba(239,68,68,0.22)"}` }), children: [_jsxs("div", { style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                    marginBottom: "14px",
                                }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "6px",
                                                }, children: "Sem\u00E1foro del d\u00EDa" }), _jsx("div", { style: {
                                                    fontSize: "16px",
                                                    fontWeight: 700,
                                                    color: semaforoColor[semaforo].text,
                                                }, children: semaforoColor[semaforo].label })] }), _jsxs("div", { style: {
                                            textAlign: "right",
                                            minWidth: "160px",
                                        }, children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.12em",
                                                    textTransform: "uppercase",
                                                }, children: "P&L de hoy" }), _jsxs("div", { style: {
                                                    marginTop: "4px",
                                                    fontSize: "28px",
                                                    lineHeight: 1,
                                                    fontWeight: 800,
                                                    color: pnlHoy >= 0 ? theme.green : theme.red,
                                                    fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                                }, children: [pnlHoy >= 0 ? "+" : "", "$", pnlHoy.toFixed(0)] })] })] }), _jsx("div", { style: { display: "flex", gap: "10px", marginBottom: "14px" }, children: ["verde", "amarillo", "rojo"].map((s) => {
                                    const active = semaforo === s;
                                    return (_jsxs("button", { onClick: () => setSemaforo(s), style: {
                                            flex: 1,
                                            padding: "11px 8px",
                                            borderRadius: "12px",
                                            border: active
                                                ? `1px solid ${semaforoColor[s].pill}`
                                                : "1px solid rgba(255,255,255,0.08)",
                                            background: active
                                                ? "rgba(255,255,255,0.08)"
                                                : "rgba(255,255,255,0.03)",
                                            color: active ? "#fff" : theme.textSoft,
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            transition: "all 0.22s ease",
                                            boxShadow: active
                                                ? `0 8px 24px ${semaforoColor[s].pill}22`
                                                : "none",
                                        }, children: [s === "verde" ? "🟢" : s === "amarillo" ? "🟡" : "🔴", " ", s.toUpperCase()] }, s));
                                }) }), mensajeActual && (_jsx("div", { style: {
                                    marginTop: "14px",
                                    padding: "14px 16px",
                                    borderRadius: "14px",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    fontSize: "14px",
                                    color: "#fff",
                                    lineHeight: 1.6,
                                    fontWeight: 600,
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                                }, children: mensajeActual })), _jsxs("div", { style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                    alignItems: "flex-end",
                                    flexWrap: "wrap",
                                    marginBottom: "8px",
                                }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textSoft,
                                                    letterSpacing: "0.08em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "6px",
                                                }, children: "Riesgo consumido" }), _jsxs("div", { style: {
                                                    fontSize: "12px",
                                                    color: theme.textMuted,
                                                }, children: ["Guardado por fecha. Hoy usa el valor de ", hoy] })] }), _jsxs("div", { style: { minWidth: "140px" }, children: [_jsx("div", { style: {
                                                    fontSize: "10px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.08em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "6px",
                                                    textAlign: "right",
                                                }, children: "Riesgo diario" }), _jsx(SmallInput, { type: "number", min: "1", step: "1", value: (_d = dailyRisk[hoy]) !== null && _d !== void 0 ? _d : 150, onChange: (e) => setRiskForDate(hoy, e.target.value), style: { marginLeft: "auto" } }), _jsxs("div", { style: {
                                                    fontSize: "12px",
                                                    color: theme.cyan,
                                                    marginTop: "6px",
                                                    textAlign: "right",
                                                }, children: ["\uD83D\uDCB0 Riesgo sugerido por trade: $", riesgoPorTrade] })] })] }), _jsxs("div", { style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "8px",
                                }, children: [_jsx("span", { style: {
                                            fontSize: "11px",
                                            color: theme.textSoft,
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                        }, children: "Porcentaje usado" }), _jsxs("span", { style: {
                                            fontSize: "12px",
                                            color: theme.textSoft,
                                            fontWeight: 700,
                                        }, children: [Math.round(barraRiesgo), "%"] })] }), _jsx("div", { style: {
                                    height: "10px",
                                    background: "rgba(255,255,255,0.06)",
                                    borderRadius: "999px",
                                    overflow: "hidden",
                                }, children: _jsx("div", { style: {
                                        height: "100%",
                                        borderRadius: "999px",
                                        transition: "width 0.5s",
                                        width: `${barraRiesgo}%`,
                                        background: barraRiesgo < 50
                                            ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                                            : barraRiesgo < 80
                                                ? "linear-gradient(90deg, #facc15, #f59e0b)"
                                                : "linear-gradient(90deg, #ef4444, #fb7185)",
                                    } }) }), _jsxs("div", { style: {
                                    fontSize: "12px",
                                    color: theme.textMuted,
                                    marginTop: "8px",
                                }, children: ["Margen restante hoy:", " ", _jsxs("span", { style: { color: "#fff", fontWeight: 700 }, children: ["$", Math.max(0, riesgoBaseHoy + pnlHoy).toFixed(0)] }), " ", "/ $", riesgoBaseHoy, " \u00B7 ", tradesHoy.length, " trade", tradesHoy.length !== 1 ? "s" : ""] })] })), vista === "inicio" && (_jsxs("div", { style: { display: "grid", gap: "16px" }, children: [_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "26px", background: "rgba(15, 18, 31, 0.88)", border: "1px solid rgba(255,255,255,0.08)" }), children: [_jsxs("div", { style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: "12px",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            marginBottom: "18px",
                                        }, children: [_jsx("div", { style: {
                                                    fontSize: "13px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.08em",
                                                    textTransform: "uppercase",
                                                }, children: timeGreeting }), _jsx("div", { style: {
                                                    fontSize: "13px",
                                                    color: theme.textMuted,
                                                    padding: "8px 12px",
                                                    borderRadius: "999px",
                                                    background: "rgba(255,255,255,0.03)",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                }, children: formattedTime })] }), _jsxs("div", { style: {
                                            fontSize: "30px",
                                            lineHeight: 1.08,
                                            fontWeight: 700,
                                            color: "#fff",
                                            letterSpacing: "-0.02em",
                                            marginBottom: "14px",
                                        }, children: ["Bienvenido, ", displayName, " \uD83D\uDC4B"] }), _jsxs("div", { style: {
                                            fontSize: "16px",
                                            lineHeight: 1.95,
                                            color: theme.textSoft,
                                            maxWidth: "820px",
                                            fontWeight: 400,
                                        }, children: [homeMainMessage, _jsx("br", {}), _jsx("br", {}), homeNeedToHear] })] }), _jsxs("div", { style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                    gap: "14px",
                                }, children: [_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", background: "rgba(15, 18, 31, 0.88)", border: "1px solid rgba(255,255,255,0.08)" }), children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "10px",
                                                }, children: "\u2728 Mensaje para hoy" }), _jsx("div", { style: {
                                                    fontSize: "16px",
                                                    lineHeight: 1.8,
                                                    color: "#fff",
                                                    fontWeight: 500,
                                                }, children: homeMotivation })] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", background: "rgba(15, 18, 31, 0.88)", border: "1px solid rgba(255,255,255,0.08)" }), children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "10px",
                                                }, children: "\uD83C\uDFAF Consejo de hoy" }), _jsx("div", { style: {
                                                    fontSize: "16px",
                                                    lineHeight: 1.8,
                                                    color: "#fff",
                                                    fontWeight: 500,
                                                    marginBottom: "12px",
                                                }, children: homeAdvice }), _jsx("div", { style: {
                                                    fontSize: "13px",
                                                    lineHeight: 1.75,
                                                    color: theme.textSoft,
                                                }, children: homeProjectIdea })] })] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", background: "rgba(15, 18, 31, 0.88)", border: "1px solid rgba(255,255,255,0.08)" }), children: [_jsx("div", { style: {
                                            fontSize: "11px",
                                            color: theme.textMuted,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            marginBottom: "12px",
                                        }, children: "\u2705 Checklist de hoy" }), _jsx("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                            gap: "10px",
                                        }, children: homeChecklistItems.map((item) => (_jsxs("button", { onClick: () => setHomeChecklist((prev) => (Object.assign(Object.assign({}, prev), { [item.key]: !prev[item.key] }))), style: {
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: "12px",
                                                padding: "13px 14px",
                                                borderRadius: "14px",
                                                border: homeChecklist[item.key]
                                                    ? "1px solid rgba(255,255,255,0.16)"
                                                    : "1px solid rgba(255,255,255,0.08)",
                                                background: homeChecklist[item.key]
                                                    ? "rgba(255,255,255,0.06)"
                                                    : "rgba(255,255,255,0.03)",
                                                color: "#fff",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                textAlign: "left",
                                            }, children: [_jsx("span", { style: { lineHeight: 1.55 }, children: item.label }), _jsx("span", { style: { fontSize: "16px" }, children: homeChecklist[item.key] ? "☑️" : "⬜" })] }, item.key))) })] }), _jsxs("div", { style: {
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                }, children: [_jsx("button", { onClick: () => setVista("registro"), style: {
                                            padding: "12px 16px",
                                            background: "rgba(255,255,255,0.06)",
                                            color: "#fff",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            fontWeight: 700,
                                            fontSize: "13px",
                                        }, children: "Ir a registrar trade" }), _jsx("button", { onClick: () => setVista("stats"), style: {
                                            padding: "12px 16px",
                                            background: "rgba(255,255,255,0.03)",
                                            color: theme.textSoft,
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            fontWeight: 700,
                                            fontSize: "13px",
                                        }, children: "Ver stats" })] })] })), vista === "registro" && (_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "22px" }), children: [_jsx(SectionTitle, { eyebrow: "Nuevo trade", title: "Registra tu ejecuci\u00F3n", subtitle: "Anota lo que hiciste, c\u00F3mo te sent\u00EDas y si respetaste el plan. El mercado no perdona, pero el diario s\u00ED ense\u00F1a." }), _jsxs("div", { style: {
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                    gap: "14px",
                                }, children: [_jsxs("div", { style: { gridColumn: "1/-1" }, children: [_jsx(Label, { children: "FECHA" }), _jsx(Input, { type: "date", value: form.fecha, onChange: (e) => f({ fecha: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "SESI\u00D3N" }), _jsxs(Select, { value: form.sesion, onChange: (e) => f({ sesion: e.target.value }), children: [_jsx("option", { value: "new-york", children: "\uD83D\uDFE2 New York" }), _jsx("option", { value: "asia", children: "\uD83D\uDFE1 Asia" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "DIRECCI\u00D3N" }), _jsx("div", { style: { display: "flex", gap: "10px", marginTop: "6px" }, children: ["long", "short"].map((d) => (_jsx("button", { onClick: () => f({ direccion: d }), style: {
                                                        flex: 1,
                                                        padding: "12px",
                                                        borderRadius: "14px",
                                                        border: form.direccion === d
                                                            ? `1px solid ${d === "long" ? theme.green : theme.red}`
                                                            : "1px solid rgba(255,255,255,0.08)",
                                                        background: form.direccion === d
                                                            ? d === "long"
                                                                ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.06))"
                                                                : "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.06))"
                                                            : "rgba(255,255,255,0.03)",
                                                        color: form.direccion === d ? "#fff" : theme.textSoft,
                                                        cursor: "pointer",
                                                        fontWeight: 700,
                                                        fontSize: "12px",
                                                    }, children: d === "long" ? "▲ COMPRA" : "▼ VENTA" }, d))) })] }), _jsxs("div", { style: {
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                        }, children: [_jsx(Label, { children: "CONTRATOS" }), _jsx("div", { style: {
                                                    marginTop: "6px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    minHeight: "44px",
                                                }, children: _jsx(SmallInput, { type: "number", min: "1", max: "100", step: "1", placeholder: "1", value: form.contratos, onChange: (e) => actualizarContratos(e.target.value) }) })] }), _jsxs("div", { children: [_jsx(Label, { children: "RESULTADO ($)" }), _jsx(Input, { type: "number", placeholder: "-50 o +100", value: form.resultado, onChange: (e) => {
                                                    const hayPuntos = (parseFloat(form.puntosPositivos || "0") || 0) > 0 ||
                                                        (parseFloat(form.puntosNegativos || "0") || 0) > 0;
                                                    if (hayPuntos)
                                                        return;
                                                    f({ resultado: e.target.value });
                                                }, style: {
                                                    color: parseFloat(form.resultado) >= 0 ? theme.green : theme.red,
                                                    fontWeight: 700,
                                                    opacity: (parseFloat(form.puntosPositivos || "0") || 0) > 0 ||
                                                        (parseFloat(form.puntosNegativos || "0") || 0) > 0
                                                        ? 0.9
                                                        : 1,
                                                } })] }), _jsxs("div", { style: { gridColumn: "1/-1" }, children: [_jsx(Label, { children: "RAZ\u00D3N DE ENTRADA" }), _jsx("div", { style: {
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "8px",
                                                    marginTop: "8px",
                                                }, children: razones.map((r) => (_jsx(ChipButton, { active: form.razon === r, activeBg: "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(139,92,246,0.14))", activeBorder: "rgba(34,211,238,0.38)", activeColor: "#fff", onClick: () => f({ razon: r }), children: r }, r))) })] }), _jsx("div", { style: { gridColumn: "1/-1" }, children: _jsxs("div", { style: {
                                                borderRadius: "18px",
                                                padding: "16px",
                                                background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(34,211,238,0.05))",
                                                border: "1px solid rgba(139,92,246,0.18)",
                                            }, children: [_jsxs("div", { style: {
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: "12px",
                                                        flexWrap: "wrap",
                                                        marginBottom: "12px",
                                                    }, children: [_jsxs("div", { children: [_jsx(Label, { children: "CHECKLIST DE MALAS PR\u00C1CTICAS" }), _jsx("div", { style: {
                                                                        marginTop: "6px",
                                                                        fontSize: "12px",
                                                                        color: theme.textMuted,
                                                                        lineHeight: 1.6,
                                                                    }, children: "Marca los errores que cometiste en este trade. Esto te ayuda a detectar patrones sin ensuciar el registro." })] }), _jsx("div", { style: {
                                                                padding: "8px 10px",
                                                                borderRadius: "999px",
                                                                background: "rgba(255,255,255,0.04)",
                                                                border: "1px solid rgba(255,255,255,0.08)",
                                                                color: form.malasPracticas.length ? "#fff" : theme.textMuted,
                                                                fontSize: "12px",
                                                                fontWeight: 700,
                                                                minWidth: "fit-content",
                                                                height: "fit-content",
                                                            }, children: form.malasPracticas.length
                                                                ? `${form.malasPracticas.length} seleccionada${form.malasPracticas.length > 1 ? "s" : ""}`
                                                                : "Sin errores marcados" })] }), _jsx("div", { style: {
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                                        gap: "10px",
                                                    }, children: malasPracticasOptions.map((item) => {
                                                        const active = form.malasPracticas.includes(item);
                                                        return (_jsxs("button", { type: "button", onClick: () => toggleMalaPractica(item), style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                                textAlign: "left",
                                                                padding: "12px 14px",
                                                                borderRadius: "14px",
                                                                border: active
                                                                    ? "1px solid rgba(139,92,246,0.45)"
                                                                    : "1px solid rgba(255,255,255,0.08)",
                                                                background: active
                                                                    ? "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(34,211,238,0.12))"
                                                                    : "rgba(255,255,255,0.03)",
                                                                color: active ? "#fff" : theme.textSoft,
                                                                cursor: "pointer",
                                                                fontSize: "13px",
                                                                fontWeight: active ? 700 : 500,
                                                                minHeight: "58px",
                                                            }, children: [_jsx("span", { style: {
                                                                        width: "18px",
                                                                        height: "18px",
                                                                        flexShrink: 0,
                                                                        borderRadius: "6px",
                                                                        border: active
                                                                            ? "1px solid rgba(139,92,246,0.55)"
                                                                            : "1px solid rgba(255,255,255,0.18)",
                                                                        background: active
                                                                            ? "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(34,211,238,0.9))"
                                                                            : "transparent",
                                                                        boxShadow: active
                                                                            ? "0 0 0 3px rgba(139,92,246,0.14)"
                                                                            : "none",
                                                                    } }), _jsx("span", { children: item })] }, item));
                                                    }) }), form.malasPracticas.length > 0 && (_jsx("div", { style: {
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: "8px",
                                                        marginTop: "14px",
                                                    }, children: form.malasPracticas.map((item) => (_jsxs(MiniPill, { children: ["\u26A0\uFE0F ", item] }, item))) }))] }) }), _jsxs("div", { style: { gridColumn: "1/-1" }, children: [_jsx(Label, { children: "ESTADO EMOCIONAL" }), _jsx("div", { style: {
                                                    display: "grid",
                                                    gap: "12px",
                                                    marginTop: "8px",
                                                }, children: emotionGroups.map((group) => {
                                                    const zoneStyle = group.zone === "rojo"
                                                        ? {
                                                            bg: "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.03))",
                                                            border: "rgba(239,68,68,0.20)",
                                                            title: "#ffb4b4",
                                                        }
                                                        : group.zone === "azul"
                                                            ? {
                                                                bg: "linear-gradient(135deg, rgba(56,189,248,0.10), rgba(56,189,248,0.03))",
                                                                border: "rgba(56,189,248,0.20)",
                                                                title: "#bfefff",
                                                            }
                                                            : {
                                                                bg: "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(34,197,94,0.03))",
                                                                border: "rgba(34,197,94,0.20)",
                                                                title: "#c9ffd9",
                                                            };
                                                    return (_jsxs("div", { style: {
                                                            borderRadius: "16px",
                                                            padding: "14px",
                                                            background: zoneStyle.bg,
                                                            border: `1px solid ${zoneStyle.border}`,
                                                        }, children: [_jsxs("div", { style: {
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    gap: "10px",
                                                                    flexWrap: "wrap",
                                                                    marginBottom: "10px",
                                                                }, children: [_jsx("div", { style: {
                                                                            fontSize: "13px",
                                                                            fontWeight: 800,
                                                                            color: zoneStyle.title,
                                                                        }, children: group.title }), _jsx("div", { style: {
                                                                            fontSize: "12px",
                                                                            color: theme.textMuted,
                                                                        }, children: group.subtitle })] }), _jsx("div", { style: {
                                                                    display: "flex",
                                                                    flexWrap: "wrap",
                                                                    gap: "8px",
                                                                }, children: group.emotions.map((emotion) => (_jsx(ChipButton, { active: form.emocion === emotion.key, activeBg: group.zone === "rojo"
                                                                        ? "linear-gradient(135deg, rgba(239,68,68,0.22), rgba(239,68,68,0.10))"
                                                                        : group.zone === "azul"
                                                                            ? "linear-gradient(135deg, rgba(56,189,248,0.22), rgba(56,189,248,0.10))"
                                                                            : "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(34,197,94,0.10))", activeBorder: group.zone === "rojo"
                                                                        ? "rgba(239,68,68,0.35)"
                                                                        : group.zone === "azul"
                                                                            ? "rgba(56,189,248,0.35)"
                                                                            : "rgba(34,197,94,0.35)", activeColor: "#fff", onClick: () => f({ emocion: emotion.key }), children: emotion.label }, emotion.key))) })] }, group.zone));
                                                }) })] }), _jsxs("div", { style: { gridColumn: "1/-1" }, children: [_jsx(Label, { children: "\u00BFSEGUISTE EL PLAN?" }), _jsx("div", { style: { display: "flex", gap: "10px", marginTop: "8px" }, children: [
                                                    ["si", "✅ Sí"],
                                                    ["no", "❌ No"],
                                                ].map(([v, l]) => (_jsx("button", { onClick: () => f({ seguiPlan: v }), style: {
                                                        flex: 1,
                                                        padding: "12px",
                                                        borderRadius: "14px",
                                                        border: form.seguiPlan === v
                                                            ? "1px solid rgba(139,92,246,0.45)"
                                                            : "1px solid rgba(255,255,255,0.08)",
                                                        background: form.seguiPlan === v
                                                            ? "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(34,211,238,0.08))"
                                                            : "rgba(255,255,255,0.03)",
                                                        color: form.seguiPlan === v ? "#fff" : theme.textSoft,
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        fontWeight: 700,
                                                    }, children: l }, v))) })] }), _jsxs("div", { style: { gridColumn: "1/-1" }, children: [_jsx(Label, { children: "NOTAS" }), _jsx("textarea", { value: form.notas, onChange: (e) => f({ notas: e.target.value }), placeholder: "\u00BFQu\u00E9 pas\u00F3? \u00BFQu\u00E9 aprendiste? \u00BFD\u00F3nde estuvo el fallo o el acierto?", style: {
                                                    width: "100%",
                                                    background: "rgba(255,255,255,0.03)",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                    borderRadius: "16px",
                                                    color: theme.text,
                                                    padding: "14px 15px",
                                                    fontFamily: "inherit",
                                                    fontSize: "13px",
                                                    resize: "vertical",
                                                    minHeight: "90px",
                                                    boxSizing: "border-box",
                                                    marginTop: "6px",
                                                    outline: "none",
                                                    lineHeight: 1.65,
                                                } })] })] }), _jsx("button", { onClick: agregarTrade, disabled: semaforo === "rojo", style: {
                                    width: "100%",
                                    marginTop: "18px",
                                    padding: "15px",
                                    background: semaforo === "rojo"
                                        ? "linear-gradient(135deg, rgba(239,68,68,0.7), rgba(251,113,133,0.7))"
                                        : guardado
                                            ? "linear-gradient(135deg, #22c55e, #34d399)"
                                            : "linear-gradient(135deg, #8b5cf6, #22d3ee)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "16px",
                                    fontWeight: 800,
                                    fontSize: "14px",
                                    cursor: semaforo === "rojo" ? "not-allowed" : "pointer",
                                    letterSpacing: "0.12em",
                                    opacity: semaforo === "rojo" ? 0.9 : 1,
                                    boxShadow: semaforo === "rojo"
                                        ? "0 14px 34px rgba(239,68,68,0.22)"
                                        : guardado
                                            ? "0 14px 34px rgba(34,197,94,0.2)"
                                            : "0 14px 34px rgba(124,58,237,0.24)",
                                }, children: semaforo === "rojo"
                                    ? "🚫 DÍA BLOQUEADO"
                                    : guardado
                                        ? "✅ GUARDADO"
                                        : "GUARDAR TRADE" })] })), vista === "historial" && (_jsxs("div", { children: [trades.length === 0 && (_jsx(EmptyState, { text: "Sin trades registrados a\u00FAn." })), _jsx("div", { style: { display: "grid", gap: "12px" }, children: trades.map((t) => (_jsx("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "16px", borderLeft: `3px solid ${t.pnl >= 0 ? theme.green : theme.red}` }), children: _jsxs("div", { style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: "14px",
                                            flexWrap: "wrap",
                                        }, children: [_jsxs("div", { style: { flex: 1, minWidth: "220px" }, children: [_jsxs("div", { style: {
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: "8px",
                                                            marginBottom: "10px",
                                                        }, children: [_jsx(Badge, { children: t.fecha }), _jsx(Badge, { subtle: true, children: t.sesion === "new-york"
                                                                    ? "New York"
                                                                    : t.sesion === "asia"
                                                                        ? "Asia"
                                                                        : t.sesion }), _jsx(Badge, { customColor: t.direccion === "long" ? theme.green : theme.red, children: t.direccion === "long" ? "▲ LONG" : "▼ SHORT" }), _jsxs(Badge, { subtle: true, children: [t.contratos, " MNQ"] }), (t.puntosPositivos || t.puntosNegativos) && (_jsxs(Badge, { subtle: true, children: ["+", t.puntosPositivos || 0, " / -", t.puntosNegativos || 0, " pts"] })), t.razon && _jsx(Badge, { subtle: true, children: t.razon }), _jsx(Badge, { customColor: zonaMeta[getEmotionZone(t.emocion)].color, children: zonaMeta[getEmotionZone(t.emocion)].label })] }), Array.isArray(t.malasPracticas) &&
                                                        t.malasPracticas.length > 0 && (_jsx("div", { style: {
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: "8px",
                                                            marginBottom: t.notas ? "10px" : "12px",
                                                        }, children: t.malasPracticas.map((item) => (_jsxs(MiniPill, { children: ["\u26A0\uFE0F ", item] }, item))) })), t.notas && (_jsx("div", { style: {
                                                            fontSize: "13px",
                                                            color: theme.textSoft,
                                                            lineHeight: 1.7,
                                                            marginBottom: "10px",
                                                        }, children: t.notas })), _jsxs("div", { style: {
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: "8px",
                                                        }, children: [_jsx(MiniPill, { children: t.seguiPlan === "si" ? "✅ Plan" : "❌ Sin plan" }), _jsx(MiniPill, { children: getEmotionLabel(t.emocion) })] })] }), _jsxs("div", { style: {
                                                    minWidth: "140px",
                                                    textAlign: "right",
                                                    marginLeft: "auto",
                                                }, children: [_jsx("div", { style: {
                                                            fontSize: "13px",
                                                            color: theme.textMuted,
                                                            marginBottom: "6px",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.1em",
                                                        }, children: "Resultado" }), _jsxs("div", { style: {
                                                            fontSize: "28px",
                                                            fontWeight: 800,
                                                            color: t.pnl >= 0 ? theme.green : theme.red,
                                                            fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                                        }, children: [t.pnl >= 0 ? "+" : "", "$", t.pnl] }), _jsx("button", { onClick: () => eliminar(t.id), style: {
                                                            marginTop: "12px",
                                                            background: "rgba(255,255,255,0.03)",
                                                            border: "1px solid rgba(255,255,255,0.08)",
                                                            color: theme.textMuted,
                                                            cursor: "pointer",
                                                            fontSize: "12px",
                                                            padding: "8px 10px",
                                                            borderRadius: "10px",
                                                        }, children: "\uD83D\uDDD1 borrar" })] })] }) }, t.id))) })] })), vista === "semana" && (_jsxs("div", { children: [_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "16px" }), children: [_jsx(Label, { children: "SEMANA" }), _jsx(Select, { value: selectedWeek, onChange: (e) => setSelectedWeek(e.target.value), children: weeks.map((w) => (_jsxs("option", { value: w, children: ["Semana del ", getWeekLabel(w), w === getWeekStart(new Date()) ? " (actual)" : ""] }, w))) })] }), weekTrades.length === 0 ? (_jsx(EmptyState, { text: "Sin trades esta semana." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "20px", marginBottom: "14px" }), children: [_jsxs("div", { style: {
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    gap: "12px",
                                                    alignItems: "flex-end",
                                                    flexWrap: "wrap",
                                                    marginBottom: "12px",
                                                }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                                    fontSize: "11px",
                                                                    color: theme.textMuted,
                                                                    letterSpacing: "0.14em",
                                                                    textTransform: "uppercase",
                                                                    marginBottom: "5px",
                                                                }, children: "Progreso semanal" }), _jsxs("div", { style: {
                                                                    fontSize: "30px",
                                                                    fontWeight: 800,
                                                                    color: weekPnl >= 0 ? theme.green : theme.red,
                                                                    fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                                                }, children: [weekPnl >= 0 ? "+" : "", "$", weekPnl.toFixed(0)] })] }), _jsx("div", { style: {
                                                            padding: "8px 12px",
                                                            borderRadius: "999px",
                                                            background: "rgba(255,255,255,0.04)",
                                                            border: "1px solid rgba(255,255,255,0.08)",
                                                            color: theme.textSoft,
                                                            fontSize: "12px",
                                                            fontWeight: 700,
                                                        }, children: "Meta semanal: $300" })] }), _jsx("div", { style: {
                                                    height: "12px",
                                                    background: "rgba(255,255,255,0.06)",
                                                    borderRadius: "999px",
                                                    overflow: "hidden",
                                                }, children: _jsx("div", { style: {
                                                        height: "100%",
                                                        borderRadius: "999px",
                                                        transition: "width 0.5s",
                                                        width: `${Math.min(Math.max((weekPnl / 300) * 100, 0), 100)}%`,
                                                        background: weekPnl >= 300
                                                            ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                                                            : weekPnl >= 150
                                                                ? "linear-gradient(90deg, #facc15, #f59e0b)"
                                                                : "linear-gradient(90deg, #8b5cf6, #22d3ee)",
                                                    } }) }), _jsxs("div", { style: {
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    marginTop: "8px",
                                                    gap: "10px",
                                                    flexWrap: "wrap",
                                                }, children: [_jsxs("span", { style: { fontSize: "12px", color: theme.textSoft }, children: [Math.round(Math.min(Math.max((weekPnl / 300) * 100, 0), 100)), "% del objetivo"] }), weekPnl >= 300 && (_jsx("span", { style: {
                                                            fontSize: "12px",
                                                            color: theme.green,
                                                            fontWeight: 700,
                                                        }, children: "\uD83C\uDFAF Objetivo semanal alcanzado" }))] })] }), _jsxs("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                            gap: "12px",
                                            marginBottom: "14px",
                                        }, children: [_jsx(StatCard, { label: "WIN RATE", value: `${weekWinRate}%`, color: weekWinRate >= 50 ? theme.green : theme.yellow }), _jsx(StatCard, { label: "TRADES", value: weekTrades.length, color: theme.cyan }), _jsx(StatCard, { label: "GANADORES", value: weekWinners, color: theme.green }), _jsx(StatCard, { label: "PERDEDORES", value: weekTrades.length - weekWinners, color: theme.red }), _jsx(StatCard, { label: "D\u00CDAS POSITIVOS", value: diasConGanancia, color: theme.green }), _jsx(StatCard, { label: "SIGUI\u00D3 PLAN", value: `${weekSiguioPlan}/${weekTrades.length}`, color: weekSiguioPlan >= weekTrades.length * 0.8
                                                    ? theme.green
                                                    : theme.yellow })] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "14px" }), children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "14px",
                                                }, children: "Sesi\u00F3n m\u00E1s rentable" }), [
                                                {
                                                    label: "🟢 New York",
                                                    pnl: pnlNewYork,
                                                    trades: weekNewYork.length,
                                                },
                                                {
                                                    label: "🟡 Asia",
                                                    pnl: pnlAsia,
                                                    trades: weekAsia.length,
                                                },
                                            ].map((s) => (_jsxs("div", { style: { marginBottom: "14px" }, children: [_jsxs("div", { style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            gap: "12px",
                                                            marginBottom: "8px",
                                                            flexWrap: "wrap",
                                                        }, children: [_jsx("span", { style: { fontSize: "13px", color: theme.textSoft }, children: s.label }), _jsxs("span", { style: {
                                                                    fontSize: "14px",
                                                                    fontWeight: 800,
                                                                    color: s.pnl >= 0 ? theme.green : theme.red,
                                                                    fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                                                }, children: [s.pnl >= 0 ? "+" : "", "$", s.pnl.toFixed(0), " \u00B7", " ", s.trades, " trade", s.trades !== 1 ? "s" : ""] })] }), _jsx("div", { style: {
                                                            height: "8px",
                                                            background: "rgba(255,255,255,0.06)",
                                                            borderRadius: "999px",
                                                            overflow: "hidden",
                                                        }, children: _jsx("div", { style: {
                                                                height: "100%",
                                                                width: `${Math.min((Math.abs(s.pnl) /
                                                                    Math.max(Math.abs(weekPnl), 1)) *
                                                                    100, 100)}%`,
                                                                background: s.pnl >= 0
                                                                    ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                                                                    : "linear-gradient(90deg, #ef4444, #fb7185)",
                                                                borderRadius: "999px",
                                                            } }) })] }, s.label))), _jsx("div", { style: {
                                                    marginTop: "10px",
                                                    padding: "12px 14px",
                                                    background: "rgba(255,255,255,0.03)",
                                                    borderRadius: "14px",
                                                    fontSize: "13px",
                                                    color: theme.textSoft,
                                                    lineHeight: 1.65,
                                                }, children: pnlNewYork >= pnlAsia
                                                    ? "✅ Tu mejor sesión es NEW YORK. Dale prioridad y cuida no sobreoperar fuera de tu zona fuerte."
                                                    : "⚠️ Rindes mejor en ASIA. Revisa qué cambia en tu ejecución y si New York te está metiendo ruido." })] }), topEmocion && (_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "14px" }), children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "10px",
                                                }, children: "Estado emocional dominante" }), _jsx("div", { style: { fontSize: "24px", marginBottom: "6px" }, children: getEmotionLabel(topEmocion[0]) }), _jsxs("div", { style: { fontSize: "13px", color: theme.textSoft }, children: ["Presente en", " ", _jsx("span", { style: { color: "#fff", fontWeight: 700 }, children: topEmocion[1] }), " ", "de ", weekTrades.length, " trades esta semana"] })] })), weekNoSiguio > 0 && (_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.03))", border: "1px solid rgba(239,68,68,0.24)" }), children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: "#ffb4b4",
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "8px",
                                                }, children: "Trades fuera del plan" }), _jsx("div", { style: {
                                                    fontSize: "30px",
                                                    fontWeight: 800,
                                                    color: theme.red,
                                                    marginBottom: "6px",
                                                }, children: weekNoSiguio }), _jsxs("div", { style: { fontSize: "13px", color: "#ffd1d1" }, children: ["P\u00E9rdida promedio en trades fuera del plan:", " ", _jsxs("span", { style: { fontWeight: 800 }, children: ["$", (weekTrades
                                                                .filter((t) => t.seguiPlan === "no")
                                                                .reduce((a, b) => a + b.pnl, 0) / weekNoSiguio || 0).toFixed(0)] })] })] }))] }))] })), vista === "coach" && (_jsxs("div", { children: [_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "22px", marginBottom: "16px", background: "linear-gradient(135deg, rgba(18,20,34,0.96), rgba(29,19,51,0.94))", border: "1px solid rgba(139,92,246,0.24)" }), children: [_jsx(SectionTitle, { eyebrow: "Coach IA", title: "Diagn\u00F3stico de tu ejecuci\u00F3n", subtitle: "Analizo patrones de disciplina, resultados, emociones y consistencia para decirte d\u00F3nde ajustar sin anestesia, pero con cari\u00F1o profesional." }), _jsxs("div", { style: {
                                            display: "flex",
                                            gap: "8px",
                                            flexWrap: "wrap",
                                            fontSize: "12px",
                                            color: theme.textSoft,
                                            marginBottom: "18px",
                                        }, children: [_jsxs(MiniPill, { children: ["\uD83D\uDCCA ", trades.length, " trades"] }), _jsxs(MiniPill, { children: ["\uD83C\uDFAF ", winRate, "% win rate"] }), _jsx(MiniPill, { children: _jsxs("span", { style: { color: pnlTotal >= 0 ? theme.green : theme.red }, children: [pnlTotal >= 0 ? "+" : "", "$", pnlTotal.toFixed(0), " P&L"] }) })] }), _jsxs("div", { style: {
                                            fontSize: "13px",
                                            color: theme.textSoft,
                                            marginBottom: "16px",
                                            lineHeight: 1.7,
                                        }, children: ["Analizo todos tus trades registrados, detecto patrones y te digo exactamente en qu\u00E9 est\u00E1s fallando y c\u00F3mo mejorar.", trades.length < 3 && (_jsxs("span", { style: { color: theme.yellow }, children: [" ", "Necesitas al menos 3 trades para el an\u00E1lisis."] }))] }), _jsx("button", { onClick: analizarConIA, disabled: aiLoading, style: {
                                            width: "100%",
                                            padding: "15px",
                                            background: aiLoading
                                                ? "rgba(255,255,255,0.04)"
                                                : "linear-gradient(135deg, #8b5cf6, #22d3ee)",
                                            color: aiLoading ? theme.textMuted : "#fff",
                                            border: "none",
                                            borderRadius: "16px",
                                            fontWeight: 800,
                                            fontSize: "13px",
                                            cursor: aiLoading ? "not-allowed" : "pointer",
                                            letterSpacing: "0.12em",
                                            boxShadow: aiLoading
                                                ? "none"
                                                : "0 14px 34px rgba(124,58,237,0.24)",
                                        }, children: aiLoading
                                            ? "⏳ ANALIZANDO TUS TRADES..."
                                            : "🔍 ANALIZAR MIS TRADES" })] }), aiAnalysis && (_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "22px", border: "1px solid rgba(139,92,246,0.26)" }), children: [_jsx("div", { style: {
                                            fontSize: "11px",
                                            color: "#cdb7ff",
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            marginBottom: "14px",
                                        }, children: "An\u00E1lisis personalizado" }), _jsx("div", { style: { lineHeight: 1.8 }, children: formatAiText(aiAnalysis) }), _jsxs("div", { style: {
                                            marginTop: "18px",
                                            paddingTop: "14px",
                                            borderTop: "1px solid rgba(255,255,255,0.08)",
                                            fontSize: "12px",
                                            color: theme.textMuted,
                                        }, children: ["Basado en ", trades.length, " trades registrados \u00B7 Actualiza el an\u00E1lisis despu\u00E9s de registrar m\u00E1s trades"] })] }))] })), vista === "habitos" && (_jsx("div", { children: _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "22px", marginBottom: "16px" }), children: [_jsx(SectionTitle, { eyebrow: "Disciplina personal", title: "Checklist de h\u00E1bitos", subtitle: "Tu rendimiento en trading es un reflejo directo de c\u00F3mo llegas a la batalla. Si tu vida est\u00E1 alineada, tu ejecuci\u00F3n mejora." }), _jsxs("div", { style: {
                                        marginBottom: "18px",
                                        padding: "16px",
                                        borderRadius: "16px",
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                    }, children: [_jsxs("div", { style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: "12px",
                                                alignItems: "flex-end",
                                                flexWrap: "wrap",
                                                marginBottom: "8px",
                                            }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                                fontSize: "11px",
                                                                color: theme.textMuted,
                                                                letterSpacing: "0.14em",
                                                                textTransform: "uppercase",
                                                                marginBottom: "6px",
                                                            }, children: "Progreso del d\u00EDa" }), _jsxs("div", { style: {
                                                                fontSize: "28px",
                                                                fontWeight: 800,
                                                                color: habitsPercent >= 80
                                                                    ? theme.green
                                                                    : habitsPercent >= 50
                                                                        ? theme.yellow
                                                                        : theme.red,
                                                                fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                                            }, children: [habitsPercent, "%"] })] }), _jsxs("div", { style: {
                                                        fontSize: "13px",
                                                        color: theme.textSoft,
                                                        textAlign: "right",
                                                    }, children: [habitsDone, " / ", habitList.length, " h\u00E1bitos cumplidos"] })] }), _jsx("div", { style: {
                                                height: "10px",
                                                background: "rgba(255,255,255,0.06)",
                                                borderRadius: "999px",
                                                overflow: "hidden",
                                            }, children: _jsx("div", { style: {
                                                    width: `${habitsPercent}%`,
                                                    height: "100%",
                                                    borderRadius: "999px",
                                                    transition: "width 0.4s ease",
                                                    background: habitsPercent >= 80
                                                        ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                                                        : habitsPercent >= 50
                                                            ? "linear-gradient(90deg, #facc15, #f59e0b)"
                                                            : "linear-gradient(90deg, #ef4444, #fb7185)",
                                                } }) }), _jsx("div", { style: {
                                                marginTop: "10px",
                                                fontSize: "12px",
                                                color: theme.textMuted,
                                                lineHeight: 1.6,
                                            }, children: "Cuanto m\u00E1s alto est\u00E9 esto, mejor llegas al mercado. El chart no sabe si desayunaste mal... pero tu cerebro s\u00ED." })] }), _jsx("div", { style: {
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                        gap: "10px",
                                    }, children: habitList.map((h) => {
                                        const active = todayHabits[h.key];
                                        return (_jsxs("button", { onClick: () => toggleHabit(hoy, h.key), style: {
                                                padding: "14px",
                                                borderRadius: "14px",
                                                border: active
                                                    ? "1px solid rgba(34,197,94,0.35)"
                                                    : "1px solid rgba(255,255,255,0.08)",
                                                background: active
                                                    ? "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,211,238,0.08))"
                                                    : "rgba(255,255,255,0.03)",
                                                color: "#fff",
                                                textAlign: "left",
                                                cursor: "pointer",
                                                fontSize: "13px",
                                                fontWeight: 600,
                                                minHeight: "58px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: "10px",
                                            }, children: [_jsx("span", { children: h.label }), _jsx("span", { style: { fontSize: "18px", opacity: active ? 1 : 0.75 }, children: active ? "✅" : "⬜" })] }, h.key));
                                    }) }), _jsx("div", { style: {
                                        marginTop: "16px",
                                        padding: "14px",
                                        borderRadius: "14px",
                                        background: "rgba(139,92,246,0.08)",
                                        border: "1px solid rgba(139,92,246,0.16)",
                                        fontSize: "13px",
                                        color: theme.textSoft,
                                        lineHeight: 1.7,
                                    }, children: habitsPercent >= 80
                                        ? "🔥 Vienes fuerte hoy. Buenas bases para una ejecución limpia."
                                        : habitsPercent >= 50
                                            ? "⚠️ Vas medio bien, pero todavía puedes mejorar cómo llegas al mercado."
                                            : "💀 Ojo: tu base del día está floja. Hoy toca operar con mucha cabeza o no regalar dinero." })] }) })), vista === "psicologia" && (_jsx("div", { children: _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "22px", marginBottom: "16px", background: "linear-gradient(135deg, rgba(17,20,34,0.96), rgba(16,24,40,0.94))" }), children: [_jsx(SectionTitle, { eyebrow: "Psicotrading", title: "Gr\u00E1fica emocional", subtitle: "Aqu\u00ED ves si est\u00E1s operando desde el descontrol, la claridad o la euforia. El PnL muestra qu\u00E9 pas\u00F3; esto muestra desde d\u00F3nde lo hiciste." }), psychSeries.length === 0 ? (_jsx(EmptyState, { text: "Sin datos emocionales a\u00FAn." })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "16px", marginBottom: "14px", background: "linear-gradient(180deg, rgba(239,68,68,0.08) 0%, rgba(56,189,248,0.06) 50%, rgba(34,197,94,0.08) 100%)" }), children: [_jsx("div", { style: {
                                                        fontSize: "11px",
                                                        color: theme.textMuted,
                                                        letterSpacing: "0.14em",
                                                        textTransform: "uppercase",
                                                        marginBottom: "10px",
                                                    }, children: "L\u00EDnea emocional acumulada" }), _jsx(EmotionChart, { series: psychSeries }), _jsxs("div", { style: {
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                                        gap: "10px",
                                                        marginTop: "14px",
                                                    }, children: [_jsx(ZoneLegend, { label: "\uD83D\uDD34 Zona Roja", sub: "Descontrol", color: zonaMeta.rojo.color, bg: zonaMeta.rojo.soft }), _jsx(ZoneLegend, { label: "\uD83D\uDD35 Zona Azul", sub: "Claridad", color: zonaMeta.azul.color, bg: zonaMeta.azul.soft }), _jsx(ZoneLegend, { label: "\uD83D\uDFE2 Zona Verde", sub: "Euforia", color: zonaMeta.verde.color, bg: zonaMeta.verde.soft })] })] }), _jsxs("div", { style: {
                                                display: "grid",
                                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                                gap: "12px",
                                                marginBottom: "14px",
                                            }, children: [_jsx(InsightCard, { title: "Estado actual", value: currentZoneMeta ? currentZoneMeta.label : "Sin datos", subValue: psychSeries.length
                                                        ? `Último trade: ${psychSeries[psychSeries.length - 1].emocionLabel}`
                                                        : "Sin registros", color: currentZoneMeta ? currentZoneMeta.color : theme.cyan }), _jsx(InsightCard, { title: "Zona m\u00E1s repetida", value: Object.entries(zonaCount).sort((a, b) => b[1] - a[1])[0]
                                                        ? zonaMeta[Object.entries(zonaCount).sort((a, b) => b[1] - a[1])[0][0]].label
                                                        : "Sin datos", subValue: `Rojos: ${zonaCount.rojo} · Azules: ${zonaCount.azul} · Verdes: ${zonaCount.verde}`, color: theme.cyan }), _jsx(InsightCard, { title: "Emoci\u00F3n que m\u00E1s pierde", value: peorEmocion
                                                        ? getEmotionLabel(peorEmocion.emocion)
                                                        : "Sin datos", subValue: peorEmocion
                                                        ? `Promedio: ${peorEmocion.avg >= 0 ? "+" : ""}$${peorEmocion.avg.toFixed(0)}`
                                                        : "Aún no hay suficiente info", color: theme.red }), _jsx(InsightCard, { title: "Emoci\u00F3n que m\u00E1s gana", value: mejorEmocion
                                                        ? getEmotionLabel(mejorEmocion.emocion)
                                                        : "Sin datos", subValue: mejorEmocion
                                                        ? `Promedio: ${mejorEmocion.avg >= 0 ? "+" : ""}$${mejorEmocion.avg.toFixed(0)}`
                                                        : "Aún no hay suficiente info", color: theme.green })] }), psychRepeatedAlert && (_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "14px", background: psychRepeatedAlert === "rojo"
                                                    ? "linear-gradient(135deg, rgba(239,68,68,0.16), rgba(239,68,68,0.04))"
                                                    : psychRepeatedAlert === "verde"
                                                        ? "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.04))"
                                                        : "linear-gradient(135deg, rgba(56,189,248,0.14), rgba(56,189,248,0.04))", border: `1px solid ${zonaMeta[psychRepeatedAlert].color}44` }), children: [_jsx("div", { style: {
                                                        fontSize: "11px",
                                                        letterSpacing: "0.14em",
                                                        textTransform: "uppercase",
                                                        marginBottom: "8px",
                                                        color: zonaMeta[psychRepeatedAlert].color,
                                                    }, children: "Patr\u00F3n emocional repetido" }), _jsxs("div", { style: {
                                                        fontSize: "14px",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                        marginBottom: "6px",
                                                    }, children: [psychRepeatedAlert === "rojo" &&
                                                            "⚠️ Tienes 3 registros seguidos en descontrol. Riesgo alto de seguir regalando trades.", psychRepeatedAlert === "azul" &&
                                                            "✅ Llevas 3 registros seguidos en claridad. Buen control mental.", psychRepeatedAlert === "verde" &&
                                                            "🟢 Llevas 3 registros seguidos en euforia. Ojo con la sobreconfianza y el exceso de riesgo."] }), _jsx("div", { style: {
                                                        fontSize: "12px",
                                                        color: theme.textSoft,
                                                        lineHeight: 1.7,
                                                    }, children: "Repetir emociones deja huella. Aqu\u00ED no solo importa c\u00F3mo te sentiste una vez, sino qu\u00E9 patr\u00F3n est\u00E1s construyendo." })] })), psychRecoveryMessage && (_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "14px", background: "linear-gradient(135deg, rgba(56,189,248,0.10), rgba(34,197,94,0.06))", border: "1px solid rgba(56,189,248,0.24)" }), children: [_jsx("div", { style: {
                                                        fontSize: "11px",
                                                        color: theme.cyan,
                                                        letterSpacing: "0.14em",
                                                        textTransform: "uppercase",
                                                        marginBottom: "8px",
                                                    }, children: "Recuperaci\u00F3n emocional" }), _jsx("div", { style: {
                                                        fontSize: "14px",
                                                        color: "#fff",
                                                        fontWeight: 700,
                                                    }, children: psychRecoveryMessage })] })), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px" }), children: [_jsx("div", { style: {
                                                        fontSize: "11px",
                                                        color: theme.textMuted,
                                                        letterSpacing: "0.14em",
                                                        textTransform: "uppercase",
                                                        marginBottom: "12px",
                                                    }, children: "\u00DAltimos registros emocionales" }), _jsx("div", { style: { display: "grid", gap: "10px" }, children: psychSeries
                                                        .slice(-6)
                                                        .reverse()
                                                        .map((item) => (_jsxs("div", { style: {
                                                            padding: "12px 14px",
                                                            borderRadius: "14px",
                                                            background: "rgba(255,255,255,0.03)",
                                                            border: `1px solid ${zonaMeta[item.zona].color}33`,
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            gap: "12px",
                                                            flexWrap: "wrap",
                                                            alignItems: "center",
                                                        }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                                            fontSize: "13px",
                                                                            fontWeight: 700,
                                                                            color: "#fff",
                                                                            marginBottom: "4px",
                                                                        }, children: item.emocionLabel }), _jsxs("div", { style: {
                                                                            fontSize: "12px",
                                                                            color: theme.textMuted,
                                                                        }, children: [item.fecha, " \u00B7 ", zonaMeta[item.zona].label] })] }), _jsxs("div", { style: { textAlign: "right" }, children: [_jsxs("div", { style: {
                                                                            fontSize: "13px",
                                                                            fontWeight: 800,
                                                                            color: item.pnl >= 0 ? theme.green : theme.red,
                                                                        }, children: [item.pnl >= 0 ? "+" : "", "$", item.pnl] }), _jsxs("div", { style: {
                                                                            fontSize: "12px",
                                                                            color: theme.textSoft,
                                                                        }, children: ["Curva: ", item.acumulado > 0 ? "+" : "", item.acumulado] })] })] }, item.id))) })] })] }))] }) })), vista === "stats" && (_jsxs("div", { children: [_jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "18px", background: "linear-gradient(135deg, rgba(13,17,30,0.94), rgba(10,13,24,0.9))", border: "1px solid rgba(139, 92, 246, 0.14)", boxShadow: "0 18px 45px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)" }), children: [_jsxs("div", { style: { marginBottom: "14px" }, children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "6px",
                                                }, children: "Resumen general" }), _jsx("div", { style: {
                                                    fontSize: "13px",
                                                    color: theme.textSoft,
                                                    lineHeight: 1.6,
                                                }, children: "Tus m\u00E9tricas principales de rendimiento." })] }), _jsx("div", { style: {
                                            height: "1px",
                                            width: "100%",
                                            marginBottom: "14px",
                                            background: "linear-gradient(90deg, rgba(139,92,246,0), rgba(139,92,246,0.35), rgba(34,211,238,0))",
                                        } }), _jsx("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                            gap: "12px",
                                        }, children: [
                                            {
                                                label: "P&L TOTAL",
                                                value: `${pnlTotal >= 0 ? "+" : ""}$${pnlTotal.toFixed(0)}`,
                                                color: pnlTotal >= 0 ? theme.green : theme.red,
                                            },
                                            {
                                                label: "WIN RATE",
                                                value: `${winRate}%`,
                                                color: winRate >= 50 ? theme.green : theme.yellow,
                                            },
                                            {
                                                label: "TRADES TOTAL",
                                                value: trades.length,
                                                color: theme.cyan,
                                            },
                                            {
                                                label: "P&L HOY",
                                                value: `${pnlHoy >= 0 ? "+" : ""}$${pnlHoy.toFixed(0)}`,
                                                color: pnlHoy >= 0 ? theme.green : theme.red,
                                            },
                                            { label: "GANADORES", value: ganadores, color: theme.green },
                                            {
                                                label: "PERDEDORES",
                                                value: trades.length - ganadores,
                                                color: theme.red,
                                            },
                                        ].map((s) => (_jsx(StatCard, { label: s.label, value: s.value, color: s.color }, s.label))) })] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "18px", background: "linear-gradient(135deg, rgba(13,17,30,0.94), rgba(10,13,24,0.9))", border: "1px solid rgba(139, 92, 246, 0.14)", boxShadow: "0 18px 45px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)" }), children: [_jsxs("div", { style: { marginBottom: "14px" }, children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "6px",
                                                }, children: "Insights y patrones" }), _jsx("div", { style: {
                                                    fontSize: "13px",
                                                    color: theme.textSoft,
                                                    lineHeight: 1.6,
                                                }, children: "Aqu\u00ED ves qu\u00E9 setups, emociones y errores est\u00E1n dominando tu operativa." })] }), _jsx("div", { style: {
                                            height: "1px",
                                            width: "100%",
                                            marginBottom: "14px",
                                            background: "linear-gradient(90deg, rgba(139,92,246,0), rgba(139,92,246,0.35), rgba(34,211,238,0))",
                                        } }), _jsxs("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                            gap: "12px",
                                            marginBottom: "14px",
                                        }, children: [_jsx(InsightCard, { title: "\uD83D\uDD25 Setup m\u00E1s rentable", value: mejorSetup ? mejorSetup.razon : "Sin datos", subValue: mejorSetup
                                                    ? `Promedio: ${mejorSetup.avg >= 0 ? "+" : ""}$${mejorSetup.avg.toFixed(0)} · ${mejorSetup.count} trade${mejorSetup.count !== 1 ? "s" : ""}`
                                                    : "Registra trades con razón", color: theme.green }), _jsx(InsightCard, { title: "\uD83D\uDC80 Setup que m\u00E1s castiga", value: peorSetup ? peorSetup.razon : "Sin datos", subValue: peorSetup
                                                    ? `Promedio: ${peorSetup.avg >= 0 ? "+" : ""}$${peorSetup.avg.toFixed(0)} · ${peorSetup.count} trade${peorSetup.count !== 1 ? "s" : ""}`
                                                    : "Registra trades con razón", color: theme.red }), _jsx(InsightCard, { title: "\uD83D\uDE0E Emoci\u00F3n m\u00E1s rentable", value: mejorEmocion
                                                    ? getEmotionLabel(mejorEmocion.emocion)
                                                    : "Sin datos", subValue: mejorEmocion
                                                    ? `Promedio: ${mejorEmocion.avg >= 0 ? "+" : ""}$${mejorEmocion.avg.toFixed(0)}`
                                                    : "Aún no hay suficiente info", color: theme.green }), _jsx(InsightCard, { title: "\u26A0\uFE0F Emoci\u00F3n m\u00E1s peligrosa", value: peorEmocion
                                                    ? getEmotionLabel(peorEmocion.emocion)
                                                    : "Sin datos", subValue: peorEmocion
                                                    ? `Promedio: ${peorEmocion.avg >= 0 ? "+" : ""}$${peorEmocion.avg.toFixed(0)}`
                                                    : "Aún no hay suficiente info", color: theme.red })] }), _jsxs("div", { style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                            gap: "12px",
                                            marginBottom: "14px",
                                        }, children: [_jsx(InsightCard, { title: "\uD83D\uDEA8 Error m\u00E1s frecuente", value: topBadPractice ? topBadPractice.name : "Sin datos", subValue: topBadPractice
                                                    ? `${topBadPractice.count} vez${topBadPractice.count !== 1 ? "es" : ""} registrada${topBadPractice.count !== 1 ? "s" : ""}`
                                                    : "Marca errores en el checklist", color: theme.red }), _jsx(InsightCard, { title: "\uD83D\uDCB8 Error m\u00E1s costoso", value: mostExpensiveBadPractice
                                                    ? mostExpensiveBadPractice.name
                                                    : "Sin datos", subValue: mostExpensiveBadPractice
                                                    ? `${mostExpensiveBadPractice.totalPnl >= 0 ? "+" : ""}$${mostExpensiveBadPractice.totalPnl.toFixed(0)} acumulados`
                                                    : "Aún no hay suficiente info", color: theme.yellow }), _jsx(InsightCard, { title: "\uD83D\uDCC9 Error m\u00E1s t\u00F3xico", value: mostToxicBadPractice ? mostToxicBadPractice.name : "Sin datos", subValue: mostToxicBadPractice
                                                    ? `${mostToxicBadPractice.lossRate}% terminó en pérdida`
                                                    : "Aún no hay suficiente info", color: theme.purple })] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px" }), children: [_jsx("div", { style: {
                                                    fontSize: "11px",
                                                    color: theme.textMuted,
                                                    letterSpacing: "0.14em",
                                                    textTransform: "uppercase",
                                                    marginBottom: "14px",
                                                }, children: "Top errores del checklist" }), badPracticeRanking.length > 0 ? (_jsx("div", { style: { display: "grid", gap: "10px" }, children: badPracticeRanking.slice(0, 5).map((item, idx) => (_jsxs("div", { style: {
                                                        padding: "12px 14px",
                                                        borderRadius: "14px",
                                                        background: "rgba(255,255,255,0.03)",
                                                        border: "1px solid rgba(255,255,255,0.08)",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: "12px",
                                                        flexWrap: "wrap",
                                                        alignItems: "center",
                                                    }, children: [_jsxs("div", { children: [_jsxs("div", { style: {
                                                                        fontSize: "13px",
                                                                        fontWeight: 700,
                                                                        color: "#fff",
                                                                        marginBottom: "4px",
                                                                    }, children: ["#", idx + 1, " ", item.name] }), _jsxs("div", { style: {
                                                                        fontSize: "12px",
                                                                        color: theme.textMuted,
                                                                    }, children: [item.count, " vez", item.count !== 1 ? "es" : "", " \u00B7", " ", item.lossRate, "% en p\u00E9rdidas"] })] }), _jsxs("div", { style: {
                                                                fontSize: "14px",
                                                                fontWeight: 800,
                                                                color: item.totalPnl >= 0 ? theme.green : theme.red,
                                                                fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                                            }, children: [item.totalPnl >= 0 ? "+" : "", "$", item.totalPnl.toFixed(0)] })] }, item.name))) })) : (_jsx("div", { style: { fontSize: "13px", color: theme.textMuted }, children: "Sin datos a\u00FAn. Empieza a marcar errores en el checklist para ver qu\u00E9 h\u00E1bito te est\u00E1 costando m\u00E1s." }))] })] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "14px", background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.03))", border: "1px solid rgba(239,68,68,0.24)" }), children: [_jsx("div", { style: {
                                            fontSize: "11px",
                                            color: "#ffb4b4",
                                            textTransform: "uppercase",
                                            marginBottom: "8px",
                                            letterSpacing: "0.14em",
                                        }, children: "\uD83D\uDC80 Costo de no seguir el plan" }), _jsxs("div", { style: {
                                            fontSize: "28px",
                                            fontWeight: 800,
                                            color: perdidasNoPlan >= 0 ? theme.yellow : theme.red,
                                            fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                        }, children: [perdidasNoPlan >= 0 ? "+" : "", "$", perdidasNoPlan.toFixed(0)] }), _jsx("div", { style: {
                                            marginTop: "8px",
                                            fontSize: "13px",
                                            color: "#ffd1d1",
                                            lineHeight: 1.7,
                                        }, children: "Este n\u00FAmero te muestra cu\u00E1nto han pesado tus trades fuera del plan. Si aqu\u00ED sangras, ya sabes d\u00F3nde est\u00E1 el monstruo." })] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "14px" }), children: [_jsx("div", { style: {
                                            fontSize: "11px",
                                            color: theme.textMuted,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            marginBottom: "14px",
                                        }, children: "P&L promedio por emoci\u00F3n" }), Object.entries(emocionPnl).map(([em, data]) => {
                                        const avg = data.total / data.count;
                                        return (_jsxs("div", { style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "10px 0",
                                                borderBottom: "1px solid rgba(255,255,255,0.06)",
                                            }, children: [_jsx("span", { style: { fontSize: "13px", color: theme.textSoft }, children: getEmotionLabel(em) }), _jsxs("div", { style: {
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "10px",
                                                        flexWrap: "wrap",
                                                        justifyContent: "flex-end",
                                                    }, children: [_jsxs("span", { style: { fontSize: "12px", color: theme.textMuted }, children: [data.count, " trades"] }), _jsxs("span", { style: {
                                                                fontSize: "15px",
                                                                fontWeight: 800,
                                                                color: avg >= 0 ? theme.green : theme.red,
                                                                fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                                            }, children: [avg >= 0 ? "+" : "", "$", avg.toFixed(0)] })] })] }, em));
                                    }), Object.keys(emocionPnl).length === 0 && (_jsx("div", { style: { fontSize: "13px", color: theme.textMuted }, children: "Sin datos a\u00FAn" }))] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "14px" }), children: [_jsx("div", { style: {
                                            fontSize: "11px",
                                            color: theme.textMuted,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            marginBottom: "14px",
                                        }, children: "P&L promedio por raz\u00F3n" }), razonRanking.length > 0 ? (razonRanking.map((item) => (_jsxs("div", { style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: "10px",
                                            padding: "10px 0",
                                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                                        }, children: [_jsx("span", { style: { fontSize: "13px", color: theme.textSoft }, children: item.razon }), _jsxs("div", { style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    flexWrap: "wrap",
                                                    justifyContent: "flex-end",
                                                }, children: [_jsxs("span", { style: { fontSize: "12px", color: theme.textMuted }, children: [item.count, " trades"] }), _jsxs("span", { style: {
                                                            fontSize: "15px",
                                                            fontWeight: 800,
                                                            color: item.avg >= 0 ? theme.green : theme.red,
                                                            fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                                                        }, children: [item.avg >= 0 ? "+" : "", "$", item.avg.toFixed(0)] })] })] }, item.razon)))) : (_jsx("div", { style: { fontSize: "13px", color: theme.textMuted }, children: "Sin datos a\u00FAn" }))] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px", marginBottom: "14px" }), children: [_jsx("div", { style: {
                                            fontSize: "11px",
                                            color: theme.textMuted,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            marginBottom: "14px",
                                        }, children: "Resumen de h\u00E1bitos de hoy" }), _jsxs("div", { style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                            marginBottom: "12px",
                                        }, children: [_jsxs("span", { style: { fontSize: "13px", color: theme.textSoft }, children: ["Cumplidos: ", habitsDone, "/", habitList.length] }), _jsxs("span", { style: {
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    color: habitsPercent >= 80
                                                        ? theme.green
                                                        : habitsPercent >= 50
                                                            ? theme.yellow
                                                            : theme.red,
                                                }, children: [habitsPercent, "%"] })] }), _jsx("div", { style: {
                                            height: "10px",
                                            background: "rgba(255,255,255,0.06)",
                                            borderRadius: "999px",
                                            overflow: "hidden",
                                            marginBottom: "12px",
                                        }, children: _jsx("div", { style: {
                                                width: `${habitsPercent}%`,
                                                height: "100%",
                                                borderRadius: "999px",
                                                background: habitsPercent >= 80
                                                    ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                                                    : habitsPercent >= 50
                                                        ? "linear-gradient(90deg, #facc15, #f59e0b)"
                                                        : "linear-gradient(90deg, #ef4444, #fb7185)",
                                            } }) }), _jsx("div", { style: {
                                            fontSize: "13px",
                                            color: theme.textSoft,
                                            lineHeight: 1.7,
                                        }, children: habitsPercent >= 80
                                            ? "🔥 Vienes bien calibrado hoy. Buena base mental y física."
                                            : habitsPercent >= 50
                                                ? "⚠️ Tienes base media. Puedes operar, pero con más conciencia."
                                                : "💀 Tus hábitos hoy están flojos. No regales plata por llegar roto al mercado." })] }), _jsxs("div", { style: Object.assign(Object.assign({}, cardStyle), { padding: "18px" }), children: [_jsxs("div", { style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-end",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                            marginBottom: "14px",
                                        }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                                            fontSize: "11px",
                                                            color: theme.textMuted,
                                                            letterSpacing: "0.14em",
                                                            textTransform: "uppercase",
                                                            marginBottom: "6px",
                                                        }, children: "Progreso evaluaci\u00F3n" }), _jsx("div", { style: { fontSize: "12px", color: theme.textSoft }, children: "T\u00FA decides la meta y queda guardada hasta que la cambies." })] }), _jsxs("div", { style: { minWidth: "140px" }, children: [_jsx("div", { style: {
                                                            fontSize: "10px",
                                                            color: theme.textMuted,
                                                            letterSpacing: "0.08em",
                                                            textTransform: "uppercase",
                                                            marginBottom: "6px",
                                                            textAlign: "right",
                                                        }, children: "Meta evaluaci\u00F3n" }), _jsx(SmallInput, { type: "number", min: "1", step: "1", value: evaluationTarget, onChange: (e) => setEvaluationGoal(e.target.value), style: { marginLeft: "auto", width: "110px" } })] })] }), _jsx("div", { style: {
                                            height: "12px",
                                            background: "rgba(255,255,255,0.06)",
                                            borderRadius: "999px",
                                            overflow: "hidden",
                                        }, children: _jsx("div", { style: {
                                                height: "100%",
                                                borderRadius: "999px",
                                                transition: "width 0.5s",
                                                width: `${Math.min(Math.max((pnlTotal / evaluationTarget) * 100, 0), 100)}%`,
                                                background: "linear-gradient(90deg, #8b5cf6, #22d3ee)",
                                            } }) }), _jsxs("div", { style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginTop: "10px",
                                            gap: "10px",
                                            flexWrap: "wrap",
                                        }, children: [_jsxs("span", { style: { fontSize: "13px", color: theme.textSoft }, children: ["$", Math.max(pnlTotal, 0).toFixed(0), " logrados"] }), _jsxs("span", { style: {
                                                    fontSize: "13px",
                                                    color: theme.cyan,
                                                    fontWeight: 700,
                                                }, children: [Math.round(Math.min(Math.max((pnlTotal / evaluationTarget) * 100, 0), 100)), "%"] }), _jsxs("span", { style: { fontSize: "13px", color: theme.textSoft }, children: ["Meta: $", evaluationTarget.toFixed(0)] })] })] })] }))] })] }));
}
function TopPill({ label, value, valueColor }) {
    return (_jsxs("div", { style: {
            padding: "10px 12px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            minWidth: "102px",
        }, children: [_jsx("div", { style: {
                    fontSize: "10px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "4px",
                }, children: label }), _jsx("div", { style: {
                    fontSize: "15px",
                    fontWeight: 800,
                    color: valueColor || "#fff",
                    fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                }, children: value })] }));
}
function SectionTitle({ eyebrow, title, subtitle }) {
    return (_jsxs("div", { style: { marginBottom: "18px" }, children: [_jsx("div", { style: {
                    fontSize: "11px",
                    color: "#94a3b8",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                }, children: eyebrow }), _jsx("div", { style: {
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: "6px",
                    letterSpacing: "-0.02em",
                }, children: title }), _jsx("div", { style: {
                    fontSize: "13px",
                    color: "#c8d0e0",
                    lineHeight: 1.7,
                    maxWidth: "720px",
                }, children: subtitle })] }));
}
function ChipButton({ children, active, onClick, activeBg, activeBorder, activeColor, }) {
    return (_jsx("button", { onClick: onClick, style: {
            padding: "9px 12px",
            borderRadius: "999px",
            border: active
                ? `1px solid ${activeBorder || "rgba(139,92,246,0.38)"}`
                : "1px solid rgba(255,255,255,0.08)",
            background: active
                ? activeBg || "rgba(255,255,255,0.08)"
                : "rgba(255,255,255,0.03)",
            color: active ? activeColor || "#fff" : "#c8d0e0",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 600,
        }, children: children }));
}
function Badge({ children, subtle = false, customColor }) {
    return (_jsx("span", { style: {
            color: customColor || "#cbd5e1",
            opacity: subtle ? 0.85 : 1,
        }, children: children }));
}
function MiniPill({ children }) {
    return (_jsx("span", { style: {
            display: "inline-flex",
            alignItems: "center",
            padding: "7px 10px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#c8d0e0",
            fontSize: "12px",
        }, children: children }));
}
function StatCard({ label, value, color }) {
    return (_jsxs("div", { style: {
            background: "rgba(15, 18, 31, 0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(139, 92, 246, 0.16)",
            borderRadius: "18px",
            padding: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
        }, children: [_jsx("div", { style: {
                    fontSize: "11px",
                    color: "#94a3b8",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                }, children: label }), _jsx("div", { style: {
                    fontSize: "30px",
                    fontWeight: 800,
                    color,
                    lineHeight: 1.05,
                    fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                }, children: value })] }));
}
function InsightCard({ title, value, subValue, color }) {
    return (_jsxs("div", { style: {
            background: "rgba(15, 18, 31, 0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1px solid ${color}33`,
            borderRadius: "18px",
            padding: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
        }, children: [_jsx("div", { style: {
                    fontSize: "11px",
                    color: theme.textMuted,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                }, children: title }), _jsx("div", { style: {
                    fontSize: "18px",
                    fontWeight: 800,
                    color: color || "#fff",
                    lineHeight: 1.3,
                    marginBottom: "8px",
                }, children: value }), _jsx("div", { style: {
                    fontSize: "12px",
                    color: "#c8d0e0",
                    lineHeight: 1.6,
                }, children: subValue })] }));
}
function EmptyState({ text }) {
    return (_jsxs("div", { style: {
            textAlign: "center",
            padding: "44px 20px",
            color: "#94a3b8",
            fontSize: "14px",
            lineHeight: 1.8,
            background: "rgba(15, 18, 31, 0.88)",
            border: "1px solid rgba(139, 92, 246, 0.16)",
            borderRadius: "18px",
        }, children: [text, _jsx("br", {}), "Empieza registrando tu primer trade."] }));
}
function Label({ children }) {
    return (_jsx("div", { style: {
            fontSize: "11px",
            color: "#94a3b8",
            letterSpacing: "0.14em",
            marginBottom: "2px",
            textTransform: "uppercase",
            fontWeight: 700,
        }, children: children }));
}
function Input(_a) {
    var { style = {} } = _a, props = __rest(_a, ["style"]);
    const isDate = props.type === "date";
    return (_jsx("input", Object.assign({}, props, { style: Object.assign({ width: "100%", background: isDate
                ? "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(34,211,238,0.08))"
                : "rgba(255,255,255,0.03)", border: isDate
                ? "1px solid rgba(139,92,246,0.35)"
                : "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", color: "#f5f7fb", padding: isDate ? "13px 16px" : "13px 14px", fontFamily: "inherit", fontSize: "13px", boxSizing: "border-box", marginTop: "6px", outline: "none", cursor: isDate ? "pointer" : "text", colorScheme: isDate ? "dark" : undefined, boxShadow: isDate
                ? "0 0 0 1px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 24px rgba(15,23,42,0.24)"
                : "none" }, style) })));
}
function SmallInput(_a) {
    var { style = {} } = _a, props = __rest(_a, ["style"]);
    return (_jsx("input", Object.assign({}, props, { style: Object.assign({ width: "92px", height: "44px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#f5f7fb", padding: "0 12px", fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace', fontSize: "13px", boxSizing: "border-box", outline: "none", textAlign: "center", display: "block", appearance: "textfield", WebkitAppearance: "none", MozAppearance: "textfield" }, style) })));
}
function Select(_a) {
    var { children } = _a, props = __rest(_a, ["children"]);
    return (_jsx("select", Object.assign({}, props, { style: {
            width: "100%",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            color: "#f5f7fb",
            padding: "13px 14px",
            fontFamily: "inherit",
            fontSize: "13px",
            marginTop: "6px",
            outline: "none",
        }, children: children })));
}
function ZoneLegend({ label, sub, color, bg }) {
    return (_jsxs("div", { style: {
            padding: "12px 14px",
            borderRadius: "14px",
            background: bg,
            border: `1px solid ${color}44`,
        }, children: [_jsx("div", { style: {
                    fontSize: "13px",
                    color: "#fff",
                    fontWeight: 700,
                    marginBottom: "4px",
                }, children: label }), _jsx("div", { style: { fontSize: "12px", color }, children: sub })] }));
}
function EmotionChart({ series }) {
    if (!series.length)
        return null;
    const width = 820;
    const height = 280;
    const padding = 30;
    const values = series.map((s) => s.acumulado);
    const minY = Math.min(...values, -2);
    const maxY = Math.max(...values, 2);
    const rangeY = maxY - minY || 1;
    const getX = (i) => padding + (i * (width - padding * 2)) / Math.max(series.length - 1, 1);
    const getY = (v) => height - padding - ((v - minY) / rangeY) * (height - padding * 2);
    const path = series
        .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.acumulado)}`)
        .join(" ");
    const areaPath = `
    ${path}
    L ${getX(series.length - 1)} ${height - padding}
    L ${getX(0)} ${height - padding}
    Z
  `;
    // ✅ promedio emocional REAL por trade
    // rojo = -1, azul = 0, verde = +1
    const averageEmotionScore = series.reduce((acc, item) => acc + item.delta, 0) / series.length;
    // ✅ zona promedio visual del gráfico
    let averageZona = "azul";
    if (averageEmotionScore < -0.35) {
        averageZona = "rojo";
    }
    else if (averageEmotionScore > 0.35) {
        averageZona = "verde";
    }
    const zonaStyles = {
        rojo: {
            line: "#ef4444",
            glow: "rgba(239,68,68,0.35)",
            bg: "linear-gradient(180deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.06) 100%)",
            text: "#ffd1d1",
            areaTop: "rgba(239,68,68,0.28)",
            areaBottom: "rgba(239,68,68,0.02)",
        },
        azul: {
            line: "#22d3ee",
            glow: "rgba(34,211,238,0.35)",
            bg: "linear-gradient(180deg, rgba(56,189,248,0.16) 0%, rgba(56,189,248,0.06) 100%)",
            text: "#d8f2ff",
            areaTop: "rgba(34,211,238,0.28)",
            areaBottom: "rgba(34,211,238,0.02)",
        },
        verde: {
            line: "#22c55e",
            glow: "rgba(34,197,94,0.35)",
            bg: "linear-gradient(180deg, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.06) 100%)",
            text: "#dcffe8",
            areaTop: "rgba(34,197,94,0.28)",
            areaBottom: "rgba(34,197,94,0.02)",
        },
    };
    const lineColor = zonaStyles[averageZona].line;
    const glowColor = zonaStyles[averageZona].glow;
    const backgroundGradient = zonaStyles[averageZona].bg;
    const averageLabel = averageZona === "rojo"
        ? "🔴 Descontrol"
        : averageZona === "verde"
            ? "🟢 Euforia"
            : "🔵 Claridad";
    return (_jsx("div", { style: { width: "100%", overflowX: "auto" }, children: _jsxs("svg", { width: width, height: height, viewBox: `0 0 ${width} ${height}`, style: {
                width: "100%",
                minWidth: "720px",
                display: "block",
                borderRadius: "16px",
                background: backgroundGradient,
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)",
            }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "emotionArea", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: zonaStyles[averageZona].areaTop }), _jsx("stop", { offset: "100%", stopColor: zonaStyles[averageZona].areaBottom })] }), _jsxs("filter", { id: "glow", children: [_jsx("feGaussianBlur", { stdDeviation: "4", result: "coloredBlur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "coloredBlur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] })] }), [0.2, 0.4, 0.6, 0.8].map((line, idx) => (_jsx("line", { x1: padding, x2: width - padding, y1: padding + (height - padding * 2) * line, y2: padding + (height - padding * 2) * line, stroke: "rgba(255,255,255,0.08)", strokeDasharray: "4 5" }, `h-${idx}`))), series.map((_, idx) => (_jsx("line", { x1: getX(idx), x2: getX(idx), y1: padding, y2: height - padding, stroke: "rgba(255,255,255,0.04)", strokeDasharray: "3 6" }, `v-${idx}`))), _jsx("line", { x1: padding, x2: width - padding, y1: getY(0), y2: getY(0), stroke: lineColor, strokeWidth: "1.5", opacity: "0.28" }), _jsx("path", { d: areaPath, fill: "url(#emotionArea)" }), _jsx("path", { d: path, fill: "none", stroke: glowColor, strokeWidth: "8", strokeLinecap: "round", filter: "url(#glow)" }), _jsx("path", { d: path, fill: "none", stroke: lineColor, strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }), series.map((p, i) => (_jsx("circle", { cx: getX(i), cy: getY(p.acumulado), r: "6", fill: zonaMeta[p.zona].color, stroke: "#0b1020", strokeWidth: "2" }, p.id))), _jsx("text", { x: 18, y: 26, fill: "#22c55e", fontSize: "12", fontWeight: "700", children: "\uD83D\uDFE2 Euforia" }), _jsx("text", { x: 18, y: getY(0) - 8, fill: "#22d3ee", fontSize: "12", fontWeight: "700", children: "\uD83D\uDD35 Claridad" }), _jsx("text", { x: 18, y: height - 12, fill: "#ef4444", fontSize: "12", fontWeight: "700", children: "\uD83D\uDD34 Descontrol" }), _jsxs("text", { x: width - 235, y: 26, fill: lineColor, fontSize: "12", fontWeight: "700", children: ["Promedio emocional: ", averageLabel] })] }) }));
}
