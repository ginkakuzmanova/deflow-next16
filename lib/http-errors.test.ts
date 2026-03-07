import { describe, expect, it } from "vitest";

import { ForbiddenError, NotFoundError, RequestError, UnauthorizedError, ValidationError } from "./http-errors";

describe("http-errors", () => {
  it("creates RequestError with status and message", () => {
    const error = new RequestError(418, "teapot");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("RequestError");
    expect(error.statusCode).toBe(418);
    expect(error.message).toBe("teapot");
  });

  it("formats field errors for required and non-required fields", () => {
    const result = ValidationError.formatFieldErrors({
      email: ["Required"],
      password: ["Too short", "Must contain special char"],
    });

    expect(result).toBe("Email is required, Too short and Must contain special char");
  });

  it("creates ValidationError with status code 400 and details", () => {
    const fieldErrors = { name: ["Required"] };
    const error = new ValidationError(fieldErrors);

    expect(error.name).toBe("ValidationError");
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual(fieldErrors);
    expect(error.message).toBe("Name is required");
  });

  it("creates specialized errors with default status codes", () => {
    const notFound = new NotFoundError("Question");
    const forbidden = new ForbiddenError();
    const unauthorized = new UnauthorizedError();

    expect(notFound.statusCode).toBe(404);
    expect(notFound.message).toBe("Question not found");
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.message).toBe("Forbidden");
    expect(unauthorized.statusCode).toBe(401);
    expect(unauthorized.message).toBe("Unauthorized");
  });
});
