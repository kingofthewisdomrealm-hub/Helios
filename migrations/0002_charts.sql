create table if not exists charts (
  id         serial primary key,
  user_id    text not null,
  name       text not null,
  place_name text not null,
  year       integer not null,
  month      integer not null,
  day        integer not null,
  hour       integer not null,
  minute     integer not null,
  lat        double precision not null,
  lon        double precision not null,
  sim_days   double precision not null,
  created_at timestamptz not null default now()
);
create index if not exists charts_user_id_idx on charts (user_id);
