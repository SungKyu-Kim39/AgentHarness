import { test } from "node:test";
import assert from "node:assert/strict";
import { MessageDelivery } from "../distribution/ned/message-delivery";
test("shared engine and ACP text merge once across unequal Korean chunks, history reload and isolated sessions", () => {
  const d = new MessageDelivery();
  assert.equal(d.chunk("a", "m", "가나다", "event"), "가나다");
  assert.equal(d.chunk("a", "m", "가", "acp"), "");
  assert.equal(d.chunk("a", "m", "나다라", "acp"), "라");
  assert.equal(d.chunk("a", "m", "라", "event"), "");
  assert.equal(d.chunk("a", "m", "마", "event"), "마");
  assert.equal(d.chunk("b", "m", "가나다", "acp"), "가나다");
  d.ignore("a", "old");
  assert.equal(d.chunk("a", "old", "history", "acp"), "history");
  assert.equal(d.chunk("a", "old", "late", "event"), "");
  d.reset("a");
  assert.equal(d.chunk("a", "m", "가나다라마", "acp"), "가나다라마");
  assert.equal(d.chunk("b", "m", "가나다", "event"), "");
});
