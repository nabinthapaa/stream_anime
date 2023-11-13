export default function CardSkeleton(){
    return (
        <div className="rounded-md p-4  w-fit space-y-3">
            <div className="h-64 w-48 animate-pulse bg-slate-500 rounded-xl"></div>
            <div className="h-4 w-full animate-pulse  bg-slate-400 rounded-full max-w-sm"/>
            <div className="h-4 w-1/2 animate-pulse  bg-slate-400 rounded-full max-w-sm"/>
        </div>
    )
}
