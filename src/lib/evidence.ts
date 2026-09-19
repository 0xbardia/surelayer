export const MAX_EVIDENCE_SOURCES = 4;
const HASH_PATTERN = /^sha256:[0-9a-f]{64}$/;

export type EvidenceCommitments = { urls: string[]; hashes: string[] };
export type ArtifactCommitment = { ref: string; hash: string };

function lines(value: string): string[] {
  const result = value.split(/\r?\n/).map((item) => item.trim());
  while (result.at(-1) === "") result.pop();
  if (result.some((item) => item === "")) throw new Error("Evidence URL and hash lines cannot contain gaps.");
  return result;
}

function httpUrl(value: string, label: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid http:// or https:// URL.`);
  }
  if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
    throw new Error(`${label} must be a valid http:// or https:// URL.`);
  }
  return value;
}

function hash(value: string, label: string): string {
  if (!HASH_PATTERN.test(value)) throw new Error(`${label} must use sha256:<64 lowercase hex>.`);
  return value;
}

export function parseEvidence(urlValue: string, hashValue: string, maxSources = MAX_EVIDENCE_SOURCES): EvidenceCommitments {
  const urls = lines(urlValue);
  const hashes = lines(hashValue);
  if (urls.length !== hashes.length) throw new Error("Every evidence URL must have a corresponding canonical SHA-256 hash.");
  if (urls.length > maxSources) throw new Error(`At most ${maxSources} evidence sources are allowed.`);
  return {
    urls: urls.map((url, index) => httpUrl(url, `Evidence URL ${index + 1}`)),
    hashes: hashes.map((value, index) => hash(value, `Evidence hash ${index + 1}`)),
  };
}

export function parseArtifact(refValue: string, hashValue: string): ArtifactCommitment {
  const ref = refValue.trim();
  const hashValueTrimmed = hashValue.trim();
  if (!ref && !hashValueTrimmed) return { ref: "", hash: "" };
  if (!ref || !hashValueTrimmed) throw new Error("Artifact reference and hash must both be provided or both empty.");
  return { ref: httpUrl(ref, "Artifact reference"), hash: hash(hashValueTrimmed, "Artifact hash") };
}
