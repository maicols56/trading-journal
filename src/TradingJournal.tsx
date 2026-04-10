import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

type EmotionPnlStat = {
  total: number;
  count: number;
};

type RazonStat = {
  total: number;
  count: number;
};

type BadgeProps = {
  children: React.ReactNode;
  subtle?: boolean;
  customColor?: string;
};

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

const emocionPnl: Record<string, EmotionPnlStat> = {};
const razonStats: Record<string, RazonStat> = {};

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
  return `${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${
    end.getMonth() + 1
  }`;
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
      const zona = getEmotionZone(t.emocion);
      const delta = zonaPuntajeMap[zona] ?? 0;
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
  if (!series.length) return null;
  const last = series[series.length - 1];
  return last.zona;
}

function getRepeatedZoneAlert(series) {
  if (series.length < 3) return null;
  const last3 = series.slice(-3);
  const same = last3.every((s) => s.zona === last3[0].zona);
  if (!same) return null;
  return last3[0].zona;
}

function getRecoveryInfo(series) {
  if (series.length < 4) return null;
  const last4 = series.slice(-4);
  const firstHalf = last4.slice(0, 2);
  const secondHalf = last4.slice(2);

  const hadRed = firstHalf.some((i) => i.zona === "rojo");
  const recovered = secondHalf.every(
    (i) => i.zona === "azul" || i.zona === "verde",
  );

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
  const [mensajeActual, setMensajeActual] = useState("");
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [vista, setVista] = useState("registro");
  const [semaforo, setSemaforo] = useState("verde");
  const [guardado, setGuardado] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getWeekStart(new Date()));
  const [dailyRisk, setDailyRisk] = useState({});
  const [evaluationTarget, setEvaluationTarget] = useState(1250);
  const [habits, setHabits] = useState({});
  useEffect(() => {
    if (!trades.length) return;

    // 🔥 SOLO últimos trades (ajústalo a tu gusto)
    const recentTrades = trades.slice(0, 5); // últimos 5

    const score =
      recentTrades.reduce((acc, t) => {
        const zona = emocionZonaMap[t.emocion] || "azul";
        return acc + zonaMeta[zona].value;
      }, 0) / recentTrades.length;

    let zona = "azul";

    if (score < -0.35) zona = "rojo";
    else if (score > 0.35) zona = "verde";

    const mensajes = mensajesPorZona[zona];
    const random = mensajes[Math.floor(Math.random() * mensajes.length)];

    setMensajeActual(random);
  }, [trades]);

  useEffect(() => {
    const loadTrades = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando trades:", error.message);
        return;
      }

      const mappedTrades = (data || []).map((t) => ({
        id: t.id,
        fecha: t.fecha,
        sesion: t.sesion,
        direccion: t.direccion,
        entrada: t.entrada ?? "",
        salida: t.salida ?? "",
        contratos: String(t.contratos ?? 1),
        puntosPositivos:
          t.puntos_positivos !== null && t.puntos_positivos !== undefined
            ? String(t.puntos_positivos)
            : "",
        puntosNegativos:
          t.puntos_negativos !== null && t.puntos_negativos !== undefined
            ? String(t.puntos_negativos)
            : "",
        resultado: String(t.resultado ?? 0),
        razon: t.razon ?? "",
        emocion: t.emocion ?? "neutral",
        seguiPlan: t.segui_plan ?? "si",
        notas: t.notas ?? "",
        pnl: Number(t.pnl ?? t.resultado ?? 0),
      }));

      setTrades(mappedTrades);
    };

    loadTrades();

    try {
      const storedRisk = localStorage.getItem(DAILY_RISK_STORAGE_KEY);
      if (storedRisk) setDailyRisk(JSON.parse(storedRisk));
    } catch (e) {}

    try {
      const storedTarget = localStorage.getItem(EVALUATION_TARGET_STORAGE_KEY);
      if (storedTarget) {
        const parsed = Number(storedTarget);
        if (Number.isFinite(parsed) && parsed > 0) {
          setEvaluationTarget(parsed);
        }
      }
    } catch (e) {}

    try {
      const storedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
      if (storedHabits) setHabits(JSON.parse(storedHabits));
    } catch (e) {}
  }, [user?.id]);

  const guardar = (nuevos) => {
    setTrades(nuevos);
  };

  const guardarRiesgoPorDia = (riskMap) => {
    setDailyRisk(riskMap);
    try {
      localStorage.setItem(DAILY_RISK_STORAGE_KEY, JSON.stringify(riskMap));
    } catch (e) {}
  };

  const guardarHabitos = (map) => {
    setHabits(map);
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(map));
    } catch (e) {}
  };

  const setRiskForDate = (date, value) => {
    const cleanValue = Math.max(1, parseInt(value || "1", 10) || 1);
    const updated = {
      ...dailyRisk,
      [date]: cleanValue,
    };
    guardarRiesgoPorDia(updated);
  };

  const setEvaluationGoal = (value) => {
    const cleanValue = Math.max(1, parseInt(value || "1", 10) || 1);
    setEvaluationTarget(cleanValue);

    try {
      localStorage.setItem(EVALUATION_TARGET_STORAGE_KEY, String(cleanValue));
    } catch (e) {}
  };

  const toggleHabit = (date, key) => {
    const current = habits[date] || defaultHabits;
    const updated = {
      ...habits,
      [date]: {
        ...current,
        [key]: !current[key],
      },
    };
    guardarHabitos(updated);
  };

  const getNumericValue = (value) => {
    if (value === "") return "";
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : "";
  };

  const calcularResultadoPorPuntos = (positivos, negativos, contratos) => {
    const pos = Math.max(0, parseFloat(positivos || "0") || 0);
    const neg = Math.max(0, parseFloat(negativos || "0") || 0);
    const cont = Math.min(
      100,
      Math.max(1, parseInt(contratos || "1", 10) || 1),
    );
    return (pos - neg) * cont * 2;
  };

  const f = (v) => setForm((p) => ({ ...p, ...v }));

  const actualizarPuntosYResultado = (campo, value) => {
    setForm((prev) => {
      const nextValue = getNumericValue(value);
      const next = {
        ...prev,
        [campo]: nextValue === "" ? "" : String(nextValue),
      };

      const hayPuntos =
        (parseFloat(next.puntosPositivos || "0") || 0) > 0 ||
        (parseFloat(next.puntosNegativos || "0") || 0) > 0;

      if (hayPuntos) {
        next.resultado = String(
          calcularResultadoPorPuntos(
            next.puntosPositivos,
            next.puntosNegativos,
            next.contratos,
          ),
        );
      }

      return next;
    });
  };

  const actualizarContratos = (raw) => {
    setForm((prev) => {
      if (raw === "") {
        return { ...prev, contratos: "" };
      }

      const num = Math.min(100, Math.max(1, parseInt(raw, 10) || 1));
      const next = { ...prev, contratos: String(num) };

      const hayPuntos =
        (parseFloat(next.puntosPositivos || "0") || 0) > 0 ||
        (parseFloat(next.puntosNegativos || "0") || 0) > 0;

      if (hayPuntos) {
        next.resultado = String(
          calcularResultadoPorPuntos(
            next.puntosPositivos,
            next.puntosNegativos,
            next.contratos,
          ),
        );
      }

      return next;
    });
  };

  const hoy = new Date().toISOString().split("T")[0];
  const riesgoBaseHoy = Math.max(1, Number(dailyRisk[hoy] ?? 150) || 150);

  const tradesHoy = trades.filter((t) => t.fecha === hoy);
  const pnlHoy = tradesHoy.reduce((a, b) => a + b.pnl, 0);
  const pnlTotal = trades.reduce((a, b) => a + b.pnl, 0);
  const ganadores = trades.filter((t) => t.pnl > 0).length;
  const winRate = trades.length
    ? Math.round((ganadores / trades.length) * 100)
    : 0;

  const barraRiesgo = Math.min(
    (Math.abs(Math.min(pnlHoy, 0)) / riesgoBaseHoy) * 100,
    100,
  );

  const riesgoPorTrade = Math.round(riesgoBaseHoy * 0.25);

  useEffect(() => {
    if (pnlHoy <= -riesgoBaseHoy * 0.7) {
      setSemaforo("rojo");
    } else if (pnlHoy < 0) {
      setSemaforo("amarillo");
    } else {
      setSemaforo("verde");
    }
  }, [pnlHoy, riesgoBaseHoy]);

  const agregarTrade = async () => {
    if (semaforo === "rojo") return;
    if (!user?.id) {
      alert("No hay usuario autenticado.");
      return;
    }

    const contratosNum = Math.min(
      100,
      Math.max(1, parseInt(form.contratos || "1", 10) || 1),
    );

    const puntosPos = Math.max(0, parseFloat(form.puntosPositivos || "0") || 0);
    const puntosNeg = Math.max(0, parseFloat(form.puntosNegativos || "0") || 0);

    const hayPuntos = puntosPos > 0 || puntosNeg > 0;
    const tienePrecios = form.entrada !== "" && form.salida !== "";

    const resultadoCalculado = hayPuntos
      ? calcularResultadoPorPuntos(puntosPos, puntosNeg, contratosNum)
      : parseFloat(form.resultado || "0");

    if (!hayPuntos && !tienePrecios && !form.resultado) return;
    if (!hayPuntos && !form.resultado) return;

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
      notas: form.notas || null,
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

    const nuevo = {
      id: data.id,
      fecha: data.fecha,
      sesion: data.sesion,
      direccion: data.direccion,
      entrada: data.entrada ?? "",
      salida: data.salida ?? "",
      contratos: String(data.contratos ?? 1),
      puntosPositivos:
        data.puntos_positivos !== null && data.puntos_positivos !== undefined
          ? String(data.puntos_positivos)
          : "",
      puntosNegativos:
        data.puntos_negativos !== null && data.puntos_negativos !== undefined
          ? String(data.puntos_negativos)
          : "",
      resultado: String(data.resultado ?? 0),
      razon: data.razon ?? "",
      emocion: data.emocion ?? "neutral",
      seguiPlan: data.segui_plan ?? "si",
      notas: data.notas ?? "",
      pnl: Number(data.pnl ?? data.resultado ?? 0),
    };

    setTrades((prev) => [nuevo, ...prev]);
    setForm({ ...defaultForm, fecha: form.fecha });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 1800);

    if (form.seguiPlan === "no") {
      setTimeout(() => {
        alert(
          "⚠️ Ojo: este trade quedó marcado como fuera del plan. Revísalo.",
        );
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
  const weekTrades = trades.filter(
    (t) => getWeekStart(t.fecha) === selectedWeek,
  );
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
  const topEmocion = (Object.entries(emocionCount) as [string, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const emocionRanking = (
    Object.entries(emocionPnl) as [string, EmotionPnlStat][]
  )
    .map(([em, data]) => ({
      emocion: em,
      avg: data.count ? data.total / data.count : 0,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.avg - a.avg);

  const razonRanking = (Object.entries(razonStats) as [string, RazonStat][])
    .map(([razon, data]) => ({
      razon,
      avg: data.count ? data.total / data.count : 0,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.avg - a.avg);

  trades.forEach((t) => {
    if (!emocionPnl[t.emocion]) emocionPnl[t.emocion] = { total: 0, count: 0 };
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
    if (!t.razon) return;
    if (!razonStats[t.razon]) {
      razonStats[t.razon] = { total: 0, count: 0 };
    }
    razonStats[t.razon].total += t.pnl;
    razonStats[t.razon].count += 1;
  });

  const mejorSetup = razonRanking[0];
  const peorSetup = razonRanking[razonRanking.length - 1];

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

  const analizarConIA = async () => {
    if (trades.length < 3) {
      setAiAnalysis(
        "Necesitas al menos 3 trades registrados para obtener un análisis. ¡Sigue operando y vuelve aquí!",
      );
      return;
    }

    setAiLoading(true);
    setAiAnalysis("");

    const resumen = trades
      .slice(0, 50)
      .map(
        (t) =>
          `Fecha: ${t.fecha} | Sesión: ${
            t.sesion === "new-york"
              ? "New York"
              : t.sesion === "asia"
                ? "Asia"
                : t.sesion
          } | ${t.direccion.toUpperCase()} | Resultado: $${t.pnl} | Emoción: ${
            t.emocion
          } | Zona: ${getEmotionZone(t.emocion)} | Razón: ${
            t.razon
          } | Siguió plan: ${t.seguiPlan} | Contratos: ${
            t.contratos
          } | Notas: ${t.notas}`,
      )
      .join("\n");

    const stats = `
Total trades: ${trades.length}
Win rate global: ${winRate}%
P&L total: $${pnlTotal.toFixed(0)}
Trades siguiendo el plan: ${trades.filter((t) => t.seguiPlan === "si").length}
Trades sin seguir el plan: ${trades.filter((t) => t.seguiPlan === "no").length}
P&L sesión New York: $${pnlNewYork.toFixed(0)}
P&L sesión Asia: $${pnlAsia.toFixed(0)}
Mejor setup promedio: ${mejorSetup?.razon || "N/A"} ${
      mejorSetup ? `($${mejorSetup.avg.toFixed(0)})` : ""
    }
Peor setup promedio: ${peorSetup?.razon || "N/A"} ${
      peorSetup ? `($${peorSetup.avg.toFixed(0)})` : ""
    }
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
      const text =
        data.content?.map((i) => i.text || "").join("") ||
        "No se pudo obtener el análisis.";
      setAiAnalysis(text);
    } catch (err) {
      setAiAnalysis(
        "Error al conectar con el análisis. Verifica tu conexión e inténtalo de nuevo.",
      );
    }

    setAiLoading(false);
  };

  const formatAiText = (text) => {
    return text.split("\n").map((line, i) => {
      if (
        line.startsWith("🔍") ||
        line.startsWith("❌") ||
        line.startsWith("✅") ||
        line.startsWith("🎯") ||
        line.startsWith("⚠️")
      ) {
        return (
          <div
            key={i}
            style={{
              color: "#e9ddff",
              fontWeight: 700,
              marginTop: "18px",
              marginBottom: "8px",
              fontSize: "12px",
              letterSpacing: "1.2px",
            }}
          >
            {line}
          </div>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <div
            key={i}
            style={{
              color: theme.textSoft,
              fontSize: "13px",
              marginBottom: "7px",
              paddingLeft: "10px",
              borderLeft: "2px solid rgba(139, 92, 246, 0.25)",
            }}
          >
            {line}
          </div>
        );
      }
      return line ? (
        <div
          key={i}
          style={{
            color: theme.textSoft,
            fontSize: "13px",
            marginBottom: "6px",
            lineHeight: 1.75,
          }}
        >
          {line}
        </div>
      ) : (
        <div key={i} style={{ height: "6px" }} />
      );
    });
  };

  const shellStyle = {
    minHeight: "100vh",
    color: theme.text,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

  return (
    <div style={shellStyle}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          background: "rgba(7, 8, 13, 0.78)",
          borderBottom: "1px solid rgba(139, 92, 246, 0.12)",
        }}
      >
        <div
          style={{
            maxWidth: "920px",
            margin: "0 auto",
            padding: "22px 20px 16px",
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: "18px 18px 14px",
              background:
                "linear-gradient(135deg, rgba(17, 20, 34, 0.95), rgba(24, 18, 43, 0.92))",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{ display: "flex", gap: "14px", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "16px",
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,1), rgba(34,211,238,1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#fff",
                    boxShadow:
                      "0 12px 30px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  📈
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: "#fff",
                    }}
                  >
                    MNQ BITACORA
                  </div>
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      color: theme.textMuted,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    }}
                  >
                    ROYAL HACK TRADE
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <TopPill
                  label="Win Rate"
                  value={`${winRate}%`}
                  valueColor={winRate >= 50 ? theme.green : theme.yellow}
                />
                <TopPill
                  label="P&L Total"
                  value={`${pnlTotal >= 0 ? "+" : ""}$${pnlTotal.toFixed(0)}`}
                  valueColor={pnlTotal >= 0 ? theme.green : theme.red}
                />
                <TopPill
                  label="Trades"
                  value={trades.length}
                  valueColor={theme.cyan}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "18px",
                overflowX: "auto",
                paddingBottom: "2px",
              }}
            >
              {[
                ["registro", "✏️ Registrar"],
                ["historial", "📋 Historial"],
                ["semana", "📅 Semana"],
                ["coach", "🤖 Coach IA"],
                ["habitos", "🧠 Hábitos"],
                ["psicologia", "📉 Psicología"],
                ["stats", "📊 Stats"],
              ].map(([key, label]) => {
                const active = vista === key;
                return (
                  <button
                    key={key}
                    onClick={() => setVista(key)}
                    style={{
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
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "20px",
          maxWidth: "920px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: "18px",
            marginBottom: "18px",
            background: semaforoColor[semaforo].bg,
            border: `1px solid ${
              semaforo === "verde"
                ? "rgba(34,197,94,0.22)"
                : semaforo === "amarillo"
                  ? "rgba(250,204,21,0.22)"
                  : "rgba(239,68,68,0.22)"
            }`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "14px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Semáforo del día
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: semaforoColor[semaforo].text,
                }}
              >
                {semaforoColor[semaforo].label}
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                minWidth: "160px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                P&L de hoy
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "28px",
                  lineHeight: 1,
                  fontWeight: 800,
                  color: pnlHoy >= 0 ? theme.green : theme.red,
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                }}
              >
                {pnlHoy >= 0 ? "+" : ""}${pnlHoy.toFixed(0)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            {["verde", "amarillo", "rojo"].map((s) => {
              const active = semaforo === s;
              return (
                <button
                  key={s}
                  onClick={() => setSemaforo(s)}
                  style={{
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
                  }}
                >
                  {s === "verde" ? "🟢" : s === "amarillo" ? "🟡" : "🔴"}{" "}
                  {s.toUpperCase()}
                </button>
              );
            })}
          </div>
          {mensajeActual && (
            <div
              style={{
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
              }}
            >
              {mensajeActual}
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "flex-end",
              flexWrap: "wrap",
              marginBottom: "8px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textSoft,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Riesgo consumido
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: theme.textMuted,
                }}
              >
                Guardado por fecha. Hoy usa el valor de {hoy}
              </div>
            </div>

            <div style={{ minWidth: "140px" }}>
              <div
                style={{
                  fontSize: "10px",
                  color: theme.textMuted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                  textAlign: "right",
                }}
              >
                Riesgo diario
              </div>
              <SmallInput
                type="number"
                min="1"
                step="1"
                value={dailyRisk[hoy] ?? 150}
                onChange={(e) => setRiskForDate(hoy, e.target.value)}
                style={{ marginLeft: "auto" }}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: theme.cyan,
                  marginTop: "6px",
                  textAlign: "right",
                }}
              >
                💰 Riesgo sugerido por trade: ${riesgoPorTrade}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: theme.textSoft,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Porcentaje usado
            </span>
            <span
              style={{
                fontSize: "12px",
                color: theme.textSoft,
                fontWeight: 700,
              }}
            >
              {Math.round(barraRiesgo)}%
            </span>
          </div>

          <div
            style={{
              height: "10px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "999px",
                transition: "width 0.5s",
                width: `${barraRiesgo}%`,
                background:
                  barraRiesgo < 50
                    ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                    : barraRiesgo < 80
                      ? "linear-gradient(90deg, #facc15, #f59e0b)"
                      : "linear-gradient(90deg, #ef4444, #fb7185)",
              }}
            />
          </div>

          <div
            style={{
              fontSize: "12px",
              color: theme.textMuted,
              marginTop: "8px",
            }}
          >
            Margen restante hoy:{" "}
            <span style={{ color: "#fff", fontWeight: 700 }}>
              ${Math.max(0, riesgoBaseHoy + pnlHoy).toFixed(0)}
            </span>{" "}
            / ${riesgoBaseHoy} · {tradesHoy.length} trade
            {tradesHoy.length !== 1 ? "s" : ""}
          </div>
        </div>

        {vista === "registro" && (
          <div style={{ ...cardStyle, padding: "22px" }}>
            <SectionTitle
              eyebrow="Nuevo trade"
              title="Registra tu ejecución"
              subtitle="Anota lo que hiciste, cómo te sentías y si respetaste el plan. El mercado no perdona, pero el diario sí enseña."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
              }}
            >
              <div style={{ gridColumn: "1/-1" }}>
                <Label>FECHA</Label>
                <Input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => f({ fecha: e.target.value })}
                />
              </div>

              <div>
                <Label>SESIÓN</Label>
                <Select
                  value={form.sesion}
                  onChange={(e) => f({ sesion: e.target.value })}
                >
                  <option value="new-york">🟢 New York</option>
                  <option value="asia">🟡 Asia</option>
                </Select>
              </div>

              <div>
                <Label>DIRECCIÓN</Label>
                <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                  {["long", "short"].map((d) => (
                    <button
                      key={d}
                      onClick={() => f({ direccion: d })}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "14px",
                        border:
                          form.direccion === d
                            ? `1px solid ${
                                d === "long" ? theme.green : theme.red
                              }`
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          form.direccion === d
                            ? d === "long"
                              ? "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.06))"
                              : "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.06))"
                            : "rgba(255,255,255,0.03)",
                        color: form.direccion === d ? "#fff" : theme.textSoft,
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {d === "long" ? "▲ LONG" : "▼ SHORT"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>PRECIO ENTRADA</Label>
                <Input
                  type="number"
                  placeholder="21500"
                  value={form.entrada}
                  onChange={(e) => f({ entrada: e.target.value })}
                />
              </div>

              <div>
                <Label>PRECIO SALIDA</Label>
                <Input
                  type="number"
                  placeholder="21540"
                  value={form.salida}
                  onChange={(e) => f({ salida: e.target.value })}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Label>CONTRATOS MNQ</Label>

                <div
                  style={{
                    marginTop: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "44px",
                  }}
                >
                  <SmallInput
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    placeholder="1"
                    value={form.contratos}
                    onChange={(e) => actualizarContratos(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>PUNTOS POSITIVOS</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.25"
                  placeholder="Ej: 5"
                  value={form.puntosPositivos}
                  onChange={(e) =>
                    actualizarPuntosYResultado(
                      "puntosPositivos",
                      e.target.value,
                    )
                  }
                  style={{ color: theme.green, fontWeight: 700 }}
                />
              </div>

              <div>
                <Label>PUNTOS NEGATIVOS</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.25"
                  placeholder="Ej: 2"
                  value={form.puntosNegativos}
                  onChange={(e) =>
                    actualizarPuntosYResultado(
                      "puntosNegativos",
                      e.target.value,
                    )
                  }
                  style={{ color: theme.red, fontWeight: 700 }}
                />
              </div>

              <div>
                <Label>RESULTADO ($)</Label>
                <Input
                  type="number"
                  placeholder="-50 o +100"
                  value={form.resultado}
                  onChange={(e) => {
                    const hayPuntos =
                      (parseFloat(form.puntosPositivos || "0") || 0) > 0 ||
                      (parseFloat(form.puntosNegativos || "0") || 0) > 0;

                    if (hayPuntos) return;
                    f({ resultado: e.target.value });
                  }}
                  style={{
                    color:
                      parseFloat(form.resultado) >= 0 ? theme.green : theme.red,
                    fontWeight: 700,
                    opacity:
                      (parseFloat(form.puntosPositivos || "0") || 0) > 0 ||
                      (parseFloat(form.puntosNegativos || "0") || 0) > 0
                        ? 0.9
                        : 1,
                  }}
                />
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: theme.textMuted,
                    lineHeight: 1.5,
                  }}
                >
                  Si llenas puntos positivos o negativos, este resultado se
                  calcula solo.
                </div>
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <Label>RAZÓN DE ENTRADA</Label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  {razones.map((r) => (
                    <ChipButton
                      key={r}
                      active={form.razon === r}
                      activeBg="linear-gradient(135deg, rgba(34,211,238,0.22), rgba(139,92,246,0.14))"
                      activeBorder="rgba(34,211,238,0.38)"
                      activeColor="#fff"
                      onClick={() => f({ razon: r })}
                    >
                      {r}
                    </ChipButton>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <Label>ESTADO EMOCIONAL</Label>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "8px",
                  }}
                >
                  {emotionGroups.map((group) => {
                    const zoneStyle =
                      group.zone === "rojo"
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

                    return (
                      <div
                        key={group.zone}
                        style={{
                          borderRadius: "16px",
                          padding: "14px",
                          background: zoneStyle.bg,
                          border: `1px solid ${zoneStyle.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginBottom: "10px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 800,
                              color: zoneStyle.title,
                            }}
                          >
                            {group.title}
                          </div>

                          <div
                            style={{
                              fontSize: "12px",
                              color: theme.textMuted,
                            }}
                          >
                            {group.subtitle}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {group.emotions.map((emotion) => (
                            <ChipButton
                              key={emotion.key}
                              active={form.emocion === emotion.key}
                              activeBg={
                                group.zone === "rojo"
                                  ? "linear-gradient(135deg, rgba(239,68,68,0.22), rgba(239,68,68,0.10))"
                                  : group.zone === "azul"
                                    ? "linear-gradient(135deg, rgba(56,189,248,0.22), rgba(56,189,248,0.10))"
                                    : "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(34,197,94,0.10))"
                              }
                              activeBorder={
                                group.zone === "rojo"
                                  ? "rgba(239,68,68,0.35)"
                                  : group.zone === "azul"
                                    ? "rgba(56,189,248,0.35)"
                                    : "rgba(34,197,94,0.35)"
                              }
                              activeColor="#fff"
                              onClick={() => f({ emocion: emotion.key })}
                            >
                              {emotion.label}
                            </ChipButton>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <Label>¿SEGUISTE EL PLAN?</Label>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  {[
                    ["si", "✅ Sí"],
                    ["no", "❌ No"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => f({ seguiPlan: v })}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "14px",
                        border:
                          form.seguiPlan === v
                            ? "1px solid rgba(139,92,246,0.45)"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          form.seguiPlan === v
                            ? "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(34,211,238,0.08))"
                            : "rgba(255,255,255,0.03)",
                        color: form.seguiPlan === v ? "#fff" : theme.textSoft,
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <Label>NOTAS</Label>
                <textarea
                  value={form.notas}
                  onChange={(e) => f({ notas: e.target.value })}
                  placeholder="¿Qué pasó? ¿Qué aprendiste? ¿Dónde estuvo el fallo o el acierto?"
                  style={{
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
                  }}
                />
              </div>
            </div>

            <button
              onClick={agregarTrade}
              disabled={semaforo === "rojo"}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "15px",
                background:
                  semaforo === "rojo"
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
                boxShadow:
                  semaforo === "rojo"
                    ? "0 14px 34px rgba(239,68,68,0.22)"
                    : guardado
                      ? "0 14px 34px rgba(34,197,94,0.2)"
                      : "0 14px 34px rgba(124,58,237,0.24)",
              }}
            >
              {semaforo === "rojo"
                ? "🚫 DÍA BLOQUEADO"
                : guardado
                  ? "✅ GUARDADO"
                  : "GUARDAR TRADE"}
            </button>
          </div>
        )}

        {vista === "historial" && (
          <div>
            {trades.length === 0 && (
              <EmptyState text="Sin trades registrados aún." />
            )}

            <div style={{ display: "grid", gap: "12px" }}>
              {trades.map((t) => (
                <div
                  key={t.id}
                  style={{
                    ...cardStyle,
                    padding: "16px",
                    borderLeft: `3px solid ${
                      t.pnl >= 0 ? theme.green : theme.red
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "14px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <Badge>{t.fecha}</Badge>
                        <Badge subtle>
                          {t.sesion === "new-york"
                            ? "New York"
                            : t.sesion === "asia"
                              ? "Asia"
                              : t.sesion}
                        </Badge>
                        <Badge
                          customColor={
                            t.direccion === "long" ? theme.green : theme.red
                          }
                        >
                          {t.direccion === "long" ? "▲ LONG" : "▼ SHORT"}
                        </Badge>
                        <Badge subtle>{t.contratos} MNQ</Badge>
                        {(t.puntosPositivos || t.puntosNegativos) && (
                          <Badge subtle>
                            +{t.puntosPositivos || 0} / -
                            {t.puntosNegativos || 0} pts
                          </Badge>
                        )}
                        {t.razon && <Badge subtle>{t.razon}</Badge>}
                        <Badge
                          customColor={
                            zonaMeta[getEmotionZone(t.emocion)].color
                          }
                        >
                          {zonaMeta[getEmotionZone(t.emocion)].label}
                        </Badge>
                      </div>

                      {t.notas && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: theme.textSoft,
                            lineHeight: 1.7,
                            marginBottom: "10px",
                          }}
                        >
                          {t.notas}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <MiniPill>
                          {t.seguiPlan === "si" ? "✅ Plan" : "❌ Sin plan"}
                        </MiniPill>
                        <MiniPill>{getEmotionLabel(t.emocion)}</MiniPill>
                      </div>
                    </div>

                    <div
                      style={{
                        minWidth: "140px",
                        textAlign: "right",
                        marginLeft: "auto",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: theme.textMuted,
                          marginBottom: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Resultado
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: 800,
                          color: t.pnl >= 0 ? theme.green : theme.red,
                          fontFamily:
                            '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                        }}
                      >
                        {t.pnl >= 0 ? "+" : ""}${t.pnl}
                      </div>

                      <button
                        onClick={() => eliminar(t.id)}
                        style={{
                          marginTop: "12px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: theme.textMuted,
                          cursor: "pointer",
                          fontSize: "12px",
                          padding: "8px 10px",
                          borderRadius: "10px",
                        }}
                      >
                        🗑 borrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {vista === "semana" && (
          <div>
            <div
              style={{ ...cardStyle, padding: "18px", marginBottom: "16px" }}
            >
              <Label>SEMANA</Label>
              <Select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
              >
                {weeks.map((w) => (
                  <option key={w} value={w}>
                    Semana del {getWeekLabel(w)}
                    {w === getWeekStart(new Date()) ? " (actual)" : ""}
                  </option>
                ))}
              </Select>
            </div>

            {weekTrades.length === 0 ? (
              <EmptyState text="Sin trades esta semana." />
            ) : (
              <>
                <div
                  style={{
                    ...cardStyle,
                    padding: "20px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "flex-end",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: theme.textMuted,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          marginBottom: "5px",
                        }}
                      >
                        Progreso semanal
                      </div>
                      <div
                        style={{
                          fontSize: "30px",
                          fontWeight: 800,
                          color: weekPnl >= 0 ? theme.green : theme.red,
                          fontFamily:
                            '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                        }}
                      >
                        {weekPnl >= 0 ? "+" : ""}${weekPnl.toFixed(0)}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "8px 12px",
                        borderRadius: "999px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: theme.textSoft,
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Meta semanal: $300
                    </div>
                  </div>

                  <div
                    style={{
                      height: "12px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: "999px",
                        transition: "width 0.5s",
                        width: `${Math.min(
                          Math.max((weekPnl / 300) * 100, 0),
                          100,
                        )}%`,
                        background:
                          weekPnl >= 300
                            ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                            : weekPnl >= 150
                              ? "linear-gradient(90deg, #facc15, #f59e0b)"
                              : "linear-gradient(90deg, #8b5cf6, #22d3ee)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "8px",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: theme.textSoft }}>
                      {Math.round(
                        Math.min(Math.max((weekPnl / 300) * 100, 0), 100),
                      )}
                      % del objetivo
                    </span>
                    {weekPnl >= 300 && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: theme.green,
                          fontWeight: 700,
                        }}
                      >
                        🎯 Objetivo semanal alcanzado
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <StatCard
                    label="WIN RATE"
                    value={`${weekWinRate}%`}
                    color={weekWinRate >= 50 ? theme.green : theme.yellow}
                  />
                  <StatCard
                    label="TRADES"
                    value={weekTrades.length}
                    color={theme.cyan}
                  />
                  <StatCard
                    label="GANADORES"
                    value={weekWinners}
                    color={theme.green}
                  />
                  <StatCard
                    label="PERDEDORES"
                    value={weekTrades.length - weekWinners}
                    color={theme.red}
                  />
                  <StatCard
                    label="DÍAS POSITIVOS"
                    value={diasConGanancia}
                    color={theme.green}
                  />
                  <StatCard
                    label="SIGUIÓ PLAN"
                    value={`${weekSiguioPlan}/${weekTrades.length}`}
                    color={
                      weekSiguioPlan >= weekTrades.length * 0.8
                        ? theme.green
                        : theme.yellow
                    }
                  />
                </div>

                <div
                  style={{
                    ...cardStyle,
                    padding: "18px",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.textMuted,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      marginBottom: "14px",
                    }}
                  >
                    Sesión más rentable
                  </div>

                  {[
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
                  ].map((s) => (
                    <div key={s.label} style={{ marginBottom: "14px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          marginBottom: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{ fontSize: "13px", color: theme.textSoft }}
                        >
                          {s.label}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: s.pnl >= 0 ? theme.green : theme.red,
                            fontFamily:
                              '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                          }}
                        >
                          {s.pnl >= 0 ? "+" : ""}${s.pnl.toFixed(0)} ·{" "}
                          {s.trades} trade
                          {s.trades !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div
                        style={{
                          height: "8px",
                          background: "rgba(255,255,255,0.06)",
                          borderRadius: "999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(
                              (Math.abs(s.pnl) /
                                Math.max(Math.abs(weekPnl), 1)) *
                                100,
                              100,
                            )}%`,
                            background:
                              s.pnl >= 0
                                ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                                : "linear-gradient(90deg, #ef4444, #fb7185)",
                            borderRadius: "999px",
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop: "10px",
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "14px",
                      fontSize: "13px",
                      color: theme.textSoft,
                      lineHeight: 1.65,
                    }}
                  >
                    {pnlNewYork >= pnlAsia
                      ? "✅ Tu mejor sesión es NEW YORK. Dale prioridad y cuida no sobreoperar fuera de tu zona fuerte."
                      : "⚠️ Rindes mejor en ASIA. Revisa qué cambia en tu ejecución y si New York te está metiendo ruido."}
                  </div>
                </div>

                {topEmocion && (
                  <div
                    style={{
                      ...cardStyle,
                      padding: "18px",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: theme.textMuted,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                      }}
                    >
                      Estado emocional dominante
                    </div>
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>
                      {getEmotionLabel(topEmocion[0])}
                    </div>
                    <div style={{ fontSize: "13px", color: theme.textSoft }}>
                      Presente en{" "}
                      <span style={{ color: "#fff", fontWeight: 700 }}>
                        {topEmocion[1]}
                      </span>{" "}
                      de {weekTrades.length} trades esta semana
                    </div>
                  </div>
                )}

                {weekNoSiguio > 0 && (
                  <div
                    style={{
                      ...cardStyle,
                      padding: "18px",
                      background:
                        "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.03))",
                      border: "1px solid rgba(239,68,68,0.24)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#ffb4b4",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      Trades fuera del plan
                    </div>
                    <div
                      style={{
                        fontSize: "30px",
                        fontWeight: 800,
                        color: theme.red,
                        marginBottom: "6px",
                      }}
                    >
                      {weekNoSiguio}
                    </div>
                    <div style={{ fontSize: "13px", color: "#ffd1d1" }}>
                      Pérdida promedio en trades fuera del plan:{" "}
                      <span style={{ fontWeight: 800 }}>
                        $
                        {(
                          weekTrades
                            .filter((t) => t.seguiPlan === "no")
                            .reduce((a, b) => a + b.pnl, 0) / weekNoSiguio || 0
                        ).toFixed(0)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {vista === "coach" && (
          <div>
            <div
              style={{
                ...cardStyle,
                padding: "22px",
                marginBottom: "16px",
                background:
                  "linear-gradient(135deg, rgba(18,20,34,0.96), rgba(29,19,51,0.94))",
                border: "1px solid rgba(139,92,246,0.24)",
              }}
            >
              <SectionTitle
                eyebrow="Coach IA"
                title="Diagnóstico de tu ejecución"
                subtitle="Analizo patrones de disciplina, resultados, emociones y consistencia para decirte dónde ajustar sin anestesia, pero con cariño profesional."
              />

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  fontSize: "12px",
                  color: theme.textSoft,
                  marginBottom: "18px",
                }}
              >
                <MiniPill>📊 {trades.length} trades</MiniPill>
                <MiniPill>🎯 {winRate}% win rate</MiniPill>
                <MiniPill>
                  <span
                    style={{ color: pnlTotal >= 0 ? theme.green : theme.red }}
                  >
                    {pnlTotal >= 0 ? "+" : ""}${pnlTotal.toFixed(0)} P&L
                  </span>
                </MiniPill>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: theme.textSoft,
                  marginBottom: "16px",
                  lineHeight: 1.7,
                }}
              >
                Analizo todos tus trades registrados, detecto patrones y te digo
                exactamente en qué estás fallando y cómo mejorar.
                {trades.length < 3 && (
                  <span style={{ color: theme.yellow }}>
                    {" "}
                    Necesitas al menos 3 trades para el análisis.
                  </span>
                )}
              </div>

              <button
                onClick={analizarConIA}
                disabled={aiLoading}
                style={{
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
                }}
              >
                {aiLoading
                  ? "⏳ ANALIZANDO TUS TRADES..."
                  : "🔍 ANALIZAR MIS TRADES"}
              </button>
            </div>

            {aiAnalysis && (
              <div
                style={{
                  ...cardStyle,
                  padding: "22px",
                  border: "1px solid rgba(139,92,246,0.26)",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#cdb7ff",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: "14px",
                  }}
                >
                  Análisis personalizado
                </div>
                <div style={{ lineHeight: 1.8 }}>
                  {formatAiText(aiAnalysis)}
                </div>
                <div
                  style={{
                    marginTop: "18px",
                    paddingTop: "14px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "12px",
                    color: theme.textMuted,
                  }}
                >
                  Basado en {trades.length} trades registrados · Actualiza el
                  análisis después de registrar más trades
                </div>
              </div>
            )}
          </div>
        )}

        {vista === "habitos" && (
          <div>
            <div
              style={{ ...cardStyle, padding: "22px", marginBottom: "16px" }}
            >
              <SectionTitle
                eyebrow="Disciplina personal"
                title="Checklist de hábitos"
                subtitle="Tu rendimiento en trading es un reflejo directo de cómo llegas a la batalla. Si tu vida está alineada, tu ejecución mejora."
              />

              <div
                style={{
                  marginBottom: "18px",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    alignItems: "flex-end",
                    flexWrap: "wrap",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: theme.textMuted,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                      }}
                    >
                      Progreso del día
                    </div>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color:
                          habitsPercent >= 80
                            ? theme.green
                            : habitsPercent >= 50
                              ? theme.yellow
                              : theme.red,
                        fontFamily:
                          '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                      }}
                    >
                      {habitsPercent}%
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: theme.textSoft,
                      textAlign: "right",
                    }}
                  >
                    {habitsDone} / {habitList.length} hábitos cumplidos
                  </div>
                </div>

                <div
                  style={{
                    height: "10px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${habitsPercent}%`,
                      height: "100%",
                      borderRadius: "999px",
                      transition: "width 0.4s ease",
                      background:
                        habitsPercent >= 80
                          ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                          : habitsPercent >= 50
                            ? "linear-gradient(90deg, #facc15, #f59e0b)"
                            : "linear-gradient(90deg, #ef4444, #fb7185)",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "12px",
                    color: theme.textMuted,
                    lineHeight: 1.6,
                  }}
                >
                  Cuanto más alto esté esto, mejor llegas al mercado. El chart
                  no sabe si desayunaste mal... pero tu cerebro sí.
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "10px",
                }}
              >
                {habitList.map((h) => {
                  const active = todayHabits[h.key];

                  return (
                    <button
                      key={h.key}
                      onClick={() => toggleHabit(hoy, h.key)}
                      style={{
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
                      }}
                    >
                      <span>{h.label}</span>
                      <span
                        style={{ fontSize: "18px", opacity: active ? 1 : 0.75 }}
                      >
                        {active ? "✅" : "⬜"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "rgba(139,92,246,0.08)",
                  border: "1px solid rgba(139,92,246,0.16)",
                  fontSize: "13px",
                  color: theme.textSoft,
                  lineHeight: 1.7,
                }}
              >
                {habitsPercent >= 80
                  ? "🔥 Vienes fuerte hoy. Buenas bases para una ejecución limpia."
                  : habitsPercent >= 50
                    ? "⚠️ Vas medio bien, pero todavía puedes mejorar cómo llegas al mercado."
                    : "💀 Ojo: tu base del día está floja. Hoy toca operar con mucha cabeza o no regalar dinero."}
              </div>
            </div>
          </div>
        )}

        {vista === "psicologia" && (
          <div>
            <div
              style={{
                ...cardStyle,
                padding: "22px",
                marginBottom: "16px",
                background:
                  "linear-gradient(135deg, rgba(17,20,34,0.96), rgba(16,24,40,0.94))",
              }}
            >
              <SectionTitle
                eyebrow="Psicotrading"
                title="Gráfica emocional"
                subtitle="Aquí ves si estás operando desde el descontrol, la claridad o la euforia. El PnL muestra qué pasó; esto muestra desde dónde lo hiciste."
              />

              {psychSeries.length === 0 ? (
                <EmptyState text="Sin datos emocionales aún." />
              ) : (
                <>
                  <div
                    style={{
                      ...cardStyle,
                      padding: "16px",
                      marginBottom: "14px",
                      background:
                        "linear-gradient(180deg, rgba(239,68,68,0.08) 0%, rgba(56,189,248,0.06) 50%, rgba(34,197,94,0.08) 100%)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: theme.textMuted,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                      }}
                    >
                      Línea emocional acumulada
                    </div>

                    <EmotionChart series={psychSeries} />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "10px",
                        marginTop: "14px",
                      }}
                    >
                      <ZoneLegend
                        label="🔴 Zona Roja"
                        sub="Descontrol"
                        color={zonaMeta.rojo.color}
                        bg={zonaMeta.rojo.soft}
                      />
                      <ZoneLegend
                        label="🔵 Zona Azul"
                        sub="Claridad"
                        color={zonaMeta.azul.color}
                        bg={zonaMeta.azul.soft}
                      />
                      <ZoneLegend
                        label="🟢 Zona Verde"
                        sub="Euforia"
                        color={zonaMeta.verde.color}
                        bg={zonaMeta.verde.soft}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "12px",
                      marginBottom: "14px",
                    }}
                  >
                    <InsightCard
                      title="Estado actual"
                      value={
                        currentZoneMeta ? currentZoneMeta.label : "Sin datos"
                      }
                      subValue={
                        psychSeries.length
                          ? `Último trade: ${
                              psychSeries[psychSeries.length - 1].emocionLabel
                            }`
                          : "Sin registros"
                      }
                      color={
                        currentZoneMeta ? currentZoneMeta.color : theme.cyan
                      }
                    />
                    <InsightCard
                      title="Zona más repetida"
                      value={
                        Object.entries(zonaCount).sort((a, b) => b[1] - a[1])[0]
                          ? zonaMeta[
                              Object.entries(zonaCount).sort(
                                (a, b) => b[1] - a[1],
                              )[0][0]
                            ].label
                          : "Sin datos"
                      }
                      subValue={`Rojos: ${zonaCount.rojo} · Azules: ${zonaCount.azul} · Verdes: ${zonaCount.verde}`}
                      color={theme.cyan}
                    />
                    <InsightCard
                      title="Emoción que más pierde"
                      value={
                        peorEmocion
                          ? getEmotionLabel(peorEmocion.emocion)
                          : "Sin datos"
                      }
                      subValue={
                        peorEmocion
                          ? `Promedio: ${
                              peorEmocion.avg >= 0 ? "+" : ""
                            }$${peorEmocion.avg.toFixed(0)}`
                          : "Aún no hay suficiente info"
                      }
                      color={theme.red}
                    />
                    <InsightCard
                      title="Emoción que más gana"
                      value={
                        mejorEmocion
                          ? getEmotionLabel(mejorEmocion.emocion)
                          : "Sin datos"
                      }
                      subValue={
                        mejorEmocion
                          ? `Promedio: ${
                              mejorEmocion.avg >= 0 ? "+" : ""
                            }$${mejorEmocion.avg.toFixed(0)}`
                          : "Aún no hay suficiente info"
                      }
                      color={theme.green}
                    />
                  </div>

                  {psychRepeatedAlert && (
                    <div
                      style={{
                        ...cardStyle,
                        padding: "18px",
                        marginBottom: "14px",
                        background:
                          psychRepeatedAlert === "rojo"
                            ? "linear-gradient(135deg, rgba(239,68,68,0.16), rgba(239,68,68,0.04))"
                            : psychRepeatedAlert === "verde"
                              ? "linear-gradient(135deg, rgba(34,197,94,0.14), rgba(34,197,94,0.04))"
                              : "linear-gradient(135deg, rgba(56,189,248,0.14), rgba(56,189,248,0.04))",
                        border: `1px solid ${zonaMeta[psychRepeatedAlert].color}44`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          marginBottom: "8px",
                          color: zonaMeta[psychRepeatedAlert].color,
                        }}
                      >
                        Patrón emocional repetido
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#fff",
                          fontWeight: 700,
                          marginBottom: "6px",
                        }}
                      >
                        {psychRepeatedAlert === "rojo" &&
                          "⚠️ Tienes 3 registros seguidos en descontrol. Riesgo alto de seguir regalando trades."}
                        {psychRepeatedAlert === "azul" &&
                          "✅ Llevas 3 registros seguidos en claridad. Buen control mental."}
                        {psychRepeatedAlert === "verde" &&
                          "🟢 Llevas 3 registros seguidos en euforia. Ojo con la sobreconfianza y el exceso de riesgo."}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: theme.textSoft,
                          lineHeight: 1.7,
                        }}
                      >
                        Repetir emociones deja huella. Aquí no solo importa cómo
                        te sentiste una vez, sino qué patrón estás construyendo.
                      </div>
                    </div>
                  )}

                  {psychRecoveryMessage && (
                    <div
                      style={{
                        ...cardStyle,
                        padding: "18px",
                        marginBottom: "14px",
                        background:
                          "linear-gradient(135deg, rgba(56,189,248,0.10), rgba(34,197,94,0.06))",
                        border: "1px solid rgba(56,189,248,0.24)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: theme.cyan,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          marginBottom: "8px",
                        }}
                      >
                        Recuperación emocional
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {psychRecoveryMessage}
                      </div>
                    </div>
                  )}

                  <div style={{ ...cardStyle, padding: "18px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: theme.textMuted,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        marginBottom: "12px",
                      }}
                    >
                      Últimos registros emocionales
                    </div>

                    <div style={{ display: "grid", gap: "10px" }}>
                      {psychSeries
                        .slice(-6)
                        .reverse()
                        .map((item) => (
                          <div
                            key={item.id}
                            style={{
                              padding: "12px 14px",
                              borderRadius: "14px",
                              background: "rgba(255,255,255,0.03)",
                              border: `1px solid ${
                                zonaMeta[item.zona].color
                              }33`,
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "12px",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#fff",
                                  marginBottom: "4px",
                                }}
                              >
                                {item.emocionLabel}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: theme.textMuted,
                                }}
                              >
                                {item.fecha} · {zonaMeta[item.zona].label}
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 800,
                                  color:
                                    item.pnl >= 0 ? theme.green : theme.red,
                                }}
                              >
                                {item.pnl >= 0 ? "+" : ""}${item.pnl}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: theme.textSoft,
                                }}
                              >
                                Curva: {item.acumulado > 0 ? "+" : ""}
                                {item.acumulado}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {vista === "stats" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              {[
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
              ].map((s) => (
                <StatCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  color={s.color}
                />
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              <InsightCard
                title="🔥 Setup más rentable"
                value={mejorSetup ? mejorSetup.razon : "Sin datos"}
                subValue={
                  mejorSetup
                    ? `Promedio: ${
                        mejorSetup.avg >= 0 ? "+" : ""
                      }$${mejorSetup.avg.toFixed(0)} · ${
                        mejorSetup.count
                      } trade${mejorSetup.count !== 1 ? "s" : ""}`
                    : "Registra trades con razón"
                }
                color={theme.green}
              />

              <InsightCard
                title="💀 Setup que más castiga"
                value={peorSetup ? peorSetup.razon : "Sin datos"}
                subValue={
                  peorSetup
                    ? `Promedio: ${
                        peorSetup.avg >= 0 ? "+" : ""
                      }$${peorSetup.avg.toFixed(0)} · ${peorSetup.count} trade${
                        peorSetup.count !== 1 ? "s" : ""
                      }`
                    : "Registra trades con razón"
                }
                color={theme.red}
              />

              <InsightCard
                title="😎 Emoción más rentable"
                value={
                  mejorEmocion
                    ? getEmotionLabel(mejorEmocion.emocion)
                    : "Sin datos"
                }
                subValue={
                  mejorEmocion
                    ? `Promedio: ${
                        mejorEmocion.avg >= 0 ? "+" : ""
                      }$${mejorEmocion.avg.toFixed(0)}`
                    : "Aún no hay suficiente info"
                }
                color={theme.green}
              />

              <InsightCard
                title="⚠️ Emoción más peligrosa"
                value={
                  peorEmocion
                    ? getEmotionLabel(peorEmocion.emocion)
                    : "Sin datos"
                }
                subValue={
                  peorEmocion
                    ? `Promedio: ${
                        peorEmocion.avg >= 0 ? "+" : ""
                      }$${peorEmocion.avg.toFixed(0)}`
                    : "Aún no hay suficiente info"
                }
                color={theme.red}
              />
            </div>

            <div
              style={{
                ...cardStyle,
                padding: "18px",
                marginBottom: "14px",
                background:
                  "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.03))",
                border: "1px solid rgba(239,68,68,0.24)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#ffb4b4",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                  letterSpacing: "0.14em",
                }}
              >
                💀 Costo de no seguir el plan
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: perdidasNoPlan >= 0 ? theme.yellow : theme.red,
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                }}
              >
                {perdidasNoPlan >= 0 ? "+" : ""}${perdidasNoPlan.toFixed(0)}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "#ffd1d1",
                  lineHeight: 1.7,
                }}
              >
                Este número te muestra cuánto han pesado tus trades fuera del
                plan. Si aquí sangras, ya sabes dónde está el monstruo.
              </div>
            </div>

            <div
              style={{ ...cardStyle, padding: "18px", marginBottom: "14px" }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                P&L promedio por emoción
              </div>

              {Object.entries(emocionPnl).map(([em, data]) => {
                const avg = data.total / data.count;
                return (
                  <div
                    key={em}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: theme.textSoft }}>
                      {getEmotionLabel(em)}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span
                        style={{ fontSize: "12px", color: theme.textMuted }}
                      >
                        {data.count} trades
                      </span>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: avg >= 0 ? theme.green : theme.red,
                          fontFamily:
                            '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                        }}
                      >
                        {avg >= 0 ? "+" : ""}${avg.toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {Object.keys(emocionPnl).length === 0 && (
                <div style={{ fontSize: "13px", color: theme.textMuted }}>
                  Sin datos aún
                </div>
              )}
            </div>

            <div
              style={{ ...cardStyle, padding: "18px", marginBottom: "14px" }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                P&L promedio por razón
              </div>

              {razonRanking.length > 0 ? (
                razonRanking.map((item) => (
                  <div
                    key={item.razon}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: theme.textSoft }}>
                      {item.razon}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <span
                        style={{ fontSize: "12px", color: theme.textMuted }}
                      >
                        {item.count} trades
                      </span>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: item.avg >= 0 ? theme.green : theme.red,
                          fontFamily:
                            '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                        }}
                      >
                        {item.avg >= 0 ? "+" : ""}${item.avg.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "13px", color: theme.textMuted }}>
                  Sin datos aún
                </div>
              )}
            </div>

            <div
              style={{ ...cardStyle, padding: "18px", marginBottom: "14px" }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: theme.textMuted,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                Resumen de hábitos de hoy
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "13px", color: theme.textSoft }}>
                  Cumplidos: {habitsDone}/{habitList.length}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color:
                      habitsPercent >= 80
                        ? theme.green
                        : habitsPercent >= 50
                          ? theme.yellow
                          : theme.red,
                  }}
                >
                  {habitsPercent}%
                </span>
              </div>

              <div
                style={{
                  height: "10px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: `${habitsPercent}%`,
                    height: "100%",
                    borderRadius: "999px",
                    background:
                      habitsPercent >= 80
                        ? "linear-gradient(90deg, #22c55e, #22d3ee)"
                        : habitsPercent >= 50
                          ? "linear-gradient(90deg, #facc15, #f59e0b)"
                          : "linear-gradient(90deg, #ef4444, #fb7185)",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: theme.textSoft,
                  lineHeight: 1.7,
                }}
              >
                {habitsPercent >= 80
                  ? "🔥 Vienes bien calibrado hoy. Buena base mental y física."
                  : habitsPercent >= 50
                    ? "⚠️ Tienes base media. Puedes operar, pero con más conciencia."
                    : "💀 Tus hábitos hoy están flojos. No regales plata por llegar roto al mercado."}
              </div>
            </div>

            <div style={{ ...cardStyle, padding: "18px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.textMuted,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                    }}
                  >
                    Progreso evaluación
                  </div>
                  <div style={{ fontSize: "12px", color: theme.textSoft }}>
                    Tú decides la meta y queda guardada hasta que la cambies.
                  </div>
                </div>

                <div style={{ minWidth: "140px" }}>
                  <div
                    style={{
                      fontSize: "10px",
                      color: theme.textMuted,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "6px",
                      textAlign: "right",
                    }}
                  >
                    Meta evaluación
                  </div>
                  <SmallInput
                    type="number"
                    min="1"
                    step="1"
                    value={evaluationTarget}
                    onChange={(e) => setEvaluationGoal(e.target.value)}
                    style={{ marginLeft: "auto", width: "110px" }}
                  />
                </div>
              </div>

              <div
                style={{
                  height: "12px",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: "999px",
                    transition: "width 0.5s",
                    width: `${Math.min(
                      Math.max((pnlTotal / evaluationTarget) * 100, 0),
                      100,
                    )}%`,
                    background: "linear-gradient(90deg, #8b5cf6, #22d3ee)",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "10px",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "13px", color: theme.textSoft }}>
                  ${Math.max(pnlTotal, 0).toFixed(0)} logrados
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: theme.cyan,
                    fontWeight: 700,
                  }}
                >
                  {Math.round(
                    Math.min(
                      Math.max((pnlTotal / evaluationTarget) * 100, 0),
                      100,
                    ),
                  )}
                  %
                </span>
                <span style={{ fontSize: "13px", color: theme.textSoft }}>
                  Meta: ${evaluationTarget.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopPill({ label, value, valueColor }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        minWidth: "102px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 800,
          color: valueColor || "#fff",
          fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          fontSize: "11px",
          color: "#94a3b8",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "6px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "#c8d0e0",
          lineHeight: 1.7,
          maxWidth: "720px",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function ChipButton({
  children,
  active,
  onClick,
  activeBg,
  activeBorder,
  activeColor,
}) {
  return (
    <button
      onClick={onClick}
      style={{
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
      }}
    >
      {children}
    </button>
  );
}

function Badge({ children, subtle = false, customColor }: BadgeProps) {
  return (
    <span
      style={{
        color: customColor || "#cbd5e1",
        opacity: subtle ? 0.85 : 1,
      }}
    >
      {children}
    </span>
  );
}

function MiniPill({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "7px 10px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#c8d0e0",
        fontSize: "12px",
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        background: "rgba(15, 18, 31, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(139, 92, 246, 0.16)",
        borderRadius: "18px",
        padding: "18px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#94a3b8",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "30px",
          fontWeight: 800,
          color,
          lineHeight: 1.05,
          fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InsightCard({ title, value, subValue, color }) {
  return (
    <div
      style={{
        background: "rgba(15, 18, 31, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${color}33`,
        borderRadius: "18px",
        padding: "18px",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: theme.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: color || "#fff",
          lineHeight: 1.3,
          marginBottom: "8px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#c8d0e0",
          lineHeight: 1.6,
        }}
      >
        {subValue}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "44px 20px",
        color: "#94a3b8",
        fontSize: "14px",
        lineHeight: 1.8,
        background: "rgba(15, 18, 31, 0.88)",
        border: "1px solid rgba(139, 92, 246, 0.16)",
        borderRadius: "18px",
      }}
    >
      {text}
      <br />
      Empieza registrando tu primer trade.
    </div>
  );
}

function Label({ children }) {
  return (
    <div
      style={{
        fontSize: "11px",
        color: "#94a3b8",
        letterSpacing: "0.14em",
        marginBottom: "2px",
        textTransform: "uppercase",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function Input({ style = {}, ...props }) {
  const isDate = props.type === "date";

  return (
    <input
      {...props}
      style={{
        width: "100%",
        background: isDate
          ? "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(34,211,238,0.08))"
          : "rgba(255,255,255,0.03)",
        border: isDate
          ? "1px solid rgba(139,92,246,0.35)"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        color: "#f5f7fb",
        padding: isDate ? "13px 16px" : "13px 14px",
        fontFamily: "inherit",
        fontSize: "13px",
        boxSizing: "border-box",
        marginTop: "6px",
        outline: "none",
        cursor: isDate ? "pointer" : "text",
        colorScheme: isDate ? "dark" : undefined,
        boxShadow: isDate
          ? "0 0 0 1px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 24px rgba(15,23,42,0.24)"
          : "none",
        ...style,
      }}
    />
  );
}

function SmallInput({ style = {}, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "92px",
        height: "44px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        color: "#f5f7fb",
        padding: "0 12px",
        fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
        fontSize: "13px",
        boxSizing: "border-box",
        outline: "none",
        textAlign: "center",
        display: "block",
        appearance: "textfield",
        WebkitAppearance: "none",
        MozAppearance: "textfield",
        ...style,
      }}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      style={{
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
      }}
    >
      {children}
    </select>
  );
}

function ZoneLegend({ label, sub, color, bg }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "14px",
        background: bg,
        border: `1px solid ${color}44`,
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#fff",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "12px", color }}>{sub}</div>
    </div>
  );
}

function EmotionChart({ series }) {
  if (!series.length) return null;

  const width = 820;
  const height = 280;
  const padding = 30;

  const values = series.map((s) => s.acumulado);
  const minY = Math.min(...values, -2);
  const maxY = Math.max(...values, 2);
  const rangeY = maxY - minY || 1;

  const getX = (i) =>
    padding + (i * (width - padding * 2)) / Math.max(series.length - 1, 1);

  const getY = (v) =>
    height - padding - ((v - minY) / rangeY) * (height - padding * 2);

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
  const averageEmotionScore =
    series.reduce((acc, item) => acc + item.delta, 0) / series.length;

  // ✅ zona promedio visual del gráfico
  let averageZona = "azul";
  if (averageEmotionScore < -0.35) {
    averageZona = "rojo";
  } else if (averageEmotionScore > 0.35) {
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
  const averageLabel =
    averageZona === "rojo"
      ? "🔴 Descontrol"
      : averageZona === "verde"
        ? "🟢 Euforia"
        : "🔵 Claridad";

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: "100%",
          minWidth: "720px",
          display: "block",
          borderRadius: "16px",
          background: backgroundGradient,
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)",
        }}
      >
        <defs>
          <linearGradient id="emotionArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={zonaStyles[averageZona].areaTop} />
            <stop
              offset="100%"
              stopColor={zonaStyles[averageZona].areaBottom}
            />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid horizontal */}
        {[0.2, 0.4, 0.6, 0.8].map((line, idx) => (
          <line
            key={`h-${idx}`}
            x1={padding}
            x2={width - padding}
            y1={padding + (height - padding * 2) * line}
            y2={padding + (height - padding * 2) * line}
            stroke="rgba(255,255,255,0.08)"
            strokeDasharray="4 5"
          />
        ))}

        {/* Grid vertical */}
        {series.map((_, idx) => (
          <line
            key={`v-${idx}`}
            x1={getX(idx)}
            x2={getX(idx)}
            y1={padding}
            y2={height - padding}
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="3 6"
          />
        ))}

        {/* Línea base claridad */}
        <line
          x1={padding}
          x2={width - padding}
          y1={getY(0)}
          y2={getY(0)}
          stroke={lineColor}
          strokeWidth="1.5"
          opacity="0.28"
        />

        {/* Área bajo la curva */}
        <path d={areaPath} fill="url(#emotionArea)" />

        {/* Glow */}
        <path
          d={path}
          fill="none"
          stroke={glowColor}
          strokeWidth="8"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Línea principal */}
        <path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Puntos individuales */}
        {series.map((p, i) => (
          <circle
            key={p.id}
            cx={getX(i)}
            cy={getY(p.acumulado)}
            r="6"
            fill={zonaMeta[p.zona].color}
            stroke="#0b1020"
            strokeWidth="2"
          />
        ))}

        {/* Labels fijos de zonas */}
        <text x={18} y={26} fill="#22c55e" fontSize="12" fontWeight="700">
          🟢 Euforia
        </text>

        <text
          x={18}
          y={getY(0) - 8}
          fill="#22d3ee"
          fontSize="12"
          fontWeight="700"
        >
          🔵 Claridad
        </text>

        <text
          x={18}
          y={height - 12}
          fill="#ef4444"
          fontSize="12"
          fontWeight="700"
        >
          🔴 Descontrol
        </text>

        {/* Estado promedio del gráfico */}
        <text
          x={width - 235}
          y={26}
          fill={lineColor}
          fontSize="12"
          fontWeight="700"
        >
          Promedio emocional: {averageLabel}
        </text>
      </svg>
    </div>
  );
}
