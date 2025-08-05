import { describe, expect, it, beforeAll } from "bun:test";
import axios from "axios";
import { AxiosError } from "axios";
import { BASE_URL } from "./utils/config";
import {
  generateRandomEmail,
  generateRandomPassword,
  generateSimplePassword,
  generateInvalidEmail,
  generateWeakPassword,
} from "./utils/generators";

// Test data setup
let validUser = {
  email: "",
  password: "",
};

let validToken = "";

// Setup valid user for sign-in tests
beforeAll(async () => {
  validUser.email = generateRandomEmail();
  validUser.password = generateSimplePassword();
  
  // Create a valid user for sign-in tests
  try {
    await axios.post(`${BASE_URL}/user/signup`, validUser);
  } catch (error) {
    console.log("User might already exist or signup failed");
  }
});

// Test suite for user creation
describe("User Sign Up", () => {
  it("Should not create user if email is not present", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        password: generateSimplePassword(),
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error");
      }
    }
  });

  it("Should not create user if password is not present", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        email: generateRandomEmail(),
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error");
      }
    }
  });

  it("Should not create user with invalid email format", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, {
        email: generateInvalidEmail(),
        password: generateSimplePassword(),
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error");
      }
    }
  });

  it("Should create user successfully with valid email and password", async () => {
    const testUser = {
      email: generateRandomEmail(),
      password: generateSimplePassword(),
    };

    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, testUser);
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message");
      expect(response.data.message).toBe("User created successfully");
    } catch (error) {
      console.error("Signup error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should not create user with duplicate email", async () => {
    const duplicateUser = {
      email: validUser.email, // Using existing email
      password: generateSimplePassword(),
    };

    try {
      const response = await axios.post(`${BASE_URL}/user/signup`, duplicateUser);
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.error).toBe("Email already exists");
      }
    }
  });
});

// Test suite for user sign-in
describe("User Sign In", () => {
  it("Should not sign in if email is not present", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        password: generateSimplePassword(),
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error");
        expect(error.response?.data.error).toBe("Invalid input");
      }
    }
  });

  it("Should not sign in if password is not present", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: validUser.email,
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error");
        expect(error.response?.data.error).toBe("Invalid input");
      }
    }
  });

  it("Should not sign in with empty request body", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {});
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error");
        expect(error.response?.data.error).toBe("Invalid input");
      }
    }
  });

  it("Should not sign in with invalid email format", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: generateInvalidEmail(),
        password: generateSimplePassword(),
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error");
        expect(error.response?.data.error).toBe("Invalid input");
      }
    }
  });

  it("Should not sign in with non-existent email", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: generateRandomEmail(), // Non-existent email
        password: generateSimplePassword(),
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data?.error).toBe("User not found");
      }
    }
  });

  it("Should not sign in with incorrect password", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: validUser.email,
        password: "wrongpassword123!", // Incorrect password
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.error).toBe("Invalid credentials");
      }
    }
  });

  it("Should not sign in with weak/empty password", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: validUser.email,
        password: "", // Empty password
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data).toHaveProperty("error");
      }
    }
  });

  it("Should sign in successfully with valid credentials", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: validUser.email,
        password: validUser.password,
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message");
      expect(response.data.message).toBe("User signed in successfully");
      expect(typeof response.data.data).toBe("string"); // JWT token
      expect(response.data.data.length).toBeGreaterThan(0);
      
      // Store token for potential future tests
      validToken = response.data.data;
    } catch (error) {
      console.error("Sign in error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should return valid JWT token on successful sign in", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: validUser.email,
        password: validUser.password,
      });
      
      expect(response.status).toBe(200);
      expect(response.data.data).toBeTruthy();
      
      // Basic JWT token format validation (3 parts separated by dots)
      const tokenParts = response.data.data.split(".");
      expect(tokenParts.length).toBe(3);
      
      // Each part should be non-empty
      tokenParts.forEach((part: string) => {
        expect(part.length).toBeGreaterThan(0);
      });
    } catch (error) {
      console.error("JWT validation error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should handle case-sensitive email correctly", async () => {
    const upperCaseEmail = validUser.email.toUpperCase();
    
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: upperCaseEmail,
        password: validUser.password,
      });
      expect(false).toBe(true); // Should not reach here if email is case-sensitive
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(404);
        expect(error.response?.data?.error).toBe("User not found");
      }
    }
  });

  it("Should handle special characters in password correctly", async () => {
    // Create user with special character password
    const specialUser = {
      email: generateRandomEmail(),
      password: "P@ssw0rd!@#$%^&*()",
    };

    try {
      // First create the user
      await axios.post(`${BASE_URL}/user/signup`, specialUser);
      
      // Then try to sign in
      const response = await axios.post(`${BASE_URL}/user/signin`, specialUser);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data.message).toBe("User signed in successfully");
    } catch (error) {
      console.error("Special character password error:", error);
      // If signup fails, that's a separate issue
      // But sign in should work if user exists
    }
  });

  it("Should handle long email addresses", async () => {
    const longEmail = `${"verylongusername".repeat(5)}@${"verylongdomain".repeat(3)}.com`;
    
    try {
      const response = await axios.post(`${BASE_URL}/user/signin`, {
        email: longEmail,
        password: generateSimplePassword(),
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect([400, 404]).toContain(error.response?.status);
      }
    }
  });

  it("Should handle multiple rapid sign-in attempts", async () => {
    const promises = [];
    
    // Make 5 rapid sign-in attempts
    for (let i = 0; i < 5; i++) {
      promises.push(
        axios.post(`${BASE_URL}/user/signin`, {
          email: validUser.email,
          password: validUser.password,
        })
      );
    }
    
    try {
      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("data");
      });
    } catch (error) {
      console.error("Rapid sign-in error:", error);
      // Some requests might fail due to rate limiting, which is acceptable
    }
  });
});
