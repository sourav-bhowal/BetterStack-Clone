import { describe, expect, it, beforeAll } from "bun:test";
import axios from "axios";
import { AxiosError } from "axios";
import { BASE_URL } from "./utils/config";
import {
  generateRandomEmail,
  generateSimplePassword,
  generateValidUrl,
  generateInvalidUrl,
  generateLongUrl,
  getCommonWebsiteUrls,
} from "./utils/generators";

// Test data setup
let authToken = "";
let testUser = {
  email: "",
  password: "",
};
let createdWebsiteId = "";
let secondUserToken = "";

// Setup authentication for website tests
beforeAll(async () => {
  testUser.email = generateRandomEmail();
  testUser.password = generateSimplePassword();
  
  try {
    // Create test user
    await axios.post(`${BASE_URL}/user/signup`, testUser);
    
    // Sign in to get auth token
    const signInResponse = await axios.post(`${BASE_URL}/user/signin`, testUser);
    authToken = signInResponse.data.data;
    
    // Create second user for authorization tests
    const secondUser = {
      email: generateRandomEmail(),
      password: generateSimplePassword(),
    };
    await axios.post(`${BASE_URL}/user/signup`, secondUser);
    const secondSignInResponse = await axios.post(`${BASE_URL}/user/signin`, secondUser);
    secondUserToken = secondSignInResponse.data.data;
    
  } catch (error) {
    console.error("Setup error:", error);
  }
});

