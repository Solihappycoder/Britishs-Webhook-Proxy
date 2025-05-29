import { Hono } from "hono";
import { cors } from "hono/cors";
import axios from "axios";
import { logger } from "./logger";

const app = new Hono();
app.use("*", cors());

app.post("/api/webhooks/:webhookID/:webhookToken", async (c) => {
  try {
    const start = performance.now();
    const webhookID = c.req.param("webhookID");
    const webhookToken = c.req.param("webhookToken");
    const discordWebhookURL = `https://discord.com/api/webhooks/${webhookID}/${webhookToken}`;

    const requestBody = await c.req.json();

    await axios.post(discordWebhookURL, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    const localeString = new Date().toLocaleString();
    const end = performance.now();
    const total = (end - start).toFixed(2);

    logger.info(
      `Webhook forwarded successfully to webhook ID ${webhookID} at ${localeString} took ${total}ms`
    );
    return c.json(
      {
        message: "Webhook forwarded successfully",
        error: false,
      },
      200
    );
  } catch (error: any) {
    const localeString = new Date().toLocaleString();

    if (axios.isAxiosError(error) && error.response) {
      logger.error(
        `An error occured while forwarding webhook at ${localeString} with error ${
          error.response.data
            ? JSON.stringify(error.response.data)
            : error.message
        }`
      );
      return c.json(
        {
          message: error.response.data,
          error: true,
        },
        400
      );
    }

    logger.error(
      `An error occured while forwarding webhook at ${localeString} with error ${error.message}`
    );
    return c.json(
      {
        message: `An internal error occured`,
        error: true,
      },
      500
    );
  }
});

app.get("/", async (c) => {
  return c.json(
    { message: "Discord Webhook Proxy API", error: false, version: "1.0" },
    200
  );
});

export default {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  fetch: app.fetch,
};
