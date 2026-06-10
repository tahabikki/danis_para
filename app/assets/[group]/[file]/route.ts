import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

const mimeTypes: Record<string, string> = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ group: string; file: string }> },
) {
  const { group, file } = await context.params;
  const allowed = new Set(["logo", "images"]);

  if (!allowed.has(group)) {
    return new Response("Not found", { status: 404 });
  }

  if (file !== path.basename(file)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), group, file);
  const extension = path.extname(file).toLowerCase();

  try {
    const buffer = await fs.readFile(filePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
