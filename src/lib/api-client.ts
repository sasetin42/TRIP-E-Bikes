import { supabase } from "./supabase";

export interface ApiResponse<T = any> {
  data: T | null;
  error: { message: string } | null;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body as string) : null;

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const urlObj = new URL(cleanEndpoint, "https://api-client.local");
    const path = urlObj.pathname;
    const params = Object.fromEntries(urlObj.searchParams.entries());

    let responseData: any = null;

    if (path.includes("settings")) {
      if (method === "GET") {
        const { data, error } = await supabase.from("system_settings").select("*");
        if (error) throw new Error(error.message);
        responseData = (data || []).map((s: any) => ({
          key: s.key,
          value: s.value === "true" || s.value === true ? true : s.value === "false" || s.value === false ? false : s.value,
          label: s.label || "",
          description: s.description || "",
        }));
      } else if (method === "POST" || method === "PUT") {
        if (params.key) {
          const { error } = await supabase.from("system_settings").upsert({ key: params.key, value: body.value !== undefined ? body.value : body, updated_at: new Date().toISOString() });
          if (error) throw new Error(error.message);
        } else {
          for (const [k, v] of Object.entries(body)) {
            const { error } = await supabase.from("system_settings").upsert({ key: k, value: v, updated_at: new Date().toISOString() });
            if (error) throw new Error(error.message);
          }
        }
        responseData = { status: "success" };
      }
    } else if (path.includes("products")) {
      if (method === "GET") {
        if (params.id) {
          const { data, error } = await supabase.from("products_cms").select("*").eq("id", params.id).single();
          if (error) throw new Error(error.message);
          responseData = data;
        } else if (params.action === "review_moderation") {
          const { data: reviews, error } = await supabase.from("product_reviews").select("*, user_profiles(username, email)").order("created_at", { ascending: false });
          if (error) throw new Error(error.message);
          responseData = { reviews: reviews || [] };
        } else {
          const { data, error } = await supabase.from("products_cms").select("*").order("sort_order", { ascending: true });
          if (error) throw new Error(error.message);
          responseData = data || [];
        }
      }
    } else if (path.includes("leads")) {
      if (method === "GET") {
        const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        responseData = data || [];
      } else if (method === "POST") {
        const { data, error } = await supabase.from("leads").insert({ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      } else if (method === "PUT") {
        const { data, error } = await supabase.from("leads").update({ ...body, updated_at: new Date().toISOString() }).eq("id", params.id).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      } else if (method === "DELETE") {
        const { error } = await supabase.from("leads").delete().eq("id", params.id);
        if (error) throw new Error(error.message);
        responseData = { status: "success" };
      }
    } else if (path.includes("quotations")) {
      if (method === "GET") {
        if (params.id) {
          const { data, error } = await supabase.from("quotations").select("*").eq("id", params.id).single();
          if (error) throw new Error(error.message);
          responseData = data;
        } else {
          const { data, error } = await supabase.from("quotations").select("*").order("created_at", { ascending: false });
          if (error) throw new Error(error.message);
          responseData = data || [];
        }
      } else if (method === "PUT") {
        const { data, error } = await supabase.from("quotations").update({ ...body, updated_at: new Date().toISOString() }).eq("id", params.id).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      }
    } else if (path.includes("submit-quote")) {
      if (method === "POST") {
        const { data, error } = await supabase.from("quotations").insert({ ...body, status: "pending", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      }
    } else if (path.includes("appointments")) {
      if (method === "GET") {
        const { data, error } = await supabase.from("service_appointments").select("*").order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        responseData = data || [];
      } else if (method === "POST") {
        const { data, error } = await supabase.from("service_appointments").insert({ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      } else if (method === "PUT") {
        const { data, error } = await supabase.from("service_appointments").update({ ...body, updated_at: new Date().toISOString() }).eq("id", params.id).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      }
    } else if (path.includes("contacts") || path.includes("contact-form")) {
      if (method === "GET") {
        const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        responseData = data || [];
      } else if (method === "POST") {
        const { data, error } = await supabase.from("contact_messages").insert({ ...body, created_at: new Date().toISOString() }).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      } else if (method === "PUT") {
        const { data, error } = await supabase.from("contact_messages").update(body).eq("id", params.id).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      }
    } else if (path.includes("blog")) {
      if (method === "GET") {
        if (params.slug) {
          const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", params.slug).single();
          if (error) throw new Error(error.message);
          responseData = data;
        } else {
          const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
          if (error) throw new Error(error.message);
          responseData = data || [];
        }
      } else if (method === "POST") {
        const { data, error } = await supabase.from("blog_posts").insert({ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      } else if (method === "PUT") {
        const { data, error } = await supabase.from("blog_posts").update({ ...body, updated_at: new Date().toISOString() }).eq("id", params.id).select().single();
        if (error) throw new Error(error.message);
        responseData = data;
      } else if (method === "DELETE") {
        const { error } = await supabase.from("blog_posts").delete().eq("id", params.id);
        if (error) throw new Error(error.message);
        responseData = { status: "success" };
      }
    } else if (path.includes("loyalty")) {
      if (method === "GET") {
        const { data, error } = await supabase.from("loyalty_points").select("*").order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        responseData = { points: data || [] };
      }
    }

    return { data: responseData, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message || "Network error" } };
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: "GET", ...options }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};
