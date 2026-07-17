/**
 * Genera un modelo GLB a escala real por cada inflable del catálogo:
 *  - Caja semi-transparente con las dimensiones reales (largo × ancho × alto),
 *    con la primera foto del inflable como textura en las caras laterales.
 *  - Franja naranja en el piso marcando la zona de seguridad
 *    (footprint + safety_margin_m por cada lado).
 *
 * Sube los .glb al bucket público `models` y actualiza `model_url`.
 * También sincroniza `photos` con los archivos subidos a `photos/{slug}/`.
 *
 * Uso: npm run generate-models
 * Requiere SUPABASE_SECRET_KEY en .env.local (solo local, nunca en el frontend).
 */
import { Document, NodeIO, type Material } from "@gltf-transform/core";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

// --- Carga de .env.local sin dependencias ---
function loadEnv(file = ".env.local") {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
if (!SUPABASE_URL || !SECRET_KEY) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local.\n" +
      "La secret key está en: https://supabase.com/dashboard/project/_/settings/api-keys"
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SECRET_KEY);

type Row = {
  id: string;
  slug: string;
  name: string;
  length_m: number;
  width_m: number;
  height_m: number;
  safety_margin_m: number;
  photos: string[];
};

// --- Construcción de geometría ---

type MeshData = {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
};

function emptyMesh(): MeshData {
  return { positions: [], normals: [], uvs: [], indices: [] };
}

/** Agrega un quad (4 vértices en orden CCW visto desde afuera) a la malla. */
function addQuad(
  mesh: MeshData,
  verts: [number, number, number][],
  normal: [number, number, number],
  uvs: [number, number][] = [
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0],
  ]
) {
  const base = mesh.positions.length / 3;
  for (let i = 0; i < 4; i++) {
    mesh.positions.push(...verts[i]);
    mesh.normals.push(...normal);
    mesh.uvs.push(...uvs[i]);
  }
  mesh.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

function buildBoxSides(L: number, W: number, H: number): MeshData {
  const m = emptyMesh();
  const [x0, x1, z0, z1] = [-L / 2, L / 2, -W / 2, W / 2];
  // Frente (+z), atrás (−z), derecha (+x), izquierda (−x) — foto upright en cada cara
  addQuad(m, [[x0, 0, z1], [x1, 0, z1], [x1, H, z1], [x0, H, z1]], [0, 0, 1]);
  addQuad(m, [[x1, 0, z0], [x0, 0, z0], [x0, H, z0], [x1, H, z0]], [0, 0, -1]);
  addQuad(m, [[x1, 0, z1], [x1, 0, z0], [x1, H, z0], [x1, H, z1]], [1, 0, 0]);
  addQuad(m, [[x0, 0, z0], [x0, 0, z1], [x0, H, z1], [x0, H, z0]], [-1, 0, 0]);
  return m;
}

function buildBoxTop(L: number, W: number, H: number): MeshData {
  const m = emptyMesh();
  const [x0, x1, z0, z1] = [-L / 2, L / 2, -W / 2, W / 2];
  addQuad(m, [[x0, H, z1], [x1, H, z1], [x1, H, z0], [x0, H, z0]], [0, 1, 0]);
  return m;
}

/** Franja de la zona de seguridad: marco alrededor del footprint, apoyado en el piso. */
function buildSafetyBand(L: number, W: number, margin: number): MeshData {
  const m = emptyMesh();
  const y = 0.01; // apenas sobre el piso para evitar z-fighting con el plano AR
  const [ix, iz] = [L / 2, W / 2];
  const [ox, oz] = [ix + margin, iz + margin];
  const up: [number, number, number] = [0, 1, 0];
  // Cuatro tiras que forman el marco (las de norte/sur cubren las esquinas)
  addQuad(m, [[-ox, y, oz], [ox, y, oz], [ox, y, iz], [-ox, y, iz]], up);
  addQuad(m, [[-ox, y, -iz], [ox, y, -iz], [ox, y, -oz], [-ox, y, -oz]], up);
  addQuad(m, [[ix, y, iz], [ox, y, iz], [ox, y, -iz], [ix, y, -iz]], up);
  addQuad(m, [[-ox, y, iz], [-ix, y, iz], [-ix, y, -iz], [-ox, y, -iz]], up);
  return m;
}

function addPrimitive(
  doc: Document,
  buffer: ReturnType<Document["createBuffer"]>,
  data: MeshData,
  material: Material,
  withUVs: boolean
) {
  const prim = doc
    .createPrimitive()
    .setAttribute(
      "POSITION",
      doc
        .createAccessor()
        .setType("VEC3")
        .setArray(new Float32Array(data.positions))
        .setBuffer(buffer)
    )
    .setAttribute(
      "NORMAL",
      doc
        .createAccessor()
        .setType("VEC3")
        .setArray(new Float32Array(data.normals))
        .setBuffer(buffer)
    )
    .setIndices(
      doc
        .createAccessor()
        .setType("SCALAR")
        .setArray(new Uint16Array(data.indices))
        .setBuffer(buffer)
    )
    .setMaterial(material);
  if (withUVs) {
    prim.setAttribute(
      "TEXCOORD_0",
      doc
        .createAccessor()
        .setType("VEC2")
        .setArray(new Float32Array(data.uvs))
        .setBuffer(buffer)
    );
  }
  return prim;
}

async function fetchTexture(
  url: string
): Promise<{ bytes: Uint8Array; mime: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const mime = res.headers.get("content-type") ?? "";
    // GLB solo soporta JPEG/PNG (y Quick Look en iOS es estricto con esto)
    if (!/image\/(jpeg|png)/.test(mime)) {
      console.warn(`  ⚠ Textura omitida (${mime}): usa JPG o PNG → ${url}`);
      return null;
    }
    return { bytes: new Uint8Array(await res.arrayBuffer()), mime };
  } catch {
    return null;
  }
}

