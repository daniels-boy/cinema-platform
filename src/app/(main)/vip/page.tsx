"use client";

import { useState } from "react";
import { Check, Crown, Flame, Gift, Sparkles, CreditCard, X, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function VipPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const plans = [
    {
      id: "pipoca",
      name: "Pipoca de Micro-ondas",
      price: "Grátis",
      period: "",
      description: "Aquele acesso básico, rápido, que todo mundo consome, mas vem com os anúncios de tabela.",
      benefits: [
        "Acesso completo ao catálogo do TMDB.",
        "Avaliar filmes.",
        "Publicar resenhas na comunidade.",
      ],
      buttonText: "Continuar no Grátis",
      buttonStyle: "btn-ghost-vip",
      highlight: false,
      popular: false,
    },
    {
      id: "sommelier",
      name: "Sommelier de Roteiro",
      price: "R$ 49,90",
      period: "/ mês",
      description: "Para aquele fã que adora dar nota quebrada e escrever textão criticando o diretor.",
      benefits: [
        "Experiência 100% sem anúncios (ad-free).",
        "Opções avançadas de personalização de perfil.",
        "Selo exclusivo (badge) de VIP nas resenhas.",
        "Estatísticas detalhadas de consumo de filmes.",
      ],
      buttonText: "Assinar Sommelier",
      buttonStyle: "btn-accent-vip",
      highlight: true,
      popular: true,
    },
    {
      id: "ionista",
      name: "Acionista de Hollywood",
      price: "R$ 109,90",
      period: "/ mês",
      description: "Para o cinéfilo que investe pesado no hobby e quer sua caixa de dividendos todo mês.",
      benefits: [
        "Todos os benefícios do plano Sommelier.",
        "Envio mensal de uma \"Mystery Box\" física para sua casa.",
        "Itens colecionáveis e produtos licenciados de cultura pop.",
        "Suporte prioritário na plataforma.",
      ],
      buttonText: "Virar Acionista",
      buttonStyle: "btn-gold-vip",
      highlight: false,
      popular: false,
      premium: true,
    },
  ];

  const handleSubscribeClick = (planId: string) => {
    if (planId === "pipoca") {
      alert("Você escolheu continuar no plano gratuito!");
      return;
    }
    setSelectedPlan(planId);
    setPaymentSuccess(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPayment(true);
    setTimeout(() => {
      setLoadingPayment(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const activePlanDetails = plans.find((p) => p.id === selectedPlan);

  return (
    <div style={{ minHeight: "100vh", paddingTop: 120, paddingBottom: 100, background: "radial-gradient(circle at top, #14141e 0%, #0a0a0f 70%)" }}>
      <div className="container">
        {/* Header Chamativo */}
        <div style={{ textAlign: "center", marginBottom: 60, animation: "fadeInUp 0.8s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232, 180, 75, 0.1)", border: "1px solid rgba(232, 180, 75, 0.25)", padding: "6px 16px", borderRadius: 100, marginBottom: 20 }}>
            <Crown size={15} color="var(--accent)" />
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Área VIP CineVerse</span>
          </div>
          <h1 className="font-display" style={{ fontSize: "2.75rem", fontWeight: 900, color: "#fff", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Eleve sua Experiência <span style={{ background: "linear-gradient(90deg, #e8b44b, #f5d07a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Cinefíla</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Apoie nossa plataforma independente, remova anúncios de vez, ganhe badges exclusivos e garanta colecionáveis físicos na sua porta todo mês!
          </p>
        </div>

        {/* Grid de Planos */}
        <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 32, maxWidth: 1100, margin: "0 auto", alignItems: "stretch" }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.popular ? "popular-card" : ""} ${plan.premium ? "premium-card" : ""}`}
              style={{
                background: "linear-gradient(135deg, rgba(20, 20, 28, 0.6) 0%, rgba(10, 10, 15, 0.8) 100%)",
                border: plan.popular 
                  ? "2px solid var(--accent)" 
                  : plan.premium 
                    ? "2px solid #dfac40" 
                    : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 24,
                padding: "40px 32px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: plan.popular 
                  ? "0 20px 40px rgba(232, 180, 75, 0.08)" 
                  : plan.premium 
                    ? "0 20px 40px rgba(223, 172, 64, 0.08)" 
                    : "0 10px 30px rgba(0, 0, 0, 0.3)",
              }}
            >
              {plan.popular && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(95deg, #e8b44b, #f5d07a)", color: "#0a0a0f", padding: "4px 16px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", boxShadow: "0 4px 12px rgba(232,180,75,0.3)" }}>
                  Mais Popular
                </div>
              )}
              {plan.premium && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(95deg, #dfac40, #cfa03b)", color: "#fff", padding: "4px 16px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", boxShadow: "0 4px 12px rgba(223,172,64,0.3)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Crown size={12} /> Colecionador
                </div>
              )}

              {/* Título do Plano */}
              <div style={{ marginBottom: 24 }}>
                <h3 className="font-display" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>{plan.name}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", minHeight: 42, lineHeight: 1.4, margin: 0 }}>{plan.description}</p>
              </div>

              {/* Preço */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 32 }}>
                <span style={{ fontSize: "2.75rem", fontWeight: 900, color: plan.premium ? "#dfac40" : "#fff", letterSpacing: "-0.03em" }}>{plan.price}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{plan.period}</span>
              </div>

              {/* Divisor */}
              <div style={{ height: 1, background: "rgba(255, 255, 255, 0.08)", marginBottom: 32 }} />

              {/* Benefícios */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", display: "flex", flexDirection: "column", gap: 16, flexGrow: 1 }}>
                {plan.benefits.map((benefit, index) => (
                  <li key={index} style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.4 }}>
                    <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: plan.premium ? "rgba(223, 172, 64, 0.15)" : plan.popular ? "rgba(232, 180, 75, 0.15)" : "rgba(255, 255, 255, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                      <Check size={12} color={plan.premium ? "#dfac40" : plan.popular ? "var(--accent)" : "rgba(255,255,255,0.4)"} style={{ margin: "auto" }} />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Botão de Assinatura */}
              <button
                className={`plan-btn ${plan.buttonStyle}`}
                onClick={() => handleSubscribeClick(plan.id)}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 14,
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {plan.premium && <Crown size={16} />}
                {plan.popular && <Sparkles size={16} />}
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Simples */}
        <div style={{ maxWidth: 800, margin: "100px auto 0", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 60 }}>
          <h2 className="font-display" style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: 32, textAlign: "center" }}>Dúvidas Frequentes</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
            <div>
              <h4 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>Como funciona o envio da Mystery Box?</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>
                Para os assinantes do plano Acionista de Hollywood, o envio é feito mensalmente para o endereço cadastrado. O frete é grátis para todo o Brasil. Os colecionáveis variam a cada mês e incluem pôsteres, action figures colecionáveis, chaveiros e outros produtos licenciados de grandes produções.
              </p>
            </div>
            <div>
              <h4 style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>Posso cancelar ou alterar meu plano quando quiser?</h4>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 }}>
                Sim! As assinaturas não possuem fidelidade. Você pode fazer o upgrade, downgrade ou cancelamento diretamente no painel do seu perfil com apenas um clique, sem burocracias.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Simulação de Checkout */}
      {selectedPlan && activePlanDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          {/* Overlay escuro */}
          <div
            onClick={() => setSelectedPlan(null)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(6, 6, 10, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />

          {/* Card da Modal */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              maxWidth: 440,
              background: "linear-gradient(135deg, rgba(18, 18, 26, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 24,
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              padding: "36px 32px",
            }}
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setSelectedPlan(null)}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>

            {/* Sucesso do Pagamento */}
            {paymentSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <ShieldCheck size={32} color="#4ade80" />
                </div>
                <h3 className="font-display" style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: 12 }}>Assinatura Confirmada!</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 28 }}>
                  Parabéns! Você agora é oficialmente um <strong>{activePlanDetails.name}</strong> da nossa comunidade. Seus benefícios VIP já estão ativos.
                </p>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", borderRadius: 12, cursor: "pointer", fontWeight: 700 }}
                >
                  Começar a Usar
                </button>
              </div>
            ) : (
              <div>
                {/* Cabeçalho Modal */}
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: activePlanDetails.premium ? "#dfac40" : "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Você escolheu
                  </span>
                  <h3 className="font-display" style={{ fontSize: "1.375rem", fontWeight: 800, color: "#fff", margin: "4px 0 6px 0" }}>
                    {activePlanDetails.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: "1.75rem", fontWeight: 900, color: "#fff" }}>{activePlanDetails.price}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>{activePlanDetails.period}</span>
                  </div>
                </div>

                {/* Formulário de Cartão Simulado */}
                <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Número do Cartão</label>
                    <div style={{ position: "relative" }}>
                      <CreditCard size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                      <input
                        type="text"
                        required
                        placeholder="4000 1234 5678 9010"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="input"
                        style={{ paddingLeft: 38 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Nome no Cartão</label>
                    <input
                      type="text"
                      required
                      placeholder="NOME COMPLETO"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="input"
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Validade</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>CVC</label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingPayment}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 12,
                      fontSize: "0.9375rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: activePlanDetails.premium ? "linear-gradient(90deg, #dfac40, #cfa03b)" : "var(--accent)",
                      border: "none",
                      color: activePlanDetails.premium ? "#fff" : "#0a0a0f",
                    }}
                  >
                    {loadingPayment ? (
                      <span>Processando Assinatura...</span>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Confirmar Assinatura</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Nota do ambiente de teste */}
                <div style={{ display: "flex", gap: 8, marginTop: 16, background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Flame size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.3 }}>
                    Este é um ambiente simulado para demonstração acadêmica do TCC. Nenhum valor monetário real será cobrado de seu cartão.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estilos e Animações customizadas com suporte a React 19 */}
      <style precedence="default" href="vip-page-styles">{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .plan-card:hover {
          transform: translateY(-8px);
          background: linear-gradient(135deg, rgba(28, 28, 38, 0.7) 0%, rgba(14, 14, 20, 0.9) 100%) !important;
        }

        .popular-card:hover {
          box-shadow: 0 30px 60px rgba(232, 180, 75, 0.18) !important;
          border-color: #f5d07a !important;
        }

        .premium-card:hover {
          box-shadow: 0 30px 60px rgba(223, 172, 64, 0.18) !important;
          border-color: #ffd875 !important;
        }

        /* Botão Pipoca - Fantasma/Secundário */
        .btn-ghost-vip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          color: rgba(255, 255, 255, 0.8);
        }
        .btn-ghost-vip:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        /* Botão Sommelier - Principal */
        .btn-accent-vip {
          background: var(--accent);
          color: #0a0a0f;
        }
        .btn-accent-vip:hover {
          background: #f5d07a;
          box-shadow: 0 4px 15px rgba(232, 180, 75, 0.3);
          transform: scale(1.02);
        }

        /* Botão Acionista - Premium Dourado */
        .btn-gold-vip {
          background: linear-gradient(90deg, #dfac40, #cfa03b);
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .btn-gold-vip:hover {
          background: linear-gradient(90deg, #ffd875, #dfac40);
          box-shadow: 0 4px 20px rgba(223, 172, 64, 0.4);
          transform: scale(1.02);
        }
        .btn-gold-vip::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: rgba(255, 255, 255, 0.15);
          transform: rotate(30deg);
          transition: none;
          animation: gold-shimmer 4s infinite linear;
        }

        @keyframes gold-shimmer {
          0% { left: -30%; }
          30% { left: 130%; }
          100% { left: 130%; }
        }

        @media (max-width: 640px) {
          .plans-grid {
            grid-template-columns: 1fr !important;
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
}
