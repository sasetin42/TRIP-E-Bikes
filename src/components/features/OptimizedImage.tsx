import { useState, useEffect } from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  skeletonClassName?: string;
  imgClassName?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  skeletonClassName = "",
  imgClassName = "",
  loading = "lazy",
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset loading state if src changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden w-full h-full ${className}`}>
      {/* Premium Skeleton Placeholder */}
      {(!isLoaded || error) && (
        <div
          className={`absolute inset-0 bg-neutral-900 border border-white/5 flex items-center justify-center overflow-hidden ${
            !error ? "animate-pulse" : ""
          } ${skeletonClassName}`}
        >
          {!error ? (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          ) : (
            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Image Unavailable</span>
          )}
        </div>
      )}

      {/* High-Resolution Image with Transition */}
      {!error && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onLoad={(e) => {
            setIsLoaded(true);
            if (onLoad) onLoad(e);
          }}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-md"
          } ${imgClassName}`}
          {...props}
        />
      )}
    </div>
  );
}