async function buildGlb(row: Row, photoUrl: string | null): Promise<Uint8Array> {
  const L = Number(row.length_m);
  const W = Number(row.width_m);
  const H = Number(row.height_m);
  const margin = Number(row.safety_margin_m);

  const doc = new Document();
  doc.createScene("scene");
  const buffer = doc.createBuffer();

  const matSides = doc
    .createMaterial("caras")
    .setBaseColorFactor([1, 1, 1, 0.92])
    .setAlphaMode("BLEND")
    .setDoubleSided(true)
    .setMetallicFactor(0)
    .setRoughnessFactor(0.9);

  const texture = photoUrl ? await fetchTexture(photoUrl) : null;
  if (texture) {
    matSides.setBaseColorTexture(
      doc.createTexture("foto").setImage(texture.bytes).setMimeType(texture.mime)
    );
  } else {
    // Sin foto: caja azul semi-transparente, igual sirve para medir
    matSides.setBaseColorFactor([0.3, 0.62, 0.95, 0.8]);
  }

  const matTop = doc
    .createMaterial("techo")
    .setBaseColorFactor([0.3, 0.62, 0.95, 0.5])
    .setAlphaMode("BLEND")
    .setDoubleSided(true)
    .setMetallicFactor(0)
    .setRoughnessFactor(0.9);

  const matBand = doc
    .createMaterial("zona_seguridad")
    .setBaseColorFactor([1, 0.45, 0.05, 0.55])
    .setAlphaMode("BLEND")
    .setDoubleSided(true)
    .setMetallicFactor(0)
    .setRoughnessFactor(1);

  const mesh = doc
    .createMesh(row.slug)
    .addPrimitive(addPrimitive(doc, buffer, buildBoxSides(L, W, H), matSides, true))
    .addPrimitive(addPrimitive(doc, buffer, buildBoxTop(L, W, H), matTop, false))
    .addPrimitive(
      addPrimitive(doc, buffer, buildSafetyBand(L, W, margin), matBand, false)
    );

  const node = doc.createNode(row.slug).setMesh(mesh);
  doc.getRoot().listScenes()[0].addChild(node);

  return new NodeIO().writeBinary(doc);
}

// --- Sincronización de fotos desde Storage ---
async function photosFromStorage(slug: string): Promise<string[]> {
  const { data, error } = await admin.storage.from("photos").list(slug);
  if (error || !data) return [];
  return data
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (f) => admin.storage.from("photos").getPublicUrl(`${slug}/${f.name}`).data.publicUrl
    );
}

async function main() {
  const { data: rows, error } = await admin
    .from("inflatables")
    .select("id, slug, name, length_m, width_m, height_m, safety_margin_m, photos");
  if (error) throw error;
  if (!rows?.length) {
    console.log("No hay inflables en la base. Nada que generar.");
    return;
  }

  for (const row of rows as Row[]) {
    console.log(`▶ ${row.name} (${row.slug})`);

    const storagePhotos = await photosFromStorage(row.slug);
    const photos = storagePhotos.length ? storagePhotos : row.photos ?? [];
    if (storagePhotos.length) {
      console.log(`  ${storagePhotos.length} foto(s) encontradas en photos/${row.slug}/`);
    }

    const glb = await buildGlb(row, photos[0] ?? null);
    console.log(`  GLB generado: ${(glb.byteLength / 1024).toFixed(1)} KB`);

    const path = `${row.slug}.glb`;
    const { error: upErr } = await admin.storage
      .from("models")
      .upload(path, glb, { contentType: "model/gltf-binary", upsert: true });
    if (upErr) throw new Error(`Error subiendo ${path}: ${upErr.message}`);

    const publicUrl = admin.storage.from("models").getPublicUrl(path).data.publicUrl;
    const model_url = `${publicUrl}?v=${Date.now()}`;

    const { error: dbErr } = await admin
      .from("inflatables")
      .update({ model_url, photos, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (dbErr) throw new Error(`Error actualizando ${row.slug}: ${dbErr.message}`);

    console.log(`  ✅ ${model_url}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
