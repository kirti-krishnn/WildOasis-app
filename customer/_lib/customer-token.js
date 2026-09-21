import { SignJWT } from "jose";

const secret = new TextEncoder().encode(
  process.env.CUSTOMER_AUTH_SECRET,
);

export async function createCustomerToken(email) {
  if (!process.env.CUSTOMER_AUTH_SECRET) {
    throw new Error("Customer authentication is not configured on the customer app.");
  }

  return new SignJWT({
    email,
    type: "customer",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret);
}