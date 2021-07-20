create table products (
  id serial not null constraint entries_pkey primary key,
  "ownerId" integer constraint entries_ownerId_foreign references public.users,
  name text not null,
  description text,
  createdAt date not null default now()
);