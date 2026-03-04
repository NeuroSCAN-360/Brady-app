import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "edge"

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 })
    }

    try {
        const response = await fetch(url, {
            // Signal to the device that we accept the stream
            headers: {
                Accept: "multipart/x-mixed-replace, image/jpeg, image/png, */*",
            },
            // Don't kill the connection if it stays quiet for a moment
            cache: "no-store",
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: `Target responded with status ${response.status}` },
                { status: response.status }
            )
        }

        const headers = new Headers()
        headers.set("Access-Control-Allow-Origin", "*")
        headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
        headers.set("Access-Control-Allow-Headers", "*")

        // Critically, we MUST pass through the content type verbatim if it's multipart MJPEG
        const contentType = response.headers.get("content-type")
        if (contentType) {
            headers.set("Content-Type", contentType)
        }

        // Prevent browser/CDN caching for a live stream
        headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
        headers.set("Pragma", "no-cache")
        headers.set("Expires", "0")

        return new NextResponse(response.body, {
            headers,
        })
    } catch (error: any) {
        console.error("Stream Proxy Error:", error)
        return NextResponse.json(
            { error: "Failed to connect to the target stream URL.", details: String(error?.message || error) },
            { status: 502 }
        )
    }
}
