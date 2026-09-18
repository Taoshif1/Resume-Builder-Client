import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_COMMERCE,
  enabledPaymentMethods,
  normalizeCommerce,
} from "./commerce.js";

test("legacy commerce settings migrate the old five-slot default to one slot", () => {
  const legacy = normalizeCommerce({
    proMonthlyBdt: 499,
    proYearlyBdt: 4990,
    documentPackSize: 5,
    documentPackBdt: 100,
  });
  assert.equal(legacy.version, DEFAULT_COMMERCE.version);
  assert.equal(legacy.documentPackSize, 1);
  assert.equal(legacy.documentPackBdt, 100);

  const current = normalizeCommerce({
    version: DEFAULT_COMMERCE.version,
    documentPackSize: 5,
    documentPackBdt: 400,
  });
  assert.equal(current.documentPackSize, 5);
  assert.equal(current.documentPackBdt, 400);
});

test("commerce defaults are bounded and payment methods expose only enabled numbers", () => {
  const normalized = normalizeCommerce({
    version: DEFAULT_COMMERCE.version,
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
