-- WhatsApp broadcast history
create table if not exists whatsapp_broadcasts (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  message       text not null,
  image_url     text,
  sent_count    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists whatsapp_broadcasts_restaurant_id_idx on whatsapp_broadcasts(restaurant_id);

alter table whatsapp_broadcasts enable row level security;

-- Merchants can only read their own broadcasts
create policy "merchant_read_own_broadcasts"
  on whatsapp_broadcasts for select
  using (
    restaurant_id in (
      select r.id from restaurants r
      join merchants m on m.id = r.merchant_id
      where m.auth_user_id = auth.uid()
    )
  );

-- Service role can insert (used by server action)
create policy "service_insert_broadcasts"
  on whatsapp_broadcasts for insert
  with check (true);
