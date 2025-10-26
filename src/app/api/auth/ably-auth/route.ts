import { auth } from "@/auth";
import Ably from "ably";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!process.env.ABLY_API_KEY) {
    return new NextResponse("Ably API key not configured", { status: 500 });
  }

  // Khởi tạo Ably client -> tạo token cho client có quyền truy cập vào ably
  const client = new Ably.Rest(process.env.ABLY_API_KEY);

  // Tạo một yêu cầu token cho client, định danh client bằng userId
  const tokenRequestData = await client.auth.createTokenRequest({ 
    clientId: userId 
  });

  return NextResponse.json(tokenRequestData);
}
