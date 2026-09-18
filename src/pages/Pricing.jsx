import { useState } from "react";
import { Link } from "react-router";
import { PLANS, PUBLIC_PLAN_FEATURES } from "../product/plans";
export default function Pricing({ headingLevel = 1 }) {
  const [yearly, setYearly] = useState(false);
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section
      className="pcv-pricing pcv-home-section"
      aria-label="Pricing"
      data-billing={yearly ? "yearly" : "monthly"}
    >
      <header>
        <p className="pcv-public-eyebrow">A PLAN FOR YOUR NEXT STEP</p>
        <Heading>
          Start with the essentials.
          <br />
          Grow when you need more.
        </Heading>
        <p>
          Free covers the core Resume and CV workflow. Pro adds more room, all
          templates, history and job targeting.
        </p>
      </header>
      <div
        className="pcv-billing-toggle"
        role="group"
        aria-label="Billing period"
      >
        <button aria-pressed={!yearly} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button aria-pressed={yearly} onClick={() => setYearly(true)}>
          Yearly <span>2 months included</span>
        </button>
      </div>
      <p className="pcv-checkout-note">
        Online checkout is not enabled yet. Pro access is assigned by the Owner
        after a request.
      </p>
      <div className="pcv-pricing-grid">
        {["free", "pro"].map((id) => {
          const plan = PLANS[id];
          return (
            <article className={`pcv-plan-card pcv-plan-${id}`} key={id}>
              <div className="pcv-plan-heading">
                <h2>{plan.label}</h2>
                <span>
                  {id === "pro" ? "The complete toolkit" : "A solid start"}
                </span>
              </div>
              <p className="pcv-plan-price" aria-live="polite">
                <strong>${plan.price[yearly ? "yearly" : "monthly"]}</strong>
                <span>/{yearly ? "year" : "month"}</span>
              </p>
              <p className="pcv-plan-price-note">
                {id === "free"
                  ? "Core tools, no payment required"
                  : yearly
                    ? "Planned annual price · $5/month equivalent"
                    : "Planned monthly price"}
              </p>
              <ul>
                {PUBLIC_PLAN_FEATURES[id].map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className="pcv-plan-action"
                to={
                  id === "free"
                    ? "/get-started/register"
                    : "/dashboard/settings"
                }
              >
                {id === "free" ? "Start Free" : "Request Pro access"}
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
