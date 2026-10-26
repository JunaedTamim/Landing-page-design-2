import { getVerifiedOrder } from "@/lib/payments";
import { toolkitFiles } from "@/lib/toolkit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("order") || "";
  const key = params.get("file") || "toolkit";
  if (!Object.prototype.hasOwnProperty.call(toolkitFiles, key)) return Response.json({ error: "That file isn’t in the toolkit." }, { status: 404 });
  try {
    const order = await getVerifiedOrder(id);
    if (!order || (order.status !== "paid" && order.status !== "demo")) return Response.json({ error: "A completed order is needed to download your toolkit." }, { status: 403, headers: { "Cache-Control": "no-store" } });
    const file = toolkitFiles[key as keyof typeof toolkitFiles];
    return new Response(file.content, { headers: { "Content-Type": file.type, "Content-Disposition": `attachment; filename="${file.filename}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" } });
  } catch (error) {
    console.error("Toolkit download failed:", error);
    return Response.json({ error: "Your download couldn’t be prepared just yet. Please try again." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
