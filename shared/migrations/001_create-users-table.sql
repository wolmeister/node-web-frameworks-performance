create table users (
  id serial not null constraint users_pkey primary key,
  name text not null,
  email text not null constraint users_email_unique unique,
  password text not null
);