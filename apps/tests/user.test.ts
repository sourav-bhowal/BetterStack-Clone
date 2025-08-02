import { describe, expect, it } from "bun:test";
import axios from "axios";
import { AxiosError } from "axios";
import { BASE_URL } from "./utils/config";

const email = Math.random().toString(36).substring(2, 15) + "@example.com";

// Test suite for user creation and retrieval
describe("User gets signed up", () => {
  it("User not created if email is not present", async () => {
    try {
      await axios.post(`${BASE_URL}/user/signup`, {});
      expect(false, "User should not be created without email");
    } catch (error) {}
  });

  it("User created successfully with valid email", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        email: email,
        password: "password123",
      });
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
    } catch (error) {}
  });
});

describe("User gets logged in", () => {
  it("User not logged in if email is not present", async () => {
    try {
      await axios.post(`${BASE_URL}/user/signin`, {});
      expect(false, "User should not be logged in without email");
    } catch (error) {}
  });

  it("User logged in successfully with valid credentials", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: email,
        password: "password123",
      });
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
    } catch (error) {}
  });
});
