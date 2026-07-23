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
    const isFormData = options.body instanceof FormData;
    const body = isFormData ? options.body as FormData : (options.body ? JSON.parse(options.body as string) : null);

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const urlObj = new URL(cleanEndpoint, "https://api-client.local");
    const path = urlObj.pathname;
    const params = Object.fromEntries(urlObj.searchParams.entries());

    let responseData: any = null;

    // ── Upload handler ──────────────────────────────────────────────────────
    if (path.includes("upload")) {
      if (method === "POST" && isFormData) {
        const file = (body as FormData).get("image") as File;
        if (!file) throw new Error("No image file provided");
        const fileExt = file.name.split(".").pop() || "webp";
        const fileName = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, file, { contentType: file.type || "image/webp", upsert: false });
        if (uploadError) throw new Error(uploadError.message);
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(uploadData.path);
        responseData = { url: publicUrl };
      }
    } else if (path.includes("settings")) {
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
          const { data, error } = await supabase.from("products_cms").select("*").eq("product_key", params.id).maybeSingle();
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
      } else if (method === "POST") {
        const { error } = await supabase.from("products_cms").insert({ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
        if (error) throw new Error(error.message);
        responseData = { status: "success" };
      } else if (method === "PUT") {
        const { error } = await supabase.from("products_cms").update({ ...body, updated_at: new Date().toISOString() }).eq("product_key", params.id);
        if (error) throw new Error(error.message);
        responseData = { status: "success" };
      } else if (method === "DELETE") {
        const { error } = await supabase.from("products_cms").delete().eq("product_key", params.id);
        if (error) throw new Error(error.message);
        responseData = { status: "success" };
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
    } else if (path.includes("chat")) {
      if (method === "GET") {
        const sId = params.session_id;
        const { data: messages, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("session_id", sId)
          .order("created_at", { ascending: true });
        if (error) throw new Error(error.message);
        responseData = { messages: messages || [] };
      } else if (method === "POST") {
        if (params.action === "create_session") {
          const { data, error } = await supabase.from("chat_sessions").upsert({
            id: body.session_id,
            customer_name: body.user_name || "Visitor",
            customer_email: body.user_email || null,
            status: "open",
            last_message_at: new Date().toISOString()
          }).select().single();
          if (error) throw new Error(error.message);
          responseData = data;
        } else if (params.action === "read") {
          const { error } = await supabase
            .from("chat_messages")
            .update({ read: true })
            .eq("session_id", body.session_id)
            .eq("sender_type", "agent");
          if (error) throw new Error(error.message);
          responseData = { status: "success" };
        } else {
          const senderType = body.sender === "user" ? "customer" : body.sender;
          const senderName = senderType === "customer" ? "You" : (senderType === "bot" ? "TRIP AI" : "Agent");
          const { data, error } = await supabase.from("chat_messages").insert({
            session_id: body.session_id,
            sender_type: senderType,
            sender_name: senderName,
            message: body.message,
            read: senderType === "customer"
          }).select().single();
          if (error) throw new Error(error.message);

          // Update last_message in session
          await supabase.from("chat_sessions").update({
            last_message: body.message,
            last_message_at: new Date().toISOString()
          }).eq("id", body.session_id);

          responseData = data;
        }
      }
    } else if (path.includes("ai-chat-bot")) {
      if (method === "POST") {
        let reply = "I would be happy to help you with that! Could you please specify which model you are interested in (TRIP Cargo Pro, TRIP Fold X, or TRIP Ranger 750)?";
        const lower = (body.message || "").toLowerCase();
        if (lower.includes("warranty")) {
          reply = "TRIP E-Bikes come with a premium warranty: **3 years on the frame**, **1 year on the motor**, and **1 year on the battery**. All service is handled at our main showroom.";
        } else if (lower.includes("financing") || lower.includes("installment") || lower.includes("plan") || lower.includes("payment") || lower.includes("pay") || lower.includes("loan")) {
          reply = "Yes! We offer flexible financing and installment plans for all our e-bike models. You can pay via **Billease** (up to 12 months installment) or use any major credit card at our flagship store. Would you like me to help you request a custom quotation?";
        } else if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost") || lower.includes("much")) {
          reply = "Here is our current price list:\n\n" +
                  "1. **TRIP Cargo Pro**: ₱58,000 (Built for heavy duty & delivery)\n" +
                  "2. **TRIP Fold X**: ₱45,000 (Compact & easy to transport)\n" +
                  "3. **TRIP Ranger 750**: ₱62,000 (All-terrain mountain e-bike)\n\n" +
                  "Would you like me to help you request a custom quotation?";
        } else if (lower.includes("location") || lower.includes("address") || lower.includes("where") || lower.includes("store") || lower.includes("showroom")) {
          reply = "You can visit our showroom at **105 Maryland Street, Cubao, Quezon City, Metro Manila**. We are open daily for test rides!";
        } else if (lower.includes("contact") || lower.includes("number") || lower.includes("phone") || lower.includes("viber") || lower.includes("whatsapp")) {
          reply = "You can reach us at **0917 122 8212** or **0917 169 2711**, or email us at **gobindra@ggii.com.ph**.";
        } else if (lower.includes("cargo")) {
          reply = "The **TRIP Cargo Pro** (₱58,000) features a powerful 750W motor, a long-range 48V 20Ah battery, and a reinforced cargo rack designed for delivery and utility riders.";
        } else if (lower.includes("fold") || lower.includes("folding")) {
          reply = "The **TRIP Fold X** (₱45,000) features a 500W motor, a 48V 14Ah battery, and a folding frame that is lightweight and easy to store in car trunks or small spaces.";
        } else if (lower.includes("ranger") || lower.includes("mountain") || lower.includes("trail")) {
          reply = "The **TRIP Ranger 750** (₱62,000) features a 750W motor, a 48V 15Ah battery, fat tires, and front suspension, making it perfect for off-road trails and rough roads.";
        } else if (lower.includes("test") || lower.includes("ride")) {
          reply = "Yes, we offer **free test rides** at our Cubao showroom located at 105 Maryland Street, Cubao, Quezon City. Stop by today!";
        } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
          reply = "Hello! I'm the TRIP AI Assistant. How can I help you with your e-bike journey today?";
        }
        responseData = { reply };
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
