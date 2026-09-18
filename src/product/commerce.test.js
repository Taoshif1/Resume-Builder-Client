import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_COMMERCE,
  enabledPaymentMethods,
  normalizeCommerce,
} from "./commerce.js";

test("commerce defaults are bounded and payment methods expose only enabled numbers", () => {
  const normalized = normalizeCommerce({
    proMonthlyBdt: -1,
    proYearlyBdt: "not-a-number",
    documentPackSize: 5,
    documentPackBdt: 100,
    paymentMethods: {
      bkash: { enabled: true, number: " 01700000000 " },
      nagad: { enabled: true, number: "" },
      rocket: { enabled: false, number: "01800000000" },
    },
  });
  assert.equal(normalized.proMonthlyBdt, DEFAULT_COMMERCE.proMonthlyBdt);
  assert.equal(normalized.proYearlyBdt, DEFAULT_COMMERCE.proYearlyBdt);
  assert.equal(normalized.documentPackSize, 5);
  assert.equal(normalized.documentPackBdt, 100);
  assert.deepEqual(enabledPaymentMethods(normalized), [
    { id: "bkash", label: "bKash", number: "01700000000" },
  ]);
});
