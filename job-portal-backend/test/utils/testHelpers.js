import request from "supertest";
import app from "../../app.js";

export const createAndLoginUser = async ({
  name = "Test User",
  email = "test@example.com",
  password = "Password123!",
  role = "job_seeker",
} = {}) => {

  await request(app)
    .post("/api/users/register")
    .send({
      name,
      email,
      password,
      role,
    });

  const loginResponse = await request(app)
    .post("/api/users/login")
    .send({
      email,
      password,
    });

  return {
    response: loginResponse,
    cookies: loginResponse.headers["set-cookie"],
  };
};