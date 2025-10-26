import connectToDB from '../lib/db';
import Product from '../models/Product';
import { normalizeStr } from '../lib/normalize';
import type { AnyBulkWriteOperation } from 'mongoose';

interface ProductLean {
  _id: unknown;
  name?: string | null;
  name_normalized?: string | null;
  attributes?: {
    brand?: string | null;
    brand_normalized?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

type Opts = {
  dry: boolean;
  force: boolean;
  batchSize: number;
  limit?: number;
  yes: boolean;
};

async function run(opts: Opts) {
  await connectToDB();

  if (!opts.dry && !opts.yes) {
    console.error('Danger: non-dry run requires --yes to proceed. Add --dry to preview or --yes to confirm.');
    process.exit(1);
  }

  const onlyMissingFilter = {
    $or: [
      { name_normalized: { $in: [null, ''] } },
      { 'attributes.brand_normalized': { $in: [null, ''] } }
    ]
  };

  const filter = opts.force ? {} : onlyMissingFilter;
  const projection = { name: 1, 'attributes.brand': 1, name_normalized: 1, 'attributes.brand_normalized': 1 };

  const cursor = Product.find(filter, projection).lean().cursor() as AsyncIterable<ProductLean>;

  let ops: AnyBulkWriteOperation[] = [];
  let processed = 0;
  let updated = 0;
  let skipped = 0;

  const flush = async () => {
    if (ops.length === 0) return;
    if (opts.dry) {
      ops = [];
      return;
    }
    try {
      const res = await Product.bulkWrite(ops, { ordered: false });
      updated += (res.modifiedCount || 0) + (res.upsertedCount || 0);
    } catch (err) {
      console.error('Bulk write error:', err);
    }
    ops = [];
  };

  for await (const doc of cursor) {
    processed += 1;
    try {
      const nameNorm = normalizeStr(doc.name || '');
      const brandNorm = normalizeStr(doc.attributes?.brand || '');

      const needName = opts.force || !(doc.name_normalized);
      const needBrand = opts.force || !(doc.attributes?.brand_normalized);

      // Only push an update if values would change (avoid unnecessary writes)
      const shouldUpdateName = needName && (doc.name_normalized !== nameNorm);
      const shouldUpdateBrand = needBrand && (doc.attributes?.brand_normalized !== brandNorm);

      if (shouldUpdateName || shouldUpdateBrand) {
        const setFields: Record<string, string> = {};
        if (shouldUpdateName) setFields.name_normalized = nameNorm;
        if (shouldUpdateBrand) setFields['attributes.brand_normalized'] = brandNorm;

        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: setFields }
          }
        });
      } else {
        skipped += 1;
      }

      if (ops.length >= opts.batchSize) {
        await flush();
      }

      if (opts.limit && processed >= opts.limit) break;
    } catch (err) {
      console.error('Error processing doc:', doc._id, err);
    }
  }

  await flush();
}

const argv = process.argv.slice(2);
const opts: Opts = {
  dry: argv.includes('--dry'),
  force: argv.includes('--force'),
  batchSize: (() => {
    const m = argv.find(a => a.startsWith('--batchSize='));
    if (!m) return 500;
    const v = parseInt(m.split('=')[1], 10);
    return Number.isFinite(v) && v > 0 ? v : 500;
  })(),
  limit: (() => {
    const m = argv.find(a => a.startsWith('--limit='));
    if (!m) return undefined;
    const v = parseInt(m.split('=')[1], 10);
    return Number.isFinite(v) && v > 0 ? v : undefined;
  })(),
  yes: argv.includes('--yes')
};

run(opts).catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
