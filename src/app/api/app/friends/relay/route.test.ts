import { expect, it } from "vitest";
import { POST } from "./route";
it("retires the relay endpoint", async () => {
  const response = await POST();
  expect(response.status).toBe(410);
});
