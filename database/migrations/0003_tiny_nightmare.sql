ALTER TABLE "children" DROP COLUMN IF EXISTS "team_id";
ALTER TABLE "children" ADD COLUMN IF NOT EXISTS "organization_id" uuid;
ALTER TABLE "children" ADD CONSTRAINT IF NOT EXISTS "children_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL; 