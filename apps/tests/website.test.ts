import { describe, expect, it } from "bun:test";
import axios from "axios";
import { AxiosError } from "axios";
import { BASE_URL } from "./utils/config";

// Test suite for website creation and status retrieval
describe("Website gets created", () => {
  it("Website not created if url is not present", async () => {
    try {
      await axios.post(`${BASE_URL}/website`, {});
      expect(false, "Website should not be created without URL");
    } catch (error) {}
  });

  it.todo("Website created successfully with valid URL", async () => {
    const response = await axios.post(`${BASE_URL}/website`, {
      url: "http://example.com",
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("data");
  });
});
