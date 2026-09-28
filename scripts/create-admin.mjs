import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Variáveis ausentes em .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (password.length < 12) {
  console.error("ADMIN_PASSWORD precisa ter pelo menos 12 caracteres.");
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: userPage, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

const existingUser = userPage.users.find((user) => user.email?.toLowerCase() === email);
const userResult = existingUser
  ? await supabase.auth.admin.updateUserById(existingUser.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: { name: process.env.ADMIN_NAME || "FlowPromos Admin" },
    })
  : await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: process.env.ADMIN_NAME || "FlowPromos Admin" },
    });

if (userResult.error) throw userResult.error;

const { error: profileError } = await supabase.from("profiles").upsert({
  id: userResult.data.user.id,
  email,
  name: process.env.ADMIN_NAME || "FlowPromos Admin",
  role: "admin",
  status: "active",
}, { onConflict: "id" });

if (profileError) throw profileError;

console.log(`Administrador configurado: ${email}`);
