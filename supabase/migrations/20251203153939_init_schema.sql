create sequence "public"."collection_providers_id_seq";

create sequence "public"."episode_collections_id_seq";

create sequence "public"."episodes_id_seq";

create sequence "public"."genres_id_seq";

create sequence "public"."movie_collections_id_seq";

create sequence "public"."movie_parts_id_seq";

create sequence "public"."movies_id_seq";

create sequence "public"."series_id_seq";


  create table "public"."collection_providers" (
    "id" bigint not null default nextval('public.collection_providers_id_seq'::regclass),
    "name" text not null,
    "code" text,
    "website_url" text,
    "note" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."countries" (
    "code" text not null,
    "name" text not null,
    "name_ja" text not null,
    "sort_order" integer default 0,
    "is_active" boolean default true
      );



  create table "public"."episode_collections" (
    "id" bigint not null default nextval('public.episode_collections_id_seq'::regclass),
    "series_id" bigint not null,
    "name" text not null,
    "name_ja" text,
    "slug" text,
    "type" text,
    "audio_language" text,
    "subtitle_language" text,
    "sort_order" integer default 0,
    "is_default" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "provider_id" bigint
      );



  create table "public"."episode_progress" (
    "user_id" uuid not null,
    "episode_id" bigint not null,
    "progress_seconds" integer not null,
    "duration_seconds" integer not null,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."episode_progress" enable row level security;


  create table "public"."episodes" (
    "id" bigint not null default nextval('public.episodes_id_seq'::regclass),
    "series_id" bigint not null,
    "episode_number" integer not null,
    "season_number" integer,
    "title" text not null,
    "title_kana" text,
    "description" text,
    "duration_minutes" integer,
    "release_date" date,
    "video_path" text,
    "thumbnail_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "collection_id" bigint
      );



  create table "public"."genres" (
    "id" bigint not null default nextval('public.genres_id_seq'::regclass),
    "slug" text not null,
    "name" text not null,
    "name_ja" text,
    "sort_order" integer default 0,
    "is_active" boolean default true
      );



  create table "public"."movie_collections" (
    "id" bigint not null default nextval('public.movie_collections_id_seq'::regclass),
    "movie_id" bigint not null,
    "name" text not null,
    "name_ja" text,
    "slug" text,
    "type" text,
    "audio_language" text,
    "subtitle_language" text,
    "sort_order" integer default 0,
    "is_default" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "provider_id" bigint
      );



  create table "public"."movie_genres" (
    "movie_id" bigint not null,
    "genre_id" bigint not null
      );



  create table "public"."movie_parts" (
    "id" bigint not null default nextval('public.movie_parts_id_seq'::regclass),
    "movie_id" bigint not null,
    "collection_id" bigint not null,
    "part_number" integer not null,
    "title" text not null,
    "title_kana" text,
    "description" text,
    "duration_minutes" integer,
    "release_date" date,
    "video_path" text,
    "thumbnail_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."movie_progress" (
    "user_id" uuid not null,
    "movie_id" bigint not null,
    "progress_seconds" integer not null,
    "duration_seconds" integer not null,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."movie_progress" enable row level security;


  create table "public"."movie_slug_history" (
    "id" bigint generated always as identity not null,
    "movie_id" bigint not null,
    "slug" text not null,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."movies" (
    "id" bigint not null default nextval('public.movies_id_seq'::regclass),
    "slug" text not null,
    "title" text not null,
    "title_ja" text,
    "description" text,
    "description_ja" text,
    "year" integer,
    "duration_minutes" integer,
    "maturity_rating" text,
    "poster_url" text,
    "banner_url" text,
    "trailer_url" text,
    "video_path" text,
    "is_featured" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "title_kana" text,
    "release_date" date,
    "director" text,
    "main_cast" text,
    "original_title" text,
    "origin_country" text
      );



  create table "public"."profiles" (
    "id" uuid not null,
    "display_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."series" (
    "id" bigint not null default nextval('public.series_id_seq'::regclass),
    "slug" text not null,
    "title" text not null,
    "original_title" text,
    "title_kana" text,
    "description" text,
    "year" integer,
    "release_date" date,
    "origin_country" text,
    "director" text,
    "main_cast" text,
    "poster_url" text,
    "banner_url" text,
    "is_featured" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."series_genres" (
    "series_id" bigint not null,
    "genre_id" integer not null
      );



  create table "public"."series_slug_history" (
    "id" bigint generated always as identity not null,
    "series_id" bigint not null,
    "slug" text not null,
    "created_at" timestamp with time zone not null default now()
      );



  create table "public"."user_movie_list" (
    "user_id" uuid not null,
    "movie_id" bigint not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."user_movie_list" enable row level security;


  create table "public"."user_series_list" (
    "user_id" uuid not null,
    "series_id" bigint not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."user_series_list" enable row level security;

alter sequence "public"."collection_providers_id_seq" owned by "public"."collection_providers"."id";

alter sequence "public"."episode_collections_id_seq" owned by "public"."episode_collections"."id";

alter sequence "public"."episodes_id_seq" owned by "public"."episodes"."id";

alter sequence "public"."genres_id_seq" owned by "public"."genres"."id";

alter sequence "public"."movie_collections_id_seq" owned by "public"."movie_collections"."id";

alter sequence "public"."movie_parts_id_seq" owned by "public"."movie_parts"."id";

alter sequence "public"."movies_id_seq" owned by "public"."movies"."id";

alter sequence "public"."series_id_seq" owned by "public"."series"."id";

CREATE UNIQUE INDEX collection_providers_code_key ON public.collection_providers USING btree (code);

CREATE UNIQUE INDEX collection_providers_pkey ON public.collection_providers USING btree (id);

CREATE UNIQUE INDEX countries_pkey ON public.countries USING btree (code);

CREATE UNIQUE INDEX episode_collections_pkey ON public.episode_collections USING btree (id);

CREATE INDEX episode_collections_series_idx ON public.episode_collections USING btree (series_id);

CREATE UNIQUE INDEX episode_progress_pkey ON public.episode_progress USING btree (user_id, episode_id);

CREATE UNIQUE INDEX episodes_collection_episode_number_idx ON public.episodes USING btree (collection_id, episode_number);

CREATE UNIQUE INDEX episodes_pkey ON public.episodes USING btree (id);

CREATE UNIQUE INDEX genres_pkey ON public.genres USING btree (id);

CREATE UNIQUE INDEX genres_slug_key ON public.genres USING btree (slug);

CREATE INDEX movie_collections_movie_idx ON public.movie_collections USING btree (movie_id);

CREATE UNIQUE INDEX movie_collections_pkey ON public.movie_collections USING btree (id);

CREATE UNIQUE INDEX movie_genres_pkey ON public.movie_genres USING btree (movie_id, genre_id);

CREATE UNIQUE INDEX movie_parts_collection_part_number_idx ON public.movie_parts USING btree (collection_id, part_number);

CREATE UNIQUE INDEX movie_parts_pkey ON public.movie_parts USING btree (id);

CREATE UNIQUE INDEX movie_progress_pkey ON public.movie_progress USING btree (user_id, movie_id);

CREATE UNIQUE INDEX movie_slug_history_pkey ON public.movie_slug_history USING btree (id);

CREATE UNIQUE INDEX movie_slug_history_slug_key ON public.movie_slug_history USING btree (slug);

CREATE UNIQUE INDEX movies_pkey ON public.movies USING btree (id);

CREATE UNIQUE INDEX movies_slug_key ON public.movies USING btree (slug);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX series_genres_pkey ON public.series_genres USING btree (series_id, genre_id);

CREATE UNIQUE INDEX series_pkey ON public.series USING btree (id);

CREATE UNIQUE INDEX series_slug_history_pkey ON public.series_slug_history USING btree (id);

CREATE UNIQUE INDEX series_slug_history_slug_key ON public.series_slug_history USING btree (slug);

CREATE UNIQUE INDEX series_slug_key ON public.series USING btree (slug);

CREATE UNIQUE INDEX user_movie_list_pkey ON public.user_movie_list USING btree (user_id, movie_id);

CREATE UNIQUE INDEX user_series_list_pkey ON public.user_series_list USING btree (user_id, series_id);

alter table "public"."collection_providers" add constraint "collection_providers_pkey" PRIMARY KEY using index "collection_providers_pkey";

alter table "public"."countries" add constraint "countries_pkey" PRIMARY KEY using index "countries_pkey";

alter table "public"."episode_collections" add constraint "episode_collections_pkey" PRIMARY KEY using index "episode_collections_pkey";

alter table "public"."episode_progress" add constraint "episode_progress_pkey" PRIMARY KEY using index "episode_progress_pkey";

alter table "public"."episodes" add constraint "episodes_pkey" PRIMARY KEY using index "episodes_pkey";

alter table "public"."genres" add constraint "genres_pkey" PRIMARY KEY using index "genres_pkey";

alter table "public"."movie_collections" add constraint "movie_collections_pkey" PRIMARY KEY using index "movie_collections_pkey";

alter table "public"."movie_genres" add constraint "movie_genres_pkey" PRIMARY KEY using index "movie_genres_pkey";

alter table "public"."movie_parts" add constraint "movie_parts_pkey" PRIMARY KEY using index "movie_parts_pkey";

alter table "public"."movie_progress" add constraint "movie_progress_pkey" PRIMARY KEY using index "movie_progress_pkey";

alter table "public"."movie_slug_history" add constraint "movie_slug_history_pkey" PRIMARY KEY using index "movie_slug_history_pkey";

alter table "public"."movies" add constraint "movies_pkey" PRIMARY KEY using index "movies_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."series" add constraint "series_pkey" PRIMARY KEY using index "series_pkey";

alter table "public"."series_genres" add constraint "series_genres_pkey" PRIMARY KEY using index "series_genres_pkey";

alter table "public"."series_slug_history" add constraint "series_slug_history_pkey" PRIMARY KEY using index "series_slug_history_pkey";

alter table "public"."user_movie_list" add constraint "user_movie_list_pkey" PRIMARY KEY using index "user_movie_list_pkey";

alter table "public"."user_series_list" add constraint "user_series_list_pkey" PRIMARY KEY using index "user_series_list_pkey";

alter table "public"."collection_providers" add constraint "collection_providers_code_key" UNIQUE using index "collection_providers_code_key";

alter table "public"."episode_collections" add constraint "episode_collections_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES public.collection_providers(id) ON DELETE CASCADE not valid;

alter table "public"."episode_collections" validate constraint "episode_collections_provider_id_fkey";

alter table "public"."episode_collections" add constraint "episode_collections_series_id_fkey" FOREIGN KEY (series_id) REFERENCES public.series(id) ON DELETE CASCADE not valid;

alter table "public"."episode_collections" validate constraint "episode_collections_series_id_fkey";

alter table "public"."episode_progress" add constraint "episode_progress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."episode_progress" validate constraint "episode_progress_user_id_fkey";

alter table "public"."episodes" add constraint "episodes_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES public.episode_collections(id) not valid;

alter table "public"."episodes" validate constraint "episodes_collection_id_fkey";

alter table "public"."episodes" add constraint "episodes_series_id_fkey" FOREIGN KEY (series_id) REFERENCES public.series(id) ON DELETE CASCADE not valid;

alter table "public"."episodes" validate constraint "episodes_series_id_fkey";

alter table "public"."genres" add constraint "genres_slug_key" UNIQUE using index "genres_slug_key";

alter table "public"."movie_collections" add constraint "movie_collections_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE not valid;

alter table "public"."movie_collections" validate constraint "movie_collections_movie_id_fkey";

alter table "public"."movie_collections" add constraint "movie_collections_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES public.collection_providers(id) ON DELETE CASCADE not valid;

alter table "public"."movie_collections" validate constraint "movie_collections_provider_id_fkey";

alter table "public"."movie_genres" add constraint "movie_genres_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES public.genres(id) ON DELETE CASCADE not valid;

alter table "public"."movie_genres" validate constraint "movie_genres_genre_id_fkey";

alter table "public"."movie_genres" add constraint "movie_genres_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE not valid;

alter table "public"."movie_genres" validate constraint "movie_genres_movie_id_fkey";

alter table "public"."movie_parts" add constraint "movie_parts_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES public.movie_collections(id) ON DELETE CASCADE not valid;

alter table "public"."movie_parts" validate constraint "movie_parts_collection_id_fkey";

alter table "public"."movie_parts" add constraint "movie_parts_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE not valid;

alter table "public"."movie_parts" validate constraint "movie_parts_movie_id_fkey";

alter table "public"."movie_progress" add constraint "movie_progress_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE not valid;

alter table "public"."movie_progress" validate constraint "movie_progress_movie_id_fkey";

alter table "public"."movie_progress" add constraint "movie_progress_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."movie_progress" validate constraint "movie_progress_user_id_fkey";

alter table "public"."movie_slug_history" add constraint "movie_slug_history_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE not valid;

alter table "public"."movie_slug_history" validate constraint "movie_slug_history_movie_id_fkey";

alter table "public"."movie_slug_history" add constraint "movie_slug_history_slug_key" UNIQUE using index "movie_slug_history_slug_key";

alter table "public"."movies" add constraint "movies_slug_key" UNIQUE using index "movies_slug_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."series" add constraint "series_origin_country_fkey" FOREIGN KEY (origin_country) REFERENCES public.countries(code) not valid;

alter table "public"."series" validate constraint "series_origin_country_fkey";

alter table "public"."series" add constraint "series_slug_key" UNIQUE using index "series_slug_key";

alter table "public"."series_genres" add constraint "series_genres_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES public.genres(id) not valid;

alter table "public"."series_genres" validate constraint "series_genres_genre_id_fkey";

alter table "public"."series_genres" add constraint "series_genres_series_id_fkey" FOREIGN KEY (series_id) REFERENCES public.series(id) ON DELETE CASCADE not valid;

alter table "public"."series_genres" validate constraint "series_genres_series_id_fkey";

alter table "public"."series_slug_history" add constraint "series_slug_history_series_id_fkey" FOREIGN KEY (series_id) REFERENCES public.series(id) ON DELETE CASCADE not valid;

alter table "public"."series_slug_history" validate constraint "series_slug_history_series_id_fkey";

alter table "public"."series_slug_history" add constraint "series_slug_history_slug_key" UNIQUE using index "series_slug_history_slug_key";

alter table "public"."user_movie_list" add constraint "user_movie_list_movie_id_fkey" FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE not valid;

alter table "public"."user_movie_list" validate constraint "user_movie_list_movie_id_fkey";

alter table "public"."user_movie_list" add constraint "user_movie_list_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_movie_list" validate constraint "user_movie_list_user_id_fkey";

alter table "public"."user_series_list" add constraint "user_series_list_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_series_list" validate constraint "user_series_list_user_id_fkey";

grant delete on table "public"."collection_providers" to "anon";

grant insert on table "public"."collection_providers" to "anon";

grant references on table "public"."collection_providers" to "anon";

grant select on table "public"."collection_providers" to "anon";

grant trigger on table "public"."collection_providers" to "anon";

grant truncate on table "public"."collection_providers" to "anon";

grant update on table "public"."collection_providers" to "anon";

grant delete on table "public"."collection_providers" to "authenticated";

grant insert on table "public"."collection_providers" to "authenticated";

grant references on table "public"."collection_providers" to "authenticated";

grant select on table "public"."collection_providers" to "authenticated";

grant trigger on table "public"."collection_providers" to "authenticated";

grant truncate on table "public"."collection_providers" to "authenticated";

grant update on table "public"."collection_providers" to "authenticated";

grant delete on table "public"."collection_providers" to "postgres";

grant insert on table "public"."collection_providers" to "postgres";

grant references on table "public"."collection_providers" to "postgres";

grant select on table "public"."collection_providers" to "postgres";

grant trigger on table "public"."collection_providers" to "postgres";

grant truncate on table "public"."collection_providers" to "postgres";

grant update on table "public"."collection_providers" to "postgres";

grant delete on table "public"."collection_providers" to "service_role";

grant insert on table "public"."collection_providers" to "service_role";

grant references on table "public"."collection_providers" to "service_role";

grant select on table "public"."collection_providers" to "service_role";

grant trigger on table "public"."collection_providers" to "service_role";

grant truncate on table "public"."collection_providers" to "service_role";

grant update on table "public"."collection_providers" to "service_role";

grant delete on table "public"."countries" to "anon";

grant insert on table "public"."countries" to "anon";

grant references on table "public"."countries" to "anon";

grant select on table "public"."countries" to "anon";

grant trigger on table "public"."countries" to "anon";

grant truncate on table "public"."countries" to "anon";

grant update on table "public"."countries" to "anon";

grant delete on table "public"."countries" to "authenticated";

grant insert on table "public"."countries" to "authenticated";

grant references on table "public"."countries" to "authenticated";

grant select on table "public"."countries" to "authenticated";

grant trigger on table "public"."countries" to "authenticated";

grant truncate on table "public"."countries" to "authenticated";

grant update on table "public"."countries" to "authenticated";

grant delete on table "public"."countries" to "postgres";

grant insert on table "public"."countries" to "postgres";

grant references on table "public"."countries" to "postgres";

grant select on table "public"."countries" to "postgres";

grant trigger on table "public"."countries" to "postgres";

grant truncate on table "public"."countries" to "postgres";

grant update on table "public"."countries" to "postgres";

grant delete on table "public"."countries" to "service_role";

grant insert on table "public"."countries" to "service_role";

grant references on table "public"."countries" to "service_role";

grant select on table "public"."countries" to "service_role";

grant trigger on table "public"."countries" to "service_role";

grant truncate on table "public"."countries" to "service_role";

grant update on table "public"."countries" to "service_role";

grant delete on table "public"."episode_collections" to "anon";

grant insert on table "public"."episode_collections" to "anon";

grant references on table "public"."episode_collections" to "anon";

grant select on table "public"."episode_collections" to "anon";

grant trigger on table "public"."episode_collections" to "anon";

grant truncate on table "public"."episode_collections" to "anon";

grant update on table "public"."episode_collections" to "anon";

grant delete on table "public"."episode_collections" to "authenticated";

grant insert on table "public"."episode_collections" to "authenticated";

grant references on table "public"."episode_collections" to "authenticated";

grant select on table "public"."episode_collections" to "authenticated";

grant trigger on table "public"."episode_collections" to "authenticated";

grant truncate on table "public"."episode_collections" to "authenticated";

grant update on table "public"."episode_collections" to "authenticated";

grant delete on table "public"."episode_collections" to "postgres";

grant insert on table "public"."episode_collections" to "postgres";

grant references on table "public"."episode_collections" to "postgres";

grant select on table "public"."episode_collections" to "postgres";

grant trigger on table "public"."episode_collections" to "postgres";

grant truncate on table "public"."episode_collections" to "postgres";

grant update on table "public"."episode_collections" to "postgres";

grant delete on table "public"."episode_collections" to "service_role";

grant insert on table "public"."episode_collections" to "service_role";

grant references on table "public"."episode_collections" to "service_role";

grant select on table "public"."episode_collections" to "service_role";

grant trigger on table "public"."episode_collections" to "service_role";

grant truncate on table "public"."episode_collections" to "service_role";

grant update on table "public"."episode_collections" to "service_role";

grant delete on table "public"."episode_progress" to "anon";

grant insert on table "public"."episode_progress" to "anon";

grant references on table "public"."episode_progress" to "anon";

grant select on table "public"."episode_progress" to "anon";

grant trigger on table "public"."episode_progress" to "anon";

grant truncate on table "public"."episode_progress" to "anon";

grant update on table "public"."episode_progress" to "anon";

grant delete on table "public"."episode_progress" to "authenticated";

grant insert on table "public"."episode_progress" to "authenticated";

grant references on table "public"."episode_progress" to "authenticated";

grant select on table "public"."episode_progress" to "authenticated";

grant trigger on table "public"."episode_progress" to "authenticated";

grant truncate on table "public"."episode_progress" to "authenticated";

grant update on table "public"."episode_progress" to "authenticated";

grant delete on table "public"."episode_progress" to "postgres";

grant insert on table "public"."episode_progress" to "postgres";

grant references on table "public"."episode_progress" to "postgres";

grant select on table "public"."episode_progress" to "postgres";

grant trigger on table "public"."episode_progress" to "postgres";

grant truncate on table "public"."episode_progress" to "postgres";

grant update on table "public"."episode_progress" to "postgres";

grant delete on table "public"."episode_progress" to "service_role";

grant insert on table "public"."episode_progress" to "service_role";

grant references on table "public"."episode_progress" to "service_role";

grant select on table "public"."episode_progress" to "service_role";

grant trigger on table "public"."episode_progress" to "service_role";

grant truncate on table "public"."episode_progress" to "service_role";

grant update on table "public"."episode_progress" to "service_role";

grant delete on table "public"."episodes" to "anon";

grant insert on table "public"."episodes" to "anon";

grant references on table "public"."episodes" to "anon";

grant select on table "public"."episodes" to "anon";

grant trigger on table "public"."episodes" to "anon";

grant truncate on table "public"."episodes" to "anon";

grant update on table "public"."episodes" to "anon";

grant delete on table "public"."episodes" to "authenticated";

grant insert on table "public"."episodes" to "authenticated";

grant references on table "public"."episodes" to "authenticated";

grant select on table "public"."episodes" to "authenticated";

grant trigger on table "public"."episodes" to "authenticated";

grant truncate on table "public"."episodes" to "authenticated";

grant update on table "public"."episodes" to "authenticated";

grant delete on table "public"."episodes" to "postgres";

grant insert on table "public"."episodes" to "postgres";

grant references on table "public"."episodes" to "postgres";

grant select on table "public"."episodes" to "postgres";

grant trigger on table "public"."episodes" to "postgres";

grant truncate on table "public"."episodes" to "postgres";

grant update on table "public"."episodes" to "postgres";

grant delete on table "public"."episodes" to "service_role";

grant insert on table "public"."episodes" to "service_role";

grant references on table "public"."episodes" to "service_role";

grant select on table "public"."episodes" to "service_role";

grant trigger on table "public"."episodes" to "service_role";

grant truncate on table "public"."episodes" to "service_role";

grant update on table "public"."episodes" to "service_role";

grant delete on table "public"."genres" to "anon";

grant insert on table "public"."genres" to "anon";

grant references on table "public"."genres" to "anon";

grant select on table "public"."genres" to "anon";

grant trigger on table "public"."genres" to "anon";

grant truncate on table "public"."genres" to "anon";

grant update on table "public"."genres" to "anon";

grant delete on table "public"."genres" to "authenticated";

grant insert on table "public"."genres" to "authenticated";

grant references on table "public"."genres" to "authenticated";

grant select on table "public"."genres" to "authenticated";

grant trigger on table "public"."genres" to "authenticated";

grant truncate on table "public"."genres" to "authenticated";

grant update on table "public"."genres" to "authenticated";

grant delete on table "public"."genres" to "postgres";

grant insert on table "public"."genres" to "postgres";

grant references on table "public"."genres" to "postgres";

grant select on table "public"."genres" to "postgres";

grant trigger on table "public"."genres" to "postgres";

grant truncate on table "public"."genres" to "postgres";

grant update on table "public"."genres" to "postgres";

grant delete on table "public"."genres" to "service_role";

grant insert on table "public"."genres" to "service_role";

grant references on table "public"."genres" to "service_role";

grant select on table "public"."genres" to "service_role";

grant trigger on table "public"."genres" to "service_role";

grant truncate on table "public"."genres" to "service_role";

grant update on table "public"."genres" to "service_role";

grant delete on table "public"."movie_collections" to "anon";

grant insert on table "public"."movie_collections" to "anon";

grant references on table "public"."movie_collections" to "anon";

grant select on table "public"."movie_collections" to "anon";

grant trigger on table "public"."movie_collections" to "anon";

grant truncate on table "public"."movie_collections" to "anon";

grant update on table "public"."movie_collections" to "anon";

grant delete on table "public"."movie_collections" to "authenticated";

grant insert on table "public"."movie_collections" to "authenticated";

grant references on table "public"."movie_collections" to "authenticated";

grant select on table "public"."movie_collections" to "authenticated";

grant trigger on table "public"."movie_collections" to "authenticated";

grant truncate on table "public"."movie_collections" to "authenticated";

grant update on table "public"."movie_collections" to "authenticated";

grant delete on table "public"."movie_collections" to "postgres";

grant insert on table "public"."movie_collections" to "postgres";

grant references on table "public"."movie_collections" to "postgres";

grant select on table "public"."movie_collections" to "postgres";

grant trigger on table "public"."movie_collections" to "postgres";

grant truncate on table "public"."movie_collections" to "postgres";

grant update on table "public"."movie_collections" to "postgres";

grant delete on table "public"."movie_collections" to "service_role";

grant insert on table "public"."movie_collections" to "service_role";

grant references on table "public"."movie_collections" to "service_role";

grant select on table "public"."movie_collections" to "service_role";

grant trigger on table "public"."movie_collections" to "service_role";

grant truncate on table "public"."movie_collections" to "service_role";

grant update on table "public"."movie_collections" to "service_role";

grant delete on table "public"."movie_genres" to "anon";

grant insert on table "public"."movie_genres" to "anon";

grant references on table "public"."movie_genres" to "anon";

grant select on table "public"."movie_genres" to "anon";

grant trigger on table "public"."movie_genres" to "anon";

grant truncate on table "public"."movie_genres" to "anon";

grant update on table "public"."movie_genres" to "anon";

grant delete on table "public"."movie_genres" to "authenticated";

grant insert on table "public"."movie_genres" to "authenticated";

grant references on table "public"."movie_genres" to "authenticated";

grant select on table "public"."movie_genres" to "authenticated";

grant trigger on table "public"."movie_genres" to "authenticated";

grant truncate on table "public"."movie_genres" to "authenticated";

grant update on table "public"."movie_genres" to "authenticated";

grant delete on table "public"."movie_genres" to "postgres";

grant insert on table "public"."movie_genres" to "postgres";

grant references on table "public"."movie_genres" to "postgres";

grant select on table "public"."movie_genres" to "postgres";

grant trigger on table "public"."movie_genres" to "postgres";

grant truncate on table "public"."movie_genres" to "postgres";

grant update on table "public"."movie_genres" to "postgres";

grant delete on table "public"."movie_genres" to "service_role";

grant insert on table "public"."movie_genres" to "service_role";

grant references on table "public"."movie_genres" to "service_role";

grant select on table "public"."movie_genres" to "service_role";

grant trigger on table "public"."movie_genres" to "service_role";

grant truncate on table "public"."movie_genres" to "service_role";

grant update on table "public"."movie_genres" to "service_role";

grant delete on table "public"."movie_parts" to "anon";

grant insert on table "public"."movie_parts" to "anon";

grant references on table "public"."movie_parts" to "anon";

grant select on table "public"."movie_parts" to "anon";

grant trigger on table "public"."movie_parts" to "anon";

grant truncate on table "public"."movie_parts" to "anon";

grant update on table "public"."movie_parts" to "anon";

grant delete on table "public"."movie_parts" to "authenticated";

grant insert on table "public"."movie_parts" to "authenticated";

grant references on table "public"."movie_parts" to "authenticated";

grant select on table "public"."movie_parts" to "authenticated";

grant trigger on table "public"."movie_parts" to "authenticated";

grant truncate on table "public"."movie_parts" to "authenticated";

grant update on table "public"."movie_parts" to "authenticated";

grant delete on table "public"."movie_parts" to "postgres";

grant insert on table "public"."movie_parts" to "postgres";

grant references on table "public"."movie_parts" to "postgres";

grant select on table "public"."movie_parts" to "postgres";

grant trigger on table "public"."movie_parts" to "postgres";

grant truncate on table "public"."movie_parts" to "postgres";

grant update on table "public"."movie_parts" to "postgres";

grant delete on table "public"."movie_parts" to "service_role";

grant insert on table "public"."movie_parts" to "service_role";

grant references on table "public"."movie_parts" to "service_role";

grant select on table "public"."movie_parts" to "service_role";

grant trigger on table "public"."movie_parts" to "service_role";

grant truncate on table "public"."movie_parts" to "service_role";

grant update on table "public"."movie_parts" to "service_role";

grant delete on table "public"."movie_progress" to "anon";

grant insert on table "public"."movie_progress" to "anon";

grant references on table "public"."movie_progress" to "anon";

grant select on table "public"."movie_progress" to "anon";

grant trigger on table "public"."movie_progress" to "anon";

grant truncate on table "public"."movie_progress" to "anon";

grant update on table "public"."movie_progress" to "anon";

grant delete on table "public"."movie_progress" to "authenticated";

grant insert on table "public"."movie_progress" to "authenticated";

grant references on table "public"."movie_progress" to "authenticated";

grant select on table "public"."movie_progress" to "authenticated";

grant trigger on table "public"."movie_progress" to "authenticated";

grant truncate on table "public"."movie_progress" to "authenticated";

grant update on table "public"."movie_progress" to "authenticated";

grant delete on table "public"."movie_progress" to "postgres";

grant insert on table "public"."movie_progress" to "postgres";

grant references on table "public"."movie_progress" to "postgres";

grant select on table "public"."movie_progress" to "postgres";

grant trigger on table "public"."movie_progress" to "postgres";

grant truncate on table "public"."movie_progress" to "postgres";

grant update on table "public"."movie_progress" to "postgres";

grant delete on table "public"."movie_progress" to "service_role";

grant insert on table "public"."movie_progress" to "service_role";

grant references on table "public"."movie_progress" to "service_role";

grant select on table "public"."movie_progress" to "service_role";

grant trigger on table "public"."movie_progress" to "service_role";

grant truncate on table "public"."movie_progress" to "service_role";

grant update on table "public"."movie_progress" to "service_role";

grant delete on table "public"."movie_slug_history" to "anon";

grant insert on table "public"."movie_slug_history" to "anon";

grant references on table "public"."movie_slug_history" to "anon";

grant select on table "public"."movie_slug_history" to "anon";

grant trigger on table "public"."movie_slug_history" to "anon";

grant truncate on table "public"."movie_slug_history" to "anon";

grant update on table "public"."movie_slug_history" to "anon";

grant delete on table "public"."movie_slug_history" to "authenticated";

grant insert on table "public"."movie_slug_history" to "authenticated";

grant references on table "public"."movie_slug_history" to "authenticated";

grant select on table "public"."movie_slug_history" to "authenticated";

grant trigger on table "public"."movie_slug_history" to "authenticated";

grant truncate on table "public"."movie_slug_history" to "authenticated";

grant update on table "public"."movie_slug_history" to "authenticated";

grant delete on table "public"."movie_slug_history" to "postgres";

grant insert on table "public"."movie_slug_history" to "postgres";

grant references on table "public"."movie_slug_history" to "postgres";

grant select on table "public"."movie_slug_history" to "postgres";

grant trigger on table "public"."movie_slug_history" to "postgres";

grant truncate on table "public"."movie_slug_history" to "postgres";

grant update on table "public"."movie_slug_history" to "postgres";

grant delete on table "public"."movie_slug_history" to "service_role";

grant insert on table "public"."movie_slug_history" to "service_role";

grant references on table "public"."movie_slug_history" to "service_role";

grant select on table "public"."movie_slug_history" to "service_role";

grant trigger on table "public"."movie_slug_history" to "service_role";

grant truncate on table "public"."movie_slug_history" to "service_role";

grant update on table "public"."movie_slug_history" to "service_role";

grant delete on table "public"."movies" to "anon";

grant insert on table "public"."movies" to "anon";

grant references on table "public"."movies" to "anon";

grant select on table "public"."movies" to "anon";

grant trigger on table "public"."movies" to "anon";

grant truncate on table "public"."movies" to "anon";

grant update on table "public"."movies" to "anon";

grant delete on table "public"."movies" to "authenticated";

grant insert on table "public"."movies" to "authenticated";

grant references on table "public"."movies" to "authenticated";

grant select on table "public"."movies" to "authenticated";

grant trigger on table "public"."movies" to "authenticated";

grant truncate on table "public"."movies" to "authenticated";

grant update on table "public"."movies" to "authenticated";

grant delete on table "public"."movies" to "postgres";

grant insert on table "public"."movies" to "postgres";

grant references on table "public"."movies" to "postgres";

grant select on table "public"."movies" to "postgres";

grant trigger on table "public"."movies" to "postgres";

grant truncate on table "public"."movies" to "postgres";

grant update on table "public"."movies" to "postgres";

grant delete on table "public"."movies" to "service_role";

grant insert on table "public"."movies" to "service_role";

grant references on table "public"."movies" to "service_role";

grant select on table "public"."movies" to "service_role";

grant trigger on table "public"."movies" to "service_role";

grant truncate on table "public"."movies" to "service_role";

grant update on table "public"."movies" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "postgres";

grant insert on table "public"."profiles" to "postgres";

grant references on table "public"."profiles" to "postgres";

grant select on table "public"."profiles" to "postgres";

grant trigger on table "public"."profiles" to "postgres";

grant truncate on table "public"."profiles" to "postgres";

grant update on table "public"."profiles" to "postgres";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."series" to "anon";

grant insert on table "public"."series" to "anon";

grant references on table "public"."series" to "anon";

grant select on table "public"."series" to "anon";

grant trigger on table "public"."series" to "anon";

grant truncate on table "public"."series" to "anon";

grant update on table "public"."series" to "anon";

grant delete on table "public"."series" to "authenticated";

grant insert on table "public"."series" to "authenticated";

grant references on table "public"."series" to "authenticated";

grant select on table "public"."series" to "authenticated";

grant trigger on table "public"."series" to "authenticated";

grant truncate on table "public"."series" to "authenticated";

grant update on table "public"."series" to "authenticated";

grant delete on table "public"."series" to "postgres";

grant insert on table "public"."series" to "postgres";

grant references on table "public"."series" to "postgres";

grant select on table "public"."series" to "postgres";

grant trigger on table "public"."series" to "postgres";

grant truncate on table "public"."series" to "postgres";

grant update on table "public"."series" to "postgres";

grant delete on table "public"."series" to "service_role";

grant insert on table "public"."series" to "service_role";

grant references on table "public"."series" to "service_role";

grant select on table "public"."series" to "service_role";

grant trigger on table "public"."series" to "service_role";

grant truncate on table "public"."series" to "service_role";

grant update on table "public"."series" to "service_role";

grant delete on table "public"."series_genres" to "anon";

grant insert on table "public"."series_genres" to "anon";

grant references on table "public"."series_genres" to "anon";

grant select on table "public"."series_genres" to "anon";

grant trigger on table "public"."series_genres" to "anon";

grant truncate on table "public"."series_genres" to "anon";

grant update on table "public"."series_genres" to "anon";

grant delete on table "public"."series_genres" to "authenticated";

grant insert on table "public"."series_genres" to "authenticated";

grant references on table "public"."series_genres" to "authenticated";

grant select on table "public"."series_genres" to "authenticated";

grant trigger on table "public"."series_genres" to "authenticated";

grant truncate on table "public"."series_genres" to "authenticated";

grant update on table "public"."series_genres" to "authenticated";

grant delete on table "public"."series_genres" to "postgres";

grant insert on table "public"."series_genres" to "postgres";

grant references on table "public"."series_genres" to "postgres";

grant select on table "public"."series_genres" to "postgres";

grant trigger on table "public"."series_genres" to "postgres";

grant truncate on table "public"."series_genres" to "postgres";

grant update on table "public"."series_genres" to "postgres";

grant delete on table "public"."series_genres" to "service_role";

grant insert on table "public"."series_genres" to "service_role";

grant references on table "public"."series_genres" to "service_role";

grant select on table "public"."series_genres" to "service_role";

grant trigger on table "public"."series_genres" to "service_role";

grant truncate on table "public"."series_genres" to "service_role";

grant update on table "public"."series_genres" to "service_role";

grant delete on table "public"."series_slug_history" to "anon";

grant insert on table "public"."series_slug_history" to "anon";

grant references on table "public"."series_slug_history" to "anon";

grant select on table "public"."series_slug_history" to "anon";

grant trigger on table "public"."series_slug_history" to "anon";

grant truncate on table "public"."series_slug_history" to "anon";

grant update on table "public"."series_slug_history" to "anon";

grant delete on table "public"."series_slug_history" to "authenticated";

grant insert on table "public"."series_slug_history" to "authenticated";

grant references on table "public"."series_slug_history" to "authenticated";

grant select on table "public"."series_slug_history" to "authenticated";

grant trigger on table "public"."series_slug_history" to "authenticated";

grant truncate on table "public"."series_slug_history" to "authenticated";

grant update on table "public"."series_slug_history" to "authenticated";

grant delete on table "public"."series_slug_history" to "postgres";

grant insert on table "public"."series_slug_history" to "postgres";

grant references on table "public"."series_slug_history" to "postgres";

grant select on table "public"."series_slug_history" to "postgres";

grant trigger on table "public"."series_slug_history" to "postgres";

grant truncate on table "public"."series_slug_history" to "postgres";

grant update on table "public"."series_slug_history" to "postgres";

grant delete on table "public"."series_slug_history" to "service_role";

grant insert on table "public"."series_slug_history" to "service_role";

grant references on table "public"."series_slug_history" to "service_role";

grant select on table "public"."series_slug_history" to "service_role";

grant trigger on table "public"."series_slug_history" to "service_role";

grant truncate on table "public"."series_slug_history" to "service_role";

grant update on table "public"."series_slug_history" to "service_role";

grant delete on table "public"."user_movie_list" to "anon";

grant insert on table "public"."user_movie_list" to "anon";

grant references on table "public"."user_movie_list" to "anon";

grant select on table "public"."user_movie_list" to "anon";

grant trigger on table "public"."user_movie_list" to "anon";

grant truncate on table "public"."user_movie_list" to "anon";

grant update on table "public"."user_movie_list" to "anon";

grant delete on table "public"."user_movie_list" to "authenticated";

grant insert on table "public"."user_movie_list" to "authenticated";

grant references on table "public"."user_movie_list" to "authenticated";

grant select on table "public"."user_movie_list" to "authenticated";

grant trigger on table "public"."user_movie_list" to "authenticated";

grant truncate on table "public"."user_movie_list" to "authenticated";

grant update on table "public"."user_movie_list" to "authenticated";

grant delete on table "public"."user_movie_list" to "postgres";

grant insert on table "public"."user_movie_list" to "postgres";

grant references on table "public"."user_movie_list" to "postgres";

grant select on table "public"."user_movie_list" to "postgres";

grant trigger on table "public"."user_movie_list" to "postgres";

grant truncate on table "public"."user_movie_list" to "postgres";

grant update on table "public"."user_movie_list" to "postgres";

grant delete on table "public"."user_movie_list" to "service_role";

grant insert on table "public"."user_movie_list" to "service_role";

grant references on table "public"."user_movie_list" to "service_role";

grant select on table "public"."user_movie_list" to "service_role";

grant trigger on table "public"."user_movie_list" to "service_role";

grant truncate on table "public"."user_movie_list" to "service_role";

grant update on table "public"."user_movie_list" to "service_role";

grant delete on table "public"."user_series_list" to "anon";

grant insert on table "public"."user_series_list" to "anon";

grant references on table "public"."user_series_list" to "anon";

grant select on table "public"."user_series_list" to "anon";

grant trigger on table "public"."user_series_list" to "anon";

grant truncate on table "public"."user_series_list" to "anon";

grant update on table "public"."user_series_list" to "anon";

grant delete on table "public"."user_series_list" to "authenticated";

grant insert on table "public"."user_series_list" to "authenticated";

grant references on table "public"."user_series_list" to "authenticated";

grant select on table "public"."user_series_list" to "authenticated";

grant trigger on table "public"."user_series_list" to "authenticated";

grant truncate on table "public"."user_series_list" to "authenticated";

grant update on table "public"."user_series_list" to "authenticated";

grant delete on table "public"."user_series_list" to "postgres";

grant insert on table "public"."user_series_list" to "postgres";

grant references on table "public"."user_series_list" to "postgres";

grant select on table "public"."user_series_list" to "postgres";

grant trigger on table "public"."user_series_list" to "postgres";

grant truncate on table "public"."user_series_list" to "postgres";

grant update on table "public"."user_series_list" to "postgres";

grant delete on table "public"."user_series_list" to "service_role";

grant insert on table "public"."user_series_list" to "service_role";

grant references on table "public"."user_series_list" to "service_role";

grant select on table "public"."user_series_list" to "service_role";

grant trigger on table "public"."user_series_list" to "service_role";

grant truncate on table "public"."user_series_list" to "service_role";

grant update on table "public"."user_series_list" to "service_role";


  create policy "Users can manage their episode progress"
  on "public"."episode_progress"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can manage their movie progress"
  on "public"."movie_progress"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Profiles are viewable by owner"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Users can insert their own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update their own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



  create policy "Users can manage their movie list"
  on "public"."user_movie_list"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can manage their series list"
  on "public"."user_series_list"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



