export function GET() {
	const integrations = {
		supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
		stripe: Boolean(process.env.STRIPE_SECRET_KEY),
		evolution: Boolean(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY),
	};

	return Response.json({ ok: true, service: "flowpromos-next", integrations });
}
