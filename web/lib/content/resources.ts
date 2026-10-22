import { prisma } from "@/lib/db";
import { cached, TAGS } from "@/lib/cache";
import { paginate, RESOURCES_PER_PAGE, resourceWhere, type ResourceFilters } from "@/lib/filters";
import { resourceCard, resourceInclude } from "./shape";
import type { Paged, ResourceCard } from "./types";

export async function _searchResources(f: ResourceFilters): Promise<Paged<ResourceCard>> {
  const where = resourceWhere(f);
  const total = await prisma.resource.count({ where });
  const { page, pages, skip, take } = paginate(total, f.page, RESOURCES_PER_PAGE);
  const rows = await prisma.resource.findMany({
    where,
    orderBy: [{ date: "desc" }, { id: "asc" }],
    skip,
    take,
    include: resourceInclude,
  });
  return { items: rows.map(resourceCard), total, page, pages };
}

export const searchResources = cached(_searchResources, "resources:search", [TAGS.resources, TAGS.tests, TAGS.media]);
