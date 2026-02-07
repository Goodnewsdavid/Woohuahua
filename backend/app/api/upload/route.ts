import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "public/uploads";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: Request) {
  const auth = await getUserIdFromRequest(request);
  if ("error" in auth) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("image") ?? formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Please upload an image file (field: image or file)." },
        { status: 400 }
      );
    }

    const blob = file as Blob;
    if (!ALLOWED_TYPES.includes(blob.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." },
        { status: 400 }
      );
    }
    if (blob.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image must be 5MB or smaller." },
        { status: 400 }
      );
    }

    const ext = blob.type === "image/jpeg" ? "jpg" : blob.type.split("/")[1] || "jpg";
    const name = `${crypto.randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, name);
    const buffer = Buffer.from(await blob.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