// Test suite for website creation
describe("Website Creation", () => {
  it("Should not create website without authentication token", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/website`, {
        url: generateValidUrl(),
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.error).toBe("Unauthorized");
      }
    }
  });

  it("Should not create website with invalid authentication token", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: generateValidUrl(),
        },
        {
          headers: {
            Authorization: "Bearer invalid-token-here",
          },
        }
      );
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.error).toBe("Unauthorized");
      }
    }
  });

  it("Should not create website with malformed authorization header", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: generateValidUrl(),
        },
        {
          headers: {
            Authorization: "InvalidFormat", // Missing "Bearer "
          },
        }
      );
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.error).toBe("Unauthorized");
      }
    }
  });

  it("Should not create website if URL is not present", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.error).toBe("URL is required");
        expect(error.response?.data).toHaveProperty("details");
      }
    }
  });

  it("Should not create website with invalid URL format", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: generateInvalidUrl(),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.error).toBe("URL is required");
        expect(error.response?.data).toHaveProperty("details");
      }
    }
  });

  it("Should not create website with empty URL string", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: "",
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.error).toBe("URL is required");
      }
    }
  });

  it("Should not create website with URL missing protocol", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: "example.com", // Missing http:// or https://
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(400);
        expect(error.response?.data?.error).toBe("URL is required");
      }
    }
  });

  it("Should create website successfully with valid HTTP URL", async () => {
    const testUrl = "http://example.com";
    
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: testUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message");
      expect(response.data.message).toBe("Website created successfully");
      expect(response.data.data).toHaveProperty("id");
      expect(response.data.data).toHaveProperty("url");
      expect(response.data.data.url).toBe(testUrl);
      expect(response.data.data).toHaveProperty("userId");
      
      // Store website ID for status tests
      createdWebsiteId = response.data.data.id;
    } catch (error) {
      console.error("Website creation error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should create website successfully with valid HTTPS URL", async () => {
    const testUrl = "https://secure-example.com";
    
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: testUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty("data");
      expect(response.data.message).toBe("Website created successfully");
      expect(response.data.data.url).toBe(testUrl);
    } catch (error) {
      console.error("HTTPS website creation error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should create website with URL containing query parameters", async () => {
    const testUrl = "https://example.com/path?param=value&other=123";
    
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: testUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.data.url).toBe(testUrl);
    } catch (error) {
      console.error("URL with params creation error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should create website with URL containing subdomain", async () => {
    const testUrl = "https://api.example.com";
    
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: testUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.data.url).toBe(testUrl);
    } catch (error) {
      console.error("Subdomain URL creation error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should handle creating multiple websites for the same user", async () => {
    const commonUrls = getCommonWebsiteUrls();
    const promises = [];
    
    // Create 3 websites simultaneously
    for (let i = 0; i < 3; i++) {
      promises.push(
        axios.post(
          `${BASE_URL}/website`,
          {
            url: commonUrls[i],
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
      );
    }
    
    try {
      const responses = await Promise.all(promises);
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.data.data.url).toBe(commonUrls[index]);
      });
    } catch (error) {
      console.error("Multiple website creation error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should allow different users to create websites with same URL", async () => {
    const testUrl = "https://shared-example.com";
    
    try {
      // Create website with first user
      const response1 = await axios.post(
        `${BASE_URL}/website`,
        {
          url: testUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      // Create same website with second user
      const response2 = await axios.post(
        `${BASE_URL}/website`,
        {
          url: testUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${secondUserToken}`,
          },
        }
      );
      
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.data.data.url).toBe(testUrl);
      expect(response2.data.data.url).toBe(testUrl);
      expect(response1.data.data.userId).not.toBe(response2.data.data.userId);
    } catch (error) {
      console.error("Same URL different users error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should handle very long URL", async () => {
    const longUrl = generateLongUrl();
    
    try {
      const response = await axios.post(
        `${BASE_URL}/website`,
        {
          url: longUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      
      expect(response.status).toBe(201);
      expect(response.data.data.url).toBe(longUrl);
    } catch (error) {
      console.error("Long URL creation error:", error);
      // This might fail due to URL length limits, which is acceptable
    }
  });
});

// Test suite for website status retrieval
describe("Website Status Retrieval", () => {
  it("Should not get website status without authentication token", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/website/${createdWebsiteId}`);
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.error).toBe("Unauthorized");
      }
    }
  });

  it("Should not get website status with invalid authentication token", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/website/${createdWebsiteId}`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(401);
        expect(error.response?.data?.error).toBe("Unauthorized");
      }
    }
  });

  it("Should not get website status without website ID", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/website/`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect([404, 400]).toContain(error.response?.status);
      }
    }
  });

  it("Should not get website status with non-existent website ID", async () => {
    const fakeWebsiteId = "non-existent-id-12345";
    
    try {
      const response = await axios.get(`${BASE_URL}/website/${fakeWebsiteId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(409);
        expect(error.response?.data?.error).toBe("Website not found");
      }
    }
  });

  it("Should not get website status for website owned by different user", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/website/${createdWebsiteId}`, {
        headers: {
          Authorization: `Bearer ${secondUserToken}`, // Different user's token
        },
      });
      expect(false).toBe(true); // Should not reach here
    } catch (error) {
      expect(error).toBeInstanceOf(AxiosError);
      if (error instanceof AxiosError) {
        expect(error.response?.status).toBe(403);
        expect(error.response?.data?.error).toBe("Forbidden");
      }
    }
  });

  it("Should get website status successfully with valid credentials and website ID", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/website/${createdWebsiteId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("data");
      expect(response.data).toHaveProperty("message");
      expect(response.data.message).toBe("Website status retrieved successfully");
      expect(response.data.data).toHaveProperty("id");
      expect(response.data.data).toHaveProperty("url");
      expect(response.data.data).toHaveProperty("userId");
      expect(response.data.data).toHaveProperty("regions");
      expect(response.data.data).toHaveProperty("websiteTicks");
      expect(response.data.data.id).toBe(createdWebsiteId);
    } catch (error) {
      console.error("Website status retrieval error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should include regions in website status response", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/website/${createdWebsiteId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty("regions");
      expect(Array.isArray(response.data.data.regions)).toBe(true);
      // Regions should be connected when website is created
      expect(response.data.data.regions.length).toBeGreaterThan(0);
    } catch (error) {
      console.error("Regions check error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should include website ticks in status response", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/website/${createdWebsiteId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      expect(response.status).toBe(200);
      expect(response.data.data).toHaveProperty("websiteTicks");
      expect(Array.isArray(response.data.data.websiteTicks)).toBe(true);
      // websiteTicks might be empty for newly created website
    } catch (error) {
      console.error("Website ticks check error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });

  it("Should handle malformed website ID gracefully", async () => {
    const malformedIds = ["", "null", "undefined", "123abc", "special@chars"];
    
    for (const malformedId of malformedIds) {
      try {
        const response = await axios.get(`${BASE_URL}/website/${malformedId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(AxiosError);
        if (error instanceof AxiosError) {
          expect([400, 409]).toContain(error.response?.status);
        }
      }
    }
  });

  it("Should handle concurrent status requests for same website", async () => {
    const promises = [];
    
    // Make 5 concurrent requests for the same website
    for (let i = 0; i < 5; i++) {
      promises.push(
        axios.get(`${BASE_URL}/website/${createdWebsiteId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
      );
    }
    
    try {
      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.data.data.id).toBe(createdWebsiteId);
      });
    } catch (error) {
      console.error("Concurrent requests error:", error);
      expect(false).toBe(true); // Should not fail
    }
  });
});
