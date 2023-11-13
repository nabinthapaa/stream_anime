import  VideoPlayer from "@/components/VideoPlayer"
import axios from "axios";

export default async function Watch({ params }: { params: { id: string } }){
    let {id} = params;
    let { data } = await axios.get(`http://localhost:3000/api/watch?ep_id=${id}`)
    return (
    <div className="px-10 h-fit w-full bg-black">
        <div className="container mx-auto h-[75vh] max-h-[75vh]">
            <VideoPlayer source={...data} />
        </div>
    </div>
    );
}

