import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, User, ArrowRight, Search, BookOpen, Loader2, AlertCircle } from "lucide-react";
import SectionObserver from "@/components/features/SectionObserver";
import ParticleField from "@/components/features/ParticleField";
import { apiClient } from "@/lib/api-client";
import { trackPageView, trackBlogRead } from "@/hooks/useTracking";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image_url: string;
  body: string;
  published: boolean;
  author: string;
  read_time: number;
  created_at: string;
}

const CATEGORIES = ["All", "Industry News", "Battery Care", "Buying Guides", "Comparisons", "Rider Tips", "Sustainability", "Company News"];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    trackPageView("/blog", "Knowledge Hub — TRIP Mobility");
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiClient.get("/blog.php");
    if (err) {
      setError(err.message);
    } else {
      const mapped = (data || []).map((p: any) => ({
        ...p,
        image_url: p.cover_image,
        category: p.category || "Technology"
      }));
      setPosts(mapped);
    }
    setLoading(false);
  };

  const filtered = posts.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="bg-white min-h-screen text-black">
      {/* BreadcrumbList Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tripmobility.ph" },
          { "@type": "ListItem", "position": 2, "name": "Knowledge Hub", "item": "https://tripmobility.ph/blog" },
        ]
      })}} />

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#FAFAFA]">
        <ParticleField />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-[0.3em] mb-4">Insights & Resources</p>
          <h1 className="text-[35px] font-bold text-black mb-6 uppercase tracking-tight">
            TRIP <span className="text-[#707070]">Knowledge Hub</span>
          </h1>
          <p className="text-[#707070] text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Expert guides, industry news, and resources to maximize your e-mobility investment.
          </p>
        </div>
      </section>

      {/* Filters — sticky */}
      <section className="py-5 sticky top-20 z-40 bg-white/95 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2 flex-wrap flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-[2px] text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-black text-white"
                    : "bg-[#FAFAFA] text-[#707070] hover:text-black border border-black/5 hover:border-black/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative shrink-0 w-full sm:w-auto">
            <Search className="w-4 h-4 text-[#707070] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="blog-search"
              name="search"
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#FAFAFA] border border-black/10 rounded-[2px] pl-11 pr-4 h-10 text-[10px] text-black font-bold uppercase tracking-wider placeholder-[#707070] focus:outline-none focus:border-black w-full sm:w-64 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="bg-[#FAFAFA] rounded-[2px] overflow-hidden border border-black/5 animate-pulse">
                  <div className="h-48 bg-black/5" />
                  <div className="p-6 space-y-4">
                    <div className="h-3 bg-black/5 w-1/4" />
                    <div className="h-5 bg-black/5 w-3/4" />
                    <div className="h-3 bg-black/5 w-full" />
                    <div className="h-3 bg-black/5 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-[50px] gap-4">
              <AlertCircle className="w-10 h-10 text-[#707070]" />
              <p className="text-[#707070] text-sm font-medium">{error}</p>
              <button onClick={fetchPosts} className="btn-outline h-10 px-6 text-[10px] uppercase font-bold tracking-widest">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-[50px]">
              <BookOpen className="w-12 h-12 text-[#707070] mx-auto mb-4" />
              <p className="text-[#707070] font-medium text-sm">No articles found. Try a different search or category.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featured && (
                <SectionObserver>
                  <Link
                    to={`/blog/${featured.slug}`}
                    onClick={() => trackBlogRead(featured.title, featured.category)}
                    className="w-full text-left group relative rounded-[2px] overflow-hidden mb-12 block border border-black/5 hover:border-black transition-colors"
                  >
                    <div className="relative h-80 sm:h-[400px]">
                      <img
                        src={featured.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      <div className="absolute top-6 left-6">
                        <span className="px-3 py-1.5 bg-white text-black text-[9px] font-bold rounded-[2px] uppercase tracking-widest shadow-sm">
                          ★ Featured — {featured.category}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 p-8 sm:p-10 max-w-3xl">
                        <h2 className="font-bold text-3xl sm:text-4xl text-white mb-4 uppercase tracking-tight group-hover:text-gray-300 transition-colors">
                          {featured.title}
                        </h2>
                        <p className="text-gray-300 mb-6 text-sm leading-relaxed line-clamp-2 font-medium">{featured.excerpt}</p>
                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <span className="flex items-center gap-1.5 text-white"><User className="w-3.5 h-3.5" />{featured.author}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{featured.read_time} min read</span>
                          <span>{formatDate(featured.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-[2px] bg-white flex items-center justify-center shadow-premium">
                          <ArrowRight className="w-5 h-5 text-black" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </SectionObserver>
              )}

              {/* Posts Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <SectionObserver key={post.id}>
                      <Link
                        to={`/blog/${post.slug}`}
                        onClick={() => trackBlogRead(post.title, post.category)}
                        className="w-full text-left bg-white rounded-[2px] overflow-hidden border border-black/5 hover:border-black hover:shadow-premium transition-all group h-full flex flex-col"
                      >
                        <div className="relative h-56 overflow-hidden shrink-0 bg-[#FAFAFA]">
                          <img
                            src={post.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80"}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-black text-white text-[9px] font-bold rounded-[2px] uppercase tracking-widest">
                              {post.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-bold text-black mb-3 group-hover:text-[#707070] transition-colors line-clamp-2 text-xl leading-snug tracking-tight uppercase">
                            {post.title}
                          </h3>
                          <p className="text-[#707070] text-sm font-medium leading-relaxed mb-6 flex-1 line-clamp-3">{post.excerpt}</p>
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#707070] mt-auto pt-5 border-t border-black/5">
                            <span className="flex items-center gap-1.5 text-black"><User className="w-3.5 h-3.5" />{post.author}</span>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.read_time} min</span>
                              <ArrowRight className="w-3.5 h-3.5 text-black group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </SectionObserver>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

