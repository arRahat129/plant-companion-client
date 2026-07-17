import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const apiKey = process.env.IMGBB_API;
    if (!apiKey) {
      return NextResponse.json({ error: "ImgBB API key is not configured" }, { status: 500 });
    }

    // Convert File to base64 or construct FormData for ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", imageFile);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbFormData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { error: data.error?.message || "Failed to upload image to ImgBB" },
        { status: response.status }
      );
    }

    return NextResponse.json({ url: data.data.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
