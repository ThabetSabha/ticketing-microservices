import request from "supertest";
import { app } from "../app";

/**
 *
 * @param email Email to issue the cookie for
 * @param password Password to use to issue the cookie
 * @returns an array containing the auth cookie.
 */
export const getAuthCookiesForTest = async (
  email: string,
  password: string
): Promise<string[]> => {
  process.env.JWT_KEY = "WHATT";
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password,
    })
    .expect(201);

  return response.get("Set-Cookie");
};
