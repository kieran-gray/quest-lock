CREATE TABLE locks(
    id uuid NOT NULL,
    user_id text NOT NULL,
    label text,
    total_shares smallint NOT NULL,
    threshold smallint NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY(id)
);
CREATE INDEX idx_locks_user_id ON public.locks USING btree (user_id);
CREATE INDEX idx_locks_lock_id_user_id ON public.locks USING btree (id, user_id);

CREATE TABLE quests(
    id uuid NOT NULL,
    lock_id uuid NOT NULL REFERENCES locks(id) ON DELETE CASCADE,
    share text NOT NULL,
    quest_type text NOT NULL,
    status text NOT NULL,
    "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY(id)
);
CREATE INDEX idx_quests_lock_id ON public.quests USING btree (lock_id);
