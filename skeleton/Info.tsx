export default function InfoSekeleton(){
    return (
    <div className="shadow min-w-[300px] max-w-[960px] h-fit border-2 border-blue-300 p-4">
        <div className="flex gap-10 flex-wrap">
            <div className="h-64 w-48 animate-pulse rounded-lg bg-gray-400"></div>
            <div className="space-y-6 w-[600px]">
                <div className="w-full h-6 animate-pulse rounded-full bg-gray-400"/>
                <div className="space-y-3">
                    <div className="w-full h-4 animate-pulse rounded-full bg-gray-400"/>
                    <div className="w-full h-4 animate-pulse rounded-full bg-gray-400"/>
                    <div className="w-full h-4 animate-pulse rounded-full bg-gray-400"/>
                    <div className="w-[70%] h-4 animate-pulse rounded-full bg-gray-400"/>
                </div>
                <div>
                    <div className="w-24 h-4 inline-block animate-pulse rounded-full bg-gray-400"/>
                    <div className="w-32 h-4 inline-block ml-4 animate-pulse rounded-full bg-gray-400"/>
                </div>
                <div>
                    <div className="w-24 h-4 inline-block animate-pulse rounded-full bg-gray-400"/>
                    <div className="w-32 h-4 inline-block ml-4 animate-pulse rounded-full bg-gray-400"/>
                </div>

                <div>
                    <div className="w-24 h-4 inline-block animate-pulse rounded-full bg-gray-400"/>
                    <div className="w-32 h-4 inline-block ml-4 animate-pulse rounded-full bg-gray-400"/>
                </div>
            </div>
        </div>
        <h2 className="font-bold text-xl">Episodes:</h2>
        <div className="pt-5 w-full h-64 flex flex-wrap gap-4 content-start">
            {Array.from({length: 12 }).map((_, i) => <span  key={i} className="w-20 h-8  animate-pulse ml-2 rounded-md bg-gray-400 "/>)}
        </div>
    </div>
    );
}

