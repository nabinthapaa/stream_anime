import { GetInfo } from "@/scrapper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        console.log(new Date().toISOString() + "\t" + req.method + "\t\t" + req.url + "\t");
        const url = req.url ? new URL(req.url) : null;
        if (url === null) return;
        let id = url.searchParams.get("id");
        if (!id) throw new Error('Please Provide "id"')
        let reponse = await GetInfo(id);
        return new Response(JSON.stringify(reponse), {
            status: 200,
        });
    } catch (e: any) {
        return new Response(JSON.stringify({
            message: e.message,
            status: 500,
        }), { status: 500 });
    }
}
