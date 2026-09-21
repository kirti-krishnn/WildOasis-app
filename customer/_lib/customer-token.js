import { SignJWT } from "jose";

const secret = new TextEncoder().encode(
  process.env.CUSTOMER_AUTH_SECRET,
);

export async function createCustomerToken(email) {
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