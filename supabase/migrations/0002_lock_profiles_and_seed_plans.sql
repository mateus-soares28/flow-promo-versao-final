drop policy if exists profiles_self_update on public.profiles;
revoke update on table public.profiles from anon, authenticated;

insert into public.plans (
  id,
  name,
  description,
  price_monthly,
  price_annual,
  offers_limit_per_day,
  groups_limit,
  channels_limit,
  quality_score_max,
  stores_limit,
  is_popular
) values
  ('essencial', 'Essencial', 'Para começar a organizar sua operação.', 0, 0, 0, 0, 0, 0, 0, false),
  ('pro', 'Pro', 'Para uma rotina recorrente de publicações.', 0, 0, 0, 0, 0, 0, 0, true),
  ('expert', 'Expert', 'Para operações de afiliados em expansão.', 0, 0, 0, 0, 0, 0, 0, false)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description;
