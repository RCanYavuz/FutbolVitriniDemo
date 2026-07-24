-- This migration runs after 20260723100000_init. It copies the fields that
-- have equivalents in the new application schema while keeping both legacy
-- archive tables intact for fields with no new-schema equivalent.

BEGIN;

DO $import_legacy$
DECLARE
    missing_columns TEXT;
    imported_users BIGINT := 0;
    imported_players BIGINT := 0;
BEGIN
    IF to_regclass('public.users_legacy') IS NOT NULL THEN
        IF to_regclass('public.users') IS NULL OR NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
              AND column_name = 'username'
        ) THEN
            RAISE EXCEPTION
                'Legacy kullanicilar kopyalanamadi: yeni public.users tablosu hazir degil';
        END IF;

        SELECT string_agg(required_column.name, ', ' ORDER BY required_column.name)
        INTO missing_columns
        FROM unnest(
            ARRAY[
                'id',
                'email',
                'passwordHash',
                'displayName',
                'role',
                'refreshTokenHash',
                'createdAt',
                'updatedAt'
            ]
        ) AS required_column(name)
        WHERE NOT EXISTS (
            SELECT 1
            FROM information_schema.columns AS legacy_column
            WHERE legacy_column.table_schema = 'public'
              AND legacy_column.table_name = 'users_legacy'
              AND legacy_column.column_name = required_column.name
        );

        IF missing_columns IS NOT NULL THEN
            RAISE EXCEPTION
                'public.users_legacy beklenen kolonlari icermiyor: %',
                missing_columns;
        END IF;

        EXECUTE $copy_users$
            WITH normalized_users AS (
                SELECT
                    legacy_user.*,
                    'legacy_' || trim(
                        BOTH '_' FROM lower(
                            regexp_replace(
                                split_part(coalesce(legacy_user."email", ''), '@', 1),
                                '[^a-zA-Z0-9_]+',
                                '_',
                                'g'
                            )
                        )
                    ) AS username_seed
                FROM public."users_legacy" AS legacy_user
            ),
            based_users AS (
                SELECT
                    normalized_user.*,
                    CASE
                        WHEN char_length(normalized_user.username_seed) >= 3
                            THEN left(normalized_user.username_seed, 30)
                        ELSE
                            'legacy_' || substr(md5(normalized_user."id"), 1, 16)
                    END AS base_username
                FROM normalized_users AS normalized_user
            ),
            ranked_users AS (
                SELECT
                    based_user.*,
                    count(*) OVER (
                        PARTITION BY based_user.base_username
                    ) AS username_count,
                    row_number() OVER (
                        PARTITION BY based_user.base_username
                        ORDER BY based_user."id"
                    ) AS username_ordinal
                FROM based_users AS based_user
            )
            INSERT INTO public."users" (
                "id",
                "username",
                "email",
                "displayName",
                "passwordHash",
                "role",
                "subRole",
                "avatarUrl",
                "status",
                "organization",
                "expertise",
                "refreshTokenHash",
                "createdAt",
                "updatedAt"
            )
            SELECT
                legacy_user."id",
                CASE
                    WHEN legacy_user.username_count = 1
                        THEN legacy_user.base_username
                    ELSE
                        left(legacy_user.base_username, 20)
                        || '_'
                        || lpad(to_hex(legacy_user.username_ordinal), 9, '0')
                END,
                legacy_user."email",
                legacy_user."displayName",
                legacy_user."passwordHash",
                CASE legacy_user."role"::text
                    WHEN 'ADMIN' THEN 'ADMIN'::public."Role"
                    ELSE 'PLAYER'::public."Role"
                END,
                CASE legacy_user."role"::text
                    WHEN 'ADMIN' THEN 'ADMIN'::public."SubRole"
                    ELSE 'PLAYER'::public."SubRole"
                END,
                '',
                'ACTIVE'::public."AccountStatus",
                NULL,
                NULL,
                legacy_user."refreshTokenHash",
                legacy_user."createdAt",
                legacy_user."updatedAt"
            FROM ranked_users AS legacy_user
            ON CONFLICT ("id") DO NOTHING
        $copy_users$;

        GET DIAGNOSTICS imported_users = ROW_COUNT;
        RAISE NOTICE 'Legacy kullanici aktarimi tamamlandi: % kayit eklendi', imported_users;
    END IF;

    missing_columns := NULL;

    IF to_regclass('public.players_legacy') IS NOT NULL THEN
        IF to_regclass('public.players') IS NULL OR NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'players'
              AND column_name = 'name'
        ) THEN
            RAISE EXCEPTION
                'Legacy oyuncular kopyalanamadi: yeni public.players tablosu hazir degil';
        END IF;

        SELECT string_agg(required_column.name, ', ' ORDER BY required_column.name)
        INTO missing_columns
        FROM unnest(
            ARRAY[
                'id',
                'fullName',
                'position',
                'birthDate',
                'currentClub',
                'ownerId',
                'createdAt',
                'updatedAt'
            ]
        ) AS required_column(name)
        WHERE NOT EXISTS (
            SELECT 1
            FROM information_schema.columns AS legacy_column
            WHERE legacy_column.table_schema = 'public'
              AND legacy_column.table_name = 'players_legacy'
              AND legacy_column.column_name = required_column.name
        );

        IF missing_columns IS NOT NULL THEN
            RAISE EXCEPTION
                'public.players_legacy beklenen kolonlari icermiyor: %',
                missing_columns;
        END IF;

        EXECUTE $copy_players$
            INSERT INTO public."players" (
                "id",
                "name",
                "age",
                "position",
                "team",
                "aiScore",
                "matchPercentage",
                "aiReasoning",
                "imageUrl",
                "pace",
                "passing",
                "defending",
                "physical",
                "tackling",
                "vision",
                "dribbling",
                "shooting",
                "sprintSpeed",
                "shotPower",
                "passingAcc",
                "ownerId",
                "createdAt",
                "updatedAt"
            )
            SELECT
                legacy_player."id",
                coalesce(nullif(legacy_player."fullName", ''), 'Legacy Oyuncu'),
                coalesce(
                    greatest(
                        extract(
                            YEAR FROM age(
                                CURRENT_DATE,
                                legacy_player."birthDate"::date
                            )
                        )::integer,
                        0
                    ),
                    0
                ),
                CASE legacy_player."position"::text
                    WHEN 'GOALKEEPER' THEN 'GK'::public."Position"
                    WHEN 'DEFENDER' THEN 'DF'::public."Position"
                    WHEN 'MIDFIELDER' THEN 'MF'::public."Position"
                    WHEN 'FORWARD' THEN 'FW'::public."Position"
                    ELSE 'MF'::public."Position"
                END,
                coalesce(nullif(legacy_player."currentClub", ''), 'Kulupsuz'),
                5::double precision,
                NULL,
                NULL,
                '',
                50,
                50,
                50,
                50,
                50,
                50,
                50,
                50,
                50,
                50,
                50,
                coalesce(
                    (
                        SELECT new_owner."id"
                        FROM public."users" AS new_owner
                        WHERE new_owner."id" = legacy_player."ownerId"
                    ),
                    (
                        SELECT new_owner."id"
                        FROM public."users_legacy" AS legacy_owner
                        JOIN public."users" AS new_owner
                          ON new_owner."email" = legacy_owner."email"
                        WHERE legacy_owner."id" = legacy_player."ownerId"
                        LIMIT 1
                    )
                ),
                legacy_player."createdAt",
                legacy_player."updatedAt"
            FROM public."players_legacy" AS legacy_player
            ON CONFLICT ("id") DO NOTHING
        $copy_players$;

        GET DIAGNOSTICS imported_players = ROW_COUNT;
        RAISE NOTICE 'Legacy oyuncu aktarimi tamamlandi: % kayit eklendi', imported_players;
    END IF;
END
$import_legacy$;

COMMIT;
