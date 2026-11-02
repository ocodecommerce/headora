import { storeForLocale } from "../../../lib/magento.js";
import { readCookie } from "../../../lib/cart.js";
import { NAME_COOKIE, TOKEN_COOKIE, clearSessionCookies, customerGql } from "../../../lib/customer.js";
import {
  ACCOUNT_QUERY, CHANGE_PASSWORD_MUTATION, CREATE_ADDRESS_MUTATION, DELETE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION, UPDATE_CUSTOMER_MUTATION,
} from "../../../graphql/account.js";

export const revalidate = 0;

const localeOf = (v: unknown) => (typeof v === "string" && /^[a-z]{2}(-[a-z0-9]{2,8})?$/i.test(v) ? v : undefined);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const signedOut = (req: Request) => {
  const out = Response.json({ ok: false, error: "LOGIN_REQUIRED" }, { status: 401 });
  for (const ck of clearSessionCookies(req)) out.headers.append("Set-Cookie", ck);
  return out;
};

// GET /api/account?locale=en -> profile, orders, addresses, favourites, countries (401 when signed out).
export async function GET(req: Request) {
  const token = readCookie(req, TOKEN_COOKIE);
  if (!token) return signedOut(req);
  const { store } = storeForLocale(localeOf(new URL(req.url).searchParams.get("locale")));
  try {
    const json = await customerGql(token, store, ACCOUNT_QUERY);
    if (json.authFail) return signedOut(req);
    if (!json.data?.customer) return Response.json({ ok: false, error: json.errors?.[0]?.message ?? "FAILED" }, { status: 502 });
    return Response.json({ ok: true, customer: json.data.customer, countries: json.data.countries ?? [] });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 502 });
  }
}

function addressInput(a: any) {
  const street = (Array.isArray(a?.street) ? a.street : [a?.street]).map((s: unknown) => str(s, 255)).filter(Boolean).slice(0, 3);
  const regionId = Number(a?.region_id);
  return {
    firstname: str(a?.firstname, 255), lastname: str(a?.lastname, 255), street, city: str(a?.city, 255),
    postcode: str(a?.postcode, 32), telephone: str(a?.telephone, 64), country_code: str(a?.country_code, 2).toUpperCase(),
    region: Number.isInteger(regionId) && regionId > 0 ? { region_id: regionId } : { region: str(a?.region, 255) },
    default_shipping: !!a?.default_shipping, default_billing: !!a?.default_billing,
  };
}

// POST /api/account { locale, action, ... }: profile, password, newsletter, address create/update/delete.
export async function POST(req: Request) {
  const token = readCookie(req, TOKEN_COOKIE);
  if (!token) return signedOut(req);
  const body = await req.json().catch(() => ({}));
  const { store } = storeForLocale(localeOf(body.locale));
  let query = "";
  let variables: Record<string, unknown> = {};
  switch (body.action) {
    case "profile": {
      const firstname = str(body.firstname, 255), lastname = str(body.lastname, 255);
      if (!firstname || !lastname) return Response.json({ ok: false, error: "First and last name are required." }, { status: 400 });
      query = UPDATE_CUSTOMER_MUTATION; variables = { input: { firstname, lastname } };
      break;
    }
    case "newsletter":
      query = UPDATE_CUSTOMER_MUTATION; variables = { input: { is_subscribed: !!body.subscribed } };
      break;
    case "password": {
      const current = typeof body.current === "string" ? body.current : "", next = typeof body.next === "string" ? body.next : "";
      if (!current || next.length < 8 || next.length > 256) return Response.json({ ok: false, error: "Enter your current password and a new one of at least 8 characters." }, { status: 400 });
      query = CHANGE_PASSWORD_MUTATION; variables = { current, next };
      break;
    }
    case "address-save": {
      const input = addressInput(body.address);
      if (!input.firstname || !input.lastname || !input.street.length || !input.city || !/^[A-Z]{2}$/.test(input.country_code) || !input.telephone) {
        return Response.json({ ok: false, error: "Please complete all required fields." }, { status: 400 });
      }
      const id = Number(body.id);
      query = Number.isInteger(id) && id > 0 ? UPDATE_ADDRESS_MUTATION : CREATE_ADDRESS_MUTATION;
      variables = Number.isInteger(id) && id > 0 ? { id, input } : { input };
      break;
    }
    case "address-delete": {
      const id = Number(body.id);
      if (!Number.isInteger(id) || id <= 0) return Response.json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });
      query = DELETE_ADDRESS_MUTATION; variables = { id };
      break;
    }
    default:
      return Response.json({ ok: false, error: "INVALID_ACTION" }, { status: 400 });
  }
  try {
    const json = await customerGql(token, store, query, variables);
    if (json.authFail) return signedOut(req);
    if (json.errors?.length) return Response.json({ ok: false, error: json.errors[0].message }, { status: 422 });
    const out = Response.json({ ok: true });
    // Keep the header greeting in sync with a renamed profile.
    if (body.action === "profile") out.headers.append("Set-Cookie", `${NAME_COOKIE}=${encodeURIComponent(str(body.firstname, 40))}; Path=/; SameSite=Lax; Max-Age=3600`);
    return out;
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message ?? "FAILED" }, { status: 502 });
  }
}
