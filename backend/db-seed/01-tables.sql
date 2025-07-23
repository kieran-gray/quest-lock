CREATE TABLE lock(
    id uuid NOT NULL,
    vault_id uuid NOT NULL,
    label TEXT,
    total_shares SMALLINT NOT NULL,
    threshold SMALLINT NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY(id)
);

CREATE TABLE quest(
    id uuid NOT NULL,
    lock_id UUID NOT NULL REFERENCES locks(id) ON DELETE CASCADE,
    share TEXT NOT NULL,
    quest_type TEXT NOT NULL,
    status TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY(id)
);

CREATE INDEX idx_quests_lock_id ON quests(lock_id);