-- This bridge intentionally sorts after the legacy 20260723000000_init and
-- before 20260723100000_init. It frees the legacy relation/type names without
-- changing or dropping any legacy data.
--
-- If 20260723100000_init has a failed row in _prisma_migrations, mark that
-- attempt rolled back before running migrate deploy. Prisma can then apply
-- this pending bridge before retrying the unchanged init migration.

BEGIN;

DO $archive_legacy$
DECLARE
    users_is_legacy BOOLEAN;
    players_is_legacy BOOLEAN;
    users_archive_exists BOOLEAN;
    players_archive_exists BOOLEAN;
    catalog_item RECORD;
    archived_name TEXT;
BEGIN
    users_is_legacy :=
        to_regclass('public.users') IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
              AND column_name = 'email'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users'
              AND column_name = 'username'
        );

    players_is_legacy :=
        to_regclass('public.players') IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'players'
              AND column_name = 'fullName'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'players'
              AND column_name = 'name'
        );

    IF users_is_legacy THEN
        IF to_regclass('public.users_legacy') IS NOT NULL THEN
            RAISE EXCEPTION
                'Legacy users tablosu arsivlenemedi: public.users_legacy zaten var';
        END IF;
        EXECUTE 'ALTER TABLE public."users" RENAME TO "users_legacy"';
    END IF;

    IF players_is_legacy THEN
        IF to_regclass('public.players_legacy') IS NOT NULL THEN
            RAISE EXCEPTION
                'Legacy players tablosu arsivlenemedi: public.players_legacy zaten var';
        END IF;
        EXECUTE 'ALTER TABLE public."players" RENAME TO "players_legacy"';
    END IF;

    -- Rename only enums with the legacy label set. New-schema enums are a no-op.
    IF EXISTS (
        SELECT 1
        FROM pg_type AS enum_type
        JOIN pg_namespace AS enum_namespace
          ON enum_namespace.oid = enum_type.typnamespace
        JOIN pg_enum AS enum_value
          ON enum_value.enumtypid = enum_type.oid
        WHERE enum_namespace.nspname = 'public'
          AND enum_type.typname = 'Role'
          AND enum_value.enumlabel = 'USER'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM pg_type AS existing_type
            JOIN pg_namespace AS existing_namespace
              ON existing_namespace.oid = existing_type.typnamespace
            WHERE existing_namespace.nspname = 'public'
              AND existing_type.typname = 'Role_legacy'
        ) THEN
            RAISE EXCEPTION
                'Legacy Role enum arsivlenemedi: public."Role_legacy" zaten var';
        END IF;
        EXECUTE 'ALTER TYPE public."Role" RENAME TO "Role_legacy"';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM pg_type AS enum_type
        JOIN pg_namespace AS enum_namespace
          ON enum_namespace.oid = enum_type.typnamespace
        JOIN pg_enum AS enum_value
          ON enum_value.enumtypid = enum_type.oid
        WHERE enum_namespace.nspname = 'public'
          AND enum_type.typname = 'Position'
          AND enum_value.enumlabel = 'GOALKEEPER'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM pg_type AS existing_type
            JOIN pg_namespace AS existing_namespace
              ON existing_namespace.oid = existing_type.typnamespace
            WHERE existing_namespace.nspname = 'public'
              AND existing_type.typname = 'Position_legacy'
        ) THEN
            RAISE EXCEPTION
                'Legacy Position enum arsivlenemedi: public."Position_legacy" zaten var';
        END IF;
        EXECUTE 'ALTER TYPE public."Position" RENAME TO "Position_legacy"';
    END IF;

    users_archive_exists :=
        to_regclass('public.users_legacy') IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users_legacy'
              AND column_name = 'email'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'users_legacy'
              AND column_name = 'username'
        );

    players_archive_exists :=
        to_regclass('public.players_legacy') IS NOT NULL
        AND EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'players_legacy'
              AND column_name = 'fullName'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'players_legacy'
              AND column_name = 'name'
        );

    -- Constraint names survive ALTER TABLE RENAME and their backing index names
    -- can collide with the new init. Move every legacy constraint name aside.
    FOR catalog_item IN
        SELECT
            table_namespace.nspname AS schema_name,
            legacy_table.relname AS table_name,
            legacy_table.oid AS table_oid,
            legacy_constraint.conname AS object_name
        FROM pg_constraint AS legacy_constraint
        JOIN pg_class AS legacy_table
          ON legacy_table.oid = legacy_constraint.conrelid
        JOIN pg_namespace AS table_namespace
          ON table_namespace.oid = legacy_table.relnamespace
        WHERE table_namespace.nspname = 'public'
          AND (
              (users_archive_exists AND legacy_table.relname = 'users_legacy')
              OR
              (players_archive_exists AND legacy_table.relname = 'players_legacy')
          )
    LOOP
        IF right(catalog_item.object_name, 7) <> '_legacy' THEN
            archived_name := left(catalog_item.object_name, 56) || '_legacy';

            IF EXISTS (
                SELECT 1
                FROM pg_constraint AS existing_constraint
                WHERE existing_constraint.conrelid = catalog_item.table_oid
                  AND existing_constraint.conname = archived_name
            ) THEN
                RAISE EXCEPTION
                    'Constraint arsivlenemedi: %.% zaten var',
                    catalog_item.table_name,
                    archived_name;
            END IF;

            EXECUTE format(
                'ALTER TABLE %I.%I RENAME CONSTRAINT %I TO %I',
                catalog_item.schema_name,
                catalog_item.table_name,
                catalog_item.object_name,
                archived_name
            );
        END IF;
    END LOOP;

    -- Rename non-constraint indexes too. PK/unique backing indexes renamed by
    -- ALTER TABLE above already end in _legacy and are skipped here.
    FOR catalog_item IN
        SELECT
            index_namespace.nspname AS schema_name,
            index_namespace.oid AS schema_oid,
            legacy_index.relname AS object_name
        FROM pg_index AS index_metadata
        JOIN pg_class AS legacy_index
          ON legacy_index.oid = index_metadata.indexrelid
        JOIN pg_class AS legacy_table
          ON legacy_table.oid = index_metadata.indrelid
        JOIN pg_namespace AS index_namespace
          ON index_namespace.oid = legacy_index.relnamespace
        WHERE index_namespace.nspname = 'public'
          AND (
              (users_archive_exists AND legacy_table.relname = 'users_legacy')
              OR
              (players_archive_exists AND legacy_table.relname = 'players_legacy')
          )
    LOOP
        IF right(catalog_item.object_name, 7) <> '_legacy' THEN
            archived_name := left(catalog_item.object_name, 56) || '_legacy';

            IF EXISTS (
                SELECT 1
                FROM pg_class AS existing_relation
                WHERE existing_relation.relnamespace = catalog_item.schema_oid
                  AND existing_relation.relname = archived_name
            ) THEN
                RAISE EXCEPTION
                    'Index arsivlenemedi: public.% zaten var',
                    archived_name;
            END IF;

            EXECUTE format(
                'ALTER INDEX %I.%I RENAME TO %I',
                catalog_item.schema_name,
                catalog_item.object_name,
                archived_name
            );
        END IF;
    END LOOP;
END
$archive_legacy$;

COMMIT;
