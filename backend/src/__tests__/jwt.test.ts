import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../utils/jwt";

// "Unitario" significa que probamos esta pieza de código sola, sin tocar
// la base de datos ni levantar el servidor. Por eso jwt.ts es un buen
// candidato: es lógica pura (firmar/verificar), fácil de aislar.

describe("jwt utils", () => {
  it("genera un token que se puede verificar y devuelve el mismo payload", () => {
    const token = signToken({ userId: "abc-123" });
    const payload = verifyToken(token);
    expect(payload.userId).toBe("abc-123");
  });

  it("tira un error si el token es inválido", () => {
    expect(() => verifyToken("esto-no-es-un-token-valido")).toThrow();
  });
});
