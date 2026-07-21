"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  Timer,
  Flame,
  Check,
  Users,
} from "lucide-react";

export function LandingHero() {
  const [email, setEmail] = useState("");
  const [groupInterest, setGroupInterest] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWaitlist = async () => {
    if (!email.includes("@") || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, groupInterest }),
      });
      if (!res.ok) throw new Error("No se pudo registrar el email");
      const data = await res.json();
      setWaitlistCount(data.count ?? null);
      setSubmitted(true);
    } catch (err) {
      setError("Error al enviar. Revisa tu conexión o prueba más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-on-primary" />
          </div>
          <span className="text-lg font-bold text-text-1">Zennyth</span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/onboarding">
            Iniciar gratis
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <Badge variant="premium" className="mx-auto">
            <Zap className="w-3 h-3" />
            Scheduling inteligente con IA
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold text-text-1 tracking-tight leading-tight">
            El mismo método que
            <br />
            <span className="text-primary">los mejores del mundo.</span>
          </h1>

          <p className="text-lg text-text-2 max-w-lg mx-auto leading-relaxed">
            Zennyth organiza tu día de estudio según tu nivel de energía
            cognitiva. Las tareas difíciles van en tus horas peak, con
            descansos automáticos.
          </p>

          {/* CTA: Waitlist + Try Now */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            {submitted ? (
              <Card hover={false} className="w-full text-center py-4">
                <Check className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-sm font-semibold text-text-1">
                  Estás en la lista
                </p>
                {waitlistCount && (
                  <p className="text-xs text-text-2 mt-1">
                    #{waitlistCount} en la waitlist
                  </p>
                )}
                <Button className="mt-3" size="sm" asChild>
                  <Link href="/onboarding">
                    Probar ahora
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </Card>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWaitlist()}
                  className="flex-1 w-full rounded-xl bg-surface border border-border px-4 py-3 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"
                />
                <Button
                  onClick={handleWaitlist}
                  disabled={!email.includes("@") || loading}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {loading ? "..." : "Unirme a la waitlist"}
                </Button>
                {error && (
                  <p className="w-full text-xs text-danger text-center">{error}</p>
                )}
              </>
            )}
          </div>

          {!submitted && (
            <label className="flex items-center justify-center gap-2.5 max-w-md mx-auto cursor-pointer select-none group">
              <span
                role="checkbox"
                aria-checked={groupInterest}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setGroupInterest((v) => !v);
                  }
                }}
                onClick={() => setGroupInterest((v) => !v)}
                className={`relative inline-flex w-9 h-5 rounded-full transition-colors duration-200 ease-out ${
                  groupInterest ? "bg-primary" : "bg-bg-subtle border border-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                    groupInterest ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
              <span className="text-xs text-text-2 group-hover:text-text-1 transition-colors text-left">
                Me interesa coordinar con mi grupo de estudio
              </span>
            </label>
          )}

          <p className="text-xs text-text-3">
            O{" "}
            <Link
              href="/onboarding"
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              prueba gratis ahora
            </Link>{" "}
            sin necesidad de cuenta
          </p>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-text-3">
              <Users className="w-3.5 h-3.5" />
              <span>Para estudiantes y freelancers</span>
            </div>

          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Brain className="w-5 h-5 text-primary" />}
            title="Coach IA personal"
            desc="Estrategias de estudio basadas en tu carga real, no consejos genéricos"
          />
          <FeatureCard
            icon={<Timer className="w-5 h-5 text-accent" />}
            title="Pomodoro inteligente"
            desc="Fragmenta tareas largas en bloques de 50min con descansos automáticos"
          />
          <FeatureCard
            icon={<Flame className="w-5 h-5 text-warning" />}
            title="Racha de estudio"
            desc="Mantén tu racha diaria y ve cómo mejora tu productividad"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card hover={false} className="text-center p-6">
      <div className="w-10 h-10 rounded-xl bg-bg-subtle flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-text-1 mb-1.5">{title}</h3>
      <p className="text-xs text-text-2 leading-relaxed">{desc}</p>
    </Card>
  );
}
