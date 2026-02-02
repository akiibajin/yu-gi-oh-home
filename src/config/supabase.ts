import { createClient } from "@supabase/supabase-js";

const supabaseAdminUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const getAdminClient = async () => {
	console.log({ supabaseAdminUrl, supabaseServiceKey });
	if (!supabaseAdminUrl || !supabaseServiceKey) {
		throw new Error("Missing Supabase environment variables");
	}
	try {
		const adminClient = createClient(supabaseAdminUrl, supabaseServiceKey, {
			auth: { autoRefreshToken: false, persistSession: false },
		});
		if (!adminClient) {
			throw new Error("Supabase admin client creation failed");
		}
		return adminClient;
	} catch (e) {
		console.warn("Bucket verification failed:", e);
		throw new Error("Supabase admin client initialization failed");
	}
};

export default getAdminClient;
