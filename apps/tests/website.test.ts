import { describe, expect, it } from "bun:test";
import axios from "axios";
import { AxiosError } from "axios";

const BASE_URL = "http://localhost:8000";

// Test suite for website creation and status retrieval
describe("Website gets created", () => {
  it("Website not created if url is not present", async () => {
    try {
      await axios.post(`${BASE_URL}/website`, {});
      expect(false, "Website should not be created without URL");
    } catch (error) {
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error", "URL is required");
      } else {
        throw error;
      }
    }
  });

  it("Website created successfully with valid URL", async () => {
    const response = await axios.post(`${BASE_URL}/website`, {
      url: "https://google.com",
    });
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty("data");
  });
});
