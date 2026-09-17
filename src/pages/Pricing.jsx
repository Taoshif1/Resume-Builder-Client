import { useState } from "react";
import { useNavigate } from "react-router";
import { PLANS, PUBLIC_PLAN_FEATURES } from "../product/plans";

const cards = [
  {
    id: "free",
    cta: "Start Free",
    className: "bg-[#EFECE3] text-black",
  },
  {
    id: "pro",
    cta: "Request Pro access",
    badge: "Full product",
    className: "bg-[#4A70A9] text-white",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 sm:px-6 bg-[#EFECE3]/30" aria-label="Pricing">
      <header className="text-center max-w-2xl mx-auto mb-10 text-black">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter">
          Simple, transparent <span className="glow">pricing</span>
        </h1>
        <p className="mt-5 text-gray-600">
          Free covers the core resume workflow. Pro adds higher limits, all
          templates, history, job targeting and optional configured writing
          assistance.
        </p>
        <label className="inline-flex flex-wrap justify-center items-center gap-3 mt-6 font-bold">
          Monthly
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={yearly}
            onChange={(event) => setYearly(event.target.checked)}
          />
          Yearly
          <span className="badge badge-success">2 months included</span>
        </label>
        <p className="mt-4 text-sm text-gray-600">
          Online checkout is not enabled yet. Pro access is currently assigned
          by the Owner after a request.
        </p>
      </header>

      <section
        className="grid grid-cols-1 min-w-0 max-w-4xl mx-auto gap-6 md:grid-cols-2"
        aria-label="PersonaCV plans"
      >
        {cards.map((card) => {
          const plan = PLANS[card.id];
          const price = plan.price[yearly ? "yearly" : "monthly"];
          return (
            <article
              key={card.id}
              className={
                "relative min-w-0 rounded-[2rem] p-5 sm:p-8 shadow-xl flex flex-col " +
                card.className
              }
            >
              {card.badge && (
                <span className="absolute -top-3 left-8 rounded-full bg-yellow-300 text-black px-3 py-1 text-xs font-black uppercase">
                  {card.badge}
                </span>
              )}
              <h2 className="text-2xl font-black">{plan.label}</h2>
              <p className="mt-4 text-4xl font-black">
                ${price}
                <span className="text-base font-medium opacity-70">
                  /{yearly ? "yr" : "mo"}
                </span>
              </p>
              {yearly && price > 0 && (
                <p className="text-sm mt-1 opacity-80">Planned annual price</p>
              )}
              <ul className="mt-7 space-y-3 flex-1">
                {PUBLIC_PLAN_FEATURES[card.id].map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <button
                className={
                  "mt-8 w-full rounded-2xl py-4 font-black " +
                  (card.id === "free"
                    ? "bg-black text-white"
                    : "bg-white text-black")
                }
                onClick={() =>
                  navigate(
                    card.id === "free"
                      ? "/get-started/register"
                      : "/dashboard/settings",
                  )
                }
              >
                {card.cta}
              </button>
            </article>
          );
        })}
      </section>
    </section>
  );
}
