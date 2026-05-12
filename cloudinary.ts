import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST() {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY) {
    return NextResponse.json({ error: "Cloudinary nao configurado." }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "agencia-clientes";
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  });
}
