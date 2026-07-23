import { Link } from "react-router-dom";
import { Zap, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center text-black">
      <div className="text-center px-6">
        <Zap className="w-16 h-16 text-black mx-auto mb-8 animate-float" fill="currentColor" />
        <h1 className="font-bold text-8xl sm:text-9xl tracking-tight mb-2">404</h1>
        <h2 className="font-bold text-2xl uppercase tracking-tight mb-4">Page Not Found</h2>
        <p className="text-[#707070] font-medium mb-10 max-w-md mx-auto">
          Looks like this road doesn't exist. Let us get you back on track.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary h-12 px-6 flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-outline h-12 px-6 flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

