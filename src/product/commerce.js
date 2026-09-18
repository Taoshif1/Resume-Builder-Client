export const PAYMENT_METHODS = [
  { id: "bkash", label: "bKash" },
  { id: "nagad", label: "Nagad" },
  { id: "rocket", label: "Rocket" },
];

export const DEFAULT_COMMERCE = {
  proMonthlyBdt: 499,
  proYearlyBdt: 4990,
  documentPackSize: 5,
  documentPackBdt: 100,
  paymentMethods: {
    bkash: { enabled: false, number: "" },
    nagad: { enabled: false, number: "" },
    rocket: { enabled: false, number: "" },
  },
};

const boundedInt = (value, fallback, min, max) => {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= min && number <= max
    ? number
    : fallback;
};

export function normalizeCommerce(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const methods =
    source.paymentMethods && typeof source.paymentMethods === "object"
      ? source.paymentMethods
      : {};
  return {
    proMonthlyBdt: boundedInt(
      source.proMonthlyBdt,
      DEFAULT_COMMERCE.proMonthlyBdt,
      1,
      100000,
    ),
    proYearlyBdt: boundedInt(
      source.proYearlyBdt,
      DEFAULT_COMMERCE.proYearlyBdt,
      1,
      1000000,
    ),
    documentPackSize: boundedInt(
      source.documentPackSize,
      DEFAULT_COMMERCE.documentPackSize,
      1,
      100,
    ),
    documentPackBdt: boundedInt(
      source.documentPackBdt,
      DEFAULT_COMMERCE.documentPackBdt,
      1,
      100000,
    ),
    paymentMethods: Object.fromEntries(
      PAYMENT_METHODS.map(({ id }) => {
        const method =
          methods[id] && typeof methods[id] === "object" ? methods[id] : {};
        return [
          id,
          {
            enabled: Boolean(method.enabled),
            number: String(method.number || "").trim().slice(0, 50),
          },
        ];
      }),
    ),
  };
}

export function enabledPaymentMethods(commerce) {
  const normalized = normalizeCommerce(commerce);
  return PAYMENT_METHODS.filter(
    ({ id }) =>
      normalized.paymentMethods[id].enabled &&
      normalized.paymentMethods[id].number,
  ).map(({ id, label }) => ({
    id,
    label,
    number: normalized.paymentMethods[id].number,
  }));
}
