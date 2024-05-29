import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser } from "@/drizzle/db/queries";

export async function POST(req: Request) {
  const getWebhookSecret = () => {
    if (process.env.VERCEL_URL) return process.env.CLERK_WEBHOOK_SECRET;
    return process.env.DEV_CLERK_WEBHOOK_SECRET;
  };
  const WEBHOOK_SECRET = getWebhookSecret();

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", { err });
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
      created_at,
      updated_at,
    } = evt.data;

    if (!id || !email_addresses) {
      return Response.json("Error occurred -- missing data", {
        status: 400,
      });
    }

    const user = {
      email: email_addresses[0].email_address,
      clerkUserId: id,
      firstName: first_name || null,
      lastName: last_name || null,
      imageUrl: image_url || null,
      createdAt: new Date(created_at),
      updatedAt: new Date(updated_at),
    };

    try {
      await createUser(user);
      return new Response("User created successfully", { status: 200 });
    } catch (error) {
      return new Response("User not created", { status: 500 });
    }
  }
}
