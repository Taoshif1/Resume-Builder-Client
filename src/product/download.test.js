import test from "node:test";
import assert from "node:assert/strict";
import { downloadBlob } from "./download.js";

test("empty or missing downloads fail before creating an object URL", (t) => {
  const create = t.mock.method(URL, "createObjectURL");
  for (const blob of [undefined, null, new Blob([])])
    assert.throws(() => downloadBlob(blob, "resume.pdf"), /download is empty/);
  assert.equal(create.mock.callCount(), 0);
});

for (const fail of [false, true]) {
  test(`download attaches the link and cleans up after ${fail ? "failure" : "success"}`, (t) => {
    const events = [];
    const link = {
      style: {},
      click() {
        assert.equal(this.isConnected, true);
        assert.equal(this.href, "blob:test");
        assert.equal(this.download, "Ada-Resume.pdf");
        assert.equal(this.style.display, "none");
        events.push("click");
        if (fail) throw new Error("Browser failure");
      },
      remove() { this.isConnected = false; events.push("remove"); },
    };
    const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
    Object.defineProperty(globalThis, "document", { configurable: true, value: {
      createElement: () => link,
      body: { appendChild(element) { element.isConnected = true; events.push("attach"); } },
    } });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, "document", previous);
      else delete globalThis.document;
    });
    t.mock.method(URL, "createObjectURL", () => "blob:test");
    const revoke = t.mock.method(URL, "revokeObjectURL", () => {});
    let cleanup;
    t.mock.method(globalThis, "setTimeout", (fn, delay) => {
      assert.equal(delay, 1000);
      cleanup = fn;
    });
    const run = () => downloadBlob(new Blob(["%PDF-test"]), "Ada-Resume.pdf");
    if (fail) assert.throws(run, /Unable to start the download/);
    else run();
    assert.deepEqual(events, ["attach", "click", "remove"]);
    assert.equal(revoke.mock.callCount(), 0);
    cleanup();
    assert.deepEqual(revoke.mock.calls[0].arguments, ["blob:test"]);
  });
}
