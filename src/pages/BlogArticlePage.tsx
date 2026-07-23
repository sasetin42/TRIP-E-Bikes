import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Clock, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin,
  BookOpen, ChevronRight, Loader2, AlertCircle, Tag, Copy, Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ParticleField from "@/components/features/ParticleField";

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

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (err || !data) {
      setError("Article not found.");
      setLoading(false);
      return;
    }

    setPost(data);

    // Fetch related posts from same category
    const { data: relatedData } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .eq("category", data.category)
      .neq("id", data.id)
      .order("created_at", { ascending: false })
      .limit(3);

    setRelated(relatedData || []);
    setLoading(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });

  const pageUrl = `https://tripmobility.ph/blog/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      color: "hover:text-blue-600",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "hover:text-sky-500",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post?.title || "")}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "hover:text-blue-500",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black">
        <Loader2 className="w-10 h-10 text-black animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-black">
        <AlertCircle className="w-12 h-12 text-[#707070]" />
        <p className="text-[#707070] font-medium">{error || "Article not found."}</p>
        <Link to="/blog" className="btn-outline h-10 px-6 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
        </Link>
      </div>
    );
  }

  const wordCount = post.body ? post.body.split(/\s+/).filter(Boolean).length : 0;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || "",
    "image": post.image_url || "https://tripmobility.ph/favicon.svg",
    "datePublished": post.created_at,
    "dateModified": post.created_at,
    "author": {
      "@type": "Person",
      "name": post.author,
      "url": "https://tripmobility.ph/about",
    },
    "publisher": {
      "@type": "Organization",
      "name": "TRIP Mobility",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tripmobility.ph/favicon.svg",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    "articleSection": post.category,
    "wordCount": wordCount,
    "timeRequired": `PT${post.read_time}M`,
    "inLanguage": "en-PH",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tripmobility.ph" },
      { "@type": "ListItem", "position": 2, "name": "Knowledge Hub", "item": "https://tripmobility.ph/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": pageUrl },
    ],
  };

  // Parse body into paragraphs — detect headings and lists
  const renderBody = (body: string) => {
    if (!body) return null;
    return body.split("\n\n").map((block, i) => {
      if (block.startsWith("# ")) {
        return <h2 key={i} className="font-bold text-3xl text-black uppercase tracking-tight mt-12 mb-6">{block.slice(2)}</h2>;
      }
      if (block.startsWith("## ")) {
        return <h3 key={i} className="font-bold text-2xl text-black uppercase tracking-tight mt-10 mb-4">{block.slice(3)}</h3>;
      }
      if (block.startsWith("### ")) {
        return <h4 key={i} className="font-bold text-xl text-black uppercase tracking-tight mt-8 mb-3">{block.slice(4)}</h4>;
      }
      if (block.startsWith("- ") || block.startsWith("* ")) {
        const items = block.split("\n").filter(l => l.trim());
        return (
          <ul key={i} className="list-none space-y-3 my-6">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-4 text-[#333333] font-medium text-base">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-2.5 shrink-0" />
                <span className="leading-relaxed">{item.replace(/^[-*]\s/, "")}</span>
              </li>
            ))}
          </ul>
        );
      }
      if (block.match(/^\d+\./)) {
        const items = block.split("\n").filter(l => l.trim());
        return (
          <ol key={i} className="space-y-3 my-6">
            {items.map((item, j) => (
              <li key={j} className="flex items-start gap-4 text-[#333333] font-medium text-base">
                <span className="w-6 h-6 rounded-full bg-[#FAFAFA] border border-black/10 text-black text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                <span className="leading-relaxed">{item.replace(/^\d+\.\s/, "")}</span>
              </li>
            ))}
          </ol>
        );
      }
      if (block.startsWith("> ")) {
        return (
          <blockquote key={i} className="border-l-2 border-black pl-8 py-2 my-8 bg-[#FAFAFA] pr-8 rounded-r-[2px]">
            <p className="text-[#333333] italic text-xl leading-relaxed font-medium">{block.slice(2)}</p>
          </blockquote>
        );
      }
      return (
        <p key={i} className="text-[#333333] leading-loose text-lg font-medium my-6">{block}</p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Helmet>
        <title>{post.title} — TRIP Mobility</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || ""} />
        {post.image_url && <meta property="og:image" content={post.image_url} />}
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt || ""} />
        {post.image_url && <meta name="twitter:image" content={post.image_url} />}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[340px] max-h-[520px] overflow-hidden bg-[#FAFAFA]">
        <img
          src={post.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85"}
          alt={post.title}
          className="w-full h-full object-cover mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />

        {/* Back Button */}
        <div className="absolute top-0 left-0 right-0 pt-24 pb-6 px-6">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-black px-4 py-2 text-[9px] uppercase font-bold tracking-widest hover:bg-white transition-colors rounded-[2px] shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5" />Back to Knowledge Hub
            </Link>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[9px] font-bold rounded-[2px] uppercase tracking-widest shadow-sm">
              <Tag className="w-3 h-3" />{post.category}
            </span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-2 pb-24">
        {/* Article Meta */}
        <div className="mb-10 pt-8">
          <h1 className="font-bold text-[35px] text-black uppercase tracking-tight leading-none mb-8">
            {post.title}
          </h1>

          {/* Author & Meta Row */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pb-8 border-b border-black/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[2px] bg-[#FAFAFA] border border-black/10 flex items-center justify-center font-bold text-black text-lg shadow-sm">
                {post.author[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-[11px] font-bold text-black uppercase tracking-wider mb-0.5">{post.author}</p>
                <p className="text-[10px] font-medium text-[#707070] uppercase tracking-widest">TRIP Mobility Team</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-[#707070] sm:ml-auto">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-black" />{post.read_time} min read</span>
              <span>{formatDate(post.created_at)}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-black" />{wordCount} words</span>
            </div>
          </div>
        </div>

        {/* Excerpt (Lead paragraph) */}
        {post.excerpt && (
          <p className="text-xl text-[#707070] leading-relaxed mb-10 font-medium border-l-2 border-black pl-8 py-2">
            {post.excerpt}
          </p>
        )}

        {/* Article Body */}
        <article className="prose max-w-none prose-headings:text-black prose-p:text-[#333333] prose-a:text-black prose-a:font-bold prose-strong:text-black">
          {renderBody(post.body || "")}
        </article>

        {/* Share Section */}
        <div className="mt-16 pt-10 border-t border-black/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div>
              <p className="text-[11px] font-bold text-black uppercase tracking-wider mb-1">Share this article</p>
              <p className="text-[11px] text-[#707070] font-medium">Help others discover e-mobility insights</p>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 flex items-center justify-center rounded-[2px] bg-[#FAFAFA] border border-black/5 text-black ${social.color} transition-all hover:border-black hover:shadow-premium`}
                  title={`Share on ${social.name}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 h-10 rounded-[2px] bg-[#FAFAFA] border border-black/5 text-[10px] font-bold uppercase tracking-widest text-black hover:border-black hover:shadow-premium transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Author Card */}
        <div className="mt-12 bg-[#FAFAFA] rounded-[2px] border border-black/5 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-16 h-16 rounded-[2px] bg-white border border-black/10 flex items-center justify-center font-bold text-2xl text-black shrink-0 shadow-sm">
              {post.author[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg text-black uppercase tracking-tight mb-1">{post.author}</p>
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-4">TRIP Mobility Content Team</p>
              <p className="text-sm text-[#333333] font-medium leading-relaxed max-w-2xl">
                Expert in Philippine e-mobility trends, sustainable transportation, and electric bike technology. Helping businesses and individuals make informed decisions about going electric.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <h2 className="font-bold text-2xl text-black uppercase tracking-tight">More in {post.category}</h2>
              <Link to="/blog" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#707070] hover:text-black transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="bg-white rounded-[2px] border border-black/5 hover:border-black hover:shadow-premium overflow-hidden transition-all group flex flex-col"
                >
                  <div className="relative h-40 overflow-hidden bg-[#FAFAFA] shrink-0">
                    <img
                      src={rel.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                    />
                    <div className="absolute top-3 left-3">
                       <span className="px-2 py-1 bg-black text-white text-[8px] font-bold rounded-[2px] uppercase tracking-widest">
                         {rel.category}
                       </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-black group-hover:text-[#707070] transition-colors line-clamp-2 mb-4 uppercase tracking-wider leading-snug flex-1">{rel.title}</h3>
                    <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-[#707070] mt-auto">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-black" />{rel.read_time} min</span>
                      <span>{formatDate(rel.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Strip */}
        <div className="mt-20 bg-[#FAFAFA] rounded-[2px] border border-black/5 p-12 text-center shadow-sm">
          <p className="font-bold text-3xl text-black uppercase tracking-tight mb-4">Ready to Go Electric?</p>
          <p className="text-[#707070] font-medium text-sm mb-8 max-w-lg mx-auto">Browse TRIP Mobility's premium e-bike lineup and request a free custom quotation today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary h-12 px-8 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">Explore E-Bikes</Link>
            <Link to="/contact" className="btn-outline h-12 px-8 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2">Contact Sales</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

