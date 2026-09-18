import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { PLANS, PUBLIC_PLAN_FEATURES } from "../product/plans";
import { DEFAULT_COMMERCE } from "../product/commerce";
import { AuthContext } from "../context/AuthContext";
export default function Pricing({ headingLevel = 1 }) {
  const [yearly, setYearly] = useState(false);
  const [commerce, setCommerce] = useState(DEFAULT_COMMERCE);
  const { user } = useContext(AuthContext);
  const Heading = headingLevel === 1 ? "h1" : "h2";
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public-config", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.commerce) setCommerce((current) => ({ ...current, ...data.commerce }));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const proDestination = `/dashboard/settings?purchase=pro&period=${yearly ? "yearly" : "monthly"}#payments`;
  const slotDestination = "/dashboard/settings?purchase=slots#payments";
  const authAwareLink = (destination) =>
    user
      ? { to: destination }
      : {
          to: "/get-started/register",
          state: { from: destination },
        };

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
        Bangladesh payments are handled manually through enabled bKash, Nagad or
        Rocket accounts. Access activates after the Owner verifies the transaction.
      </p>
      <div className="pcv-pricing-grid pcv-pricing-grid-three">
        {["free", "pro"].map((id) => {
          const plan = PLANS[id];
          return (
            <article
              className={`pcv-plan-card pcv-plan-${id} ${id === "pro" ? "pcv-plan-pro-card" : ""}`}
              key={id}
            >
              <div className="pcv-plan-heading">
                <h2>{plan.label}</h2>
                <span>
                  {id === "pro" ? "The complete toolkit" : "A solid start"}
                </span>
              </div>

              <p className="pcv-plan-price" aria-live="polite">
                <strong>${plan.price[yearly ? "yearly" : "monthly"]}</strong>
                <span className="pcv-plan-local-price">
                  · ৳
                  {(
                    id === "pro"
                      ? yearly
                        ? commerce.proYearlyBdt
                        : commerce.proMonthlyBdt
                      : 0
                  ).toLocaleString("en-BD")}
                </span>
                <span>/{yearly ? "year" : "month"}</span>
              </p>

              <p className="pcv-plan-price-note">
                {id === "free"
                  ? "Core tools, no payment required"
                  : yearly
                    ? "Bangladesh regional yearly price · 2 months included"
                    : "Bangladesh regional price shown in BDT"}
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
                {...(id === "free"
                  ? authAwareLink("/dashboard")
                  : authAwareLink(proDestination))}
              >
                {id === "free"
                  ? user
                    ? "Open dashboard"
                    : "Start Free"
                  : user
                    ? "Choose Pro"
                    : "Sign up for Pro"}
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          );
        })}

        <article className="pcv-plan-card pcv-plan-pack">
          <div className="pcv-plan-heading">
            <h2>Extra Slots</h2>
            <span>Pay only when you need more</span>
          </div>

          <p className="pcv-plan-price">
            <strong>
              ৳{commerce.documentPackBdt.toLocaleString("en-BD")}
            </strong>
            <span>
              /{commerce.documentPackSize}{" "}
              {commerce.documentPackSize === 1 ? "document" : "documents"}
            </span>
          </p>

          <p className="pcv-plan-price-note">
            Keep the Free plan and add more Resume/CV slots whenever you need them.
          </p>

          <ul>
            <li>
              <span aria-hidden="true">✓</span>
              {commerce.documentPackSize} extra Resume/CV{" "}
              {commerce.documentPackSize === 1 ? "slot" : "slots"}
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              Buy multiple packs by changing the quantity
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              No Pro subscription required
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              bKash / Nagad / Rocket when enabled by the Owner
            </li>
            <li>
              <span aria-hidden="true">✓</span>
              Activated after manual payment approval
            </li>
          </ul>

          <Link
            className="pcv-plan-action"
            {...authAwareLink(slotDestination)}
          >
            {user ? "Buy extra slots" : "Sign up to buy slots"}
            <span aria-hidden="true">↗</span>
          </Link>
        </article>
      </div>
    </section>
  );
}
