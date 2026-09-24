import axios from "axios";

// GET route handlers were statically cached by default before Next 15; keep that behavior.
export const dynamic = "force-static";

export async function GET() {
  try {
    let url =
      "https://goone.pro/streaming.php?id=MjE1MTkw&title=Shangri-La+Frontier%3A+Kusoge+Hunter%2C+Kamige+ni+Idoman+to+su+Episode+7";
    let { data } = await axios.get(url);
    return new Response(JSON.stringify(data), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 404,
    });
  }
}
