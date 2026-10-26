import { ApiError, guardRequest, handleApiError, json, readPayload } from "@/lib/api";
import { calculatePrice, isLicense } from "@/lib/product";

export async function POST(request: Request) {
  try {
    guardRequest(request, "promo", 30);
    const { license, code } = await readPayload(request);
    if (!isLicense(license) || typeof code !== "string" || !code.trim() || code.length > 30) throw new ApiError("Enter a discount code to try it out.");
    try { return json(calculatePrice(license, code)); }
    catch (error) { throw new ApiError(error instanceof Error ? error.message : "That code is not available."); }
  } catch (error) { return handleApiError(error); }
}
