import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../utils/validation";

describe("registerSchema", () => {
  it("acepta datos válidos", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "123456",
      name: "Test",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza un email inválido", () => {
    const result = registerSchema.safeParse({
      email: "no-es-un-email",
      password: "123456",
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza una contraseña muy corta", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "123",
      name: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("rechaza si falta la contraseña", () => {
    const result = loginSchema.safeParse({ email: "test@test.com", password: "" });
    expect(result.success).toBe(false);
  });
});
