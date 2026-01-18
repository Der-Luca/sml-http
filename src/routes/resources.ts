import { Router, Response } from "express";
import { optionalAuth, AuthenticatedRequest } from "../middleware/auth";
import { getResource, upsertResource, listResources, getOwner } from "../db/resources";
import { canRead, canWrite } from "../resources/permissions";

const router = Router();

function toSingleString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

router.put(
  "/r/:bundle/:filename",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const bundle = toSingleString(req.params.bundle);
    const filename = toSingleString(req.params.filename);

    if (!bundle || !filename) {
      return res.status(400).json({ error: "Invalid path parameters" });
    }

    const requesterEmail: string | null = req.user?.emailAddress ?? null;

    const header = req.header("Public-Access");

const visibility =
  header === "write" || header === "public-write"
    ? "public-write"
    : header === "none" || header === "public-none"
    ? "public-none"
    : "public-read";


    const existingOwner = await getOwner(bundle);


    if (!existingOwner) {
      if (!requesterEmail) {
        return res
          .status(401)
          .json({ error: "Authentication required to create bundle" });
      }
    } else {
      const allowed = canWrite(visibility, existingOwner, requesterEmail);

      if (!allowed) {
        return res.status(403).json({ error: "Write access denied" });
      }
    }

    const ownerEmail = existingOwner ?? requesterEmail!;

    await upsertResource(bundle, filename, ownerEmail, visibility, req.body);

    return res.status(201).json({ status: "created" });
  }
);

router.get(
  "/r/:bundle/:filename",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const bundle = toSingleString(req.params.bundle);
    const filename = toSingleString(req.params.filename);

    if (!bundle || !filename) {
      return res.status(400).json({ error: "Invalid path parameters" });
    }

    const resource = await getResource(bundle, filename);

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    const requesterEmail: string | null = req.user?.emailAddress ?? null;


    const allowed = canRead(resource.visibility, resource.owner_email, requesterEmail);


    if (!allowed) {
      return res.status(403).json({ error: "Read access denied" });
    }

    return res.status(200).json(resource.content);
  }
);

router.get(
  "/r/:bundle",
  optionalAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    const bundle = toSingleString(req.params.bundle);

    if (!bundle) {
      return res.status(400).json({ error: "Invalid path parameters" });
    }

    const requesterEmail: string | null = req.user?.emailAddress ?? null;
    const resources = await listResources(bundle);



    const readable = resources.filter((r) =>
      canRead(r.visibility, r.owner_email, requesterEmail)
    );


    if (readable.length === 0) {
      return res.status(403).json({ error: "No readable resources" });
    }

    return res.status(200).json(
      readable.map((r) => ({
        [r.filename]: r.content,
      }))
    );
  }
);

export default router;
