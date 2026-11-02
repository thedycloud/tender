import { getTenderDetail } from "../../../../lib/queries/tenders";
import { tenderIdSchema } from "../../../../schemas/tender-id";
import type {
  ActionResult,
  TenderDetailDTO,
} from "../../../../types/tender";

type TenderDetailActionResult = ActionResult<TenderDetailDTO>;

interface TenderRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  context: TenderRouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const parsedId = tenderIdSchema.safeParse(id);

  if (!parsedId.success) {
    const body: TenderDetailActionResult = {
      ok: false,
      error: "ID tender tidak valid.",
    };
    return Response.json(body, { status: 400 });
  }

  try {
    const tender = await getTenderDetail(parsedId.data);

    if (!tender) {
      const body: TenderDetailActionResult = {
        ok: false,
        error: "Tender tidak ditemukan.",
      };
      return Response.json(body, { status: 404 });
    }

    const body: TenderDetailActionResult = {
      ok: true,
      data: tender,
    };
    return Response.json(body);
  } catch (error) {
    console.error("Gagal memuat detail tender:", error);
    const body: TenderDetailActionResult = {
      ok: false,
      error: "Gagal memuat detail tender.",
    };
    return Response.json(body, { status: 500 });
  }
}
