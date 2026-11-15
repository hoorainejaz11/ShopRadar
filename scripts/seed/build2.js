const fs = require('fs');
const { vendors } = require('./catalog');
const photos = require('./shop-photos.json');
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
const DEFAULT = 'data:image/png;base64,' + fs.readFileSync('default-sr.png').toString('base64');

// category / vendor -> image pool (Google Images result sets, 0..13)
const poolOf = (v) => {
  const s = slug(v.n);
  const women = ['tameem.designers', 'dhagay', 'aleez.lahore', 'anabiya.collection', 'ad.closet', 'maryam.collections', 'azmat.clothing'];
  const fabric = ['saleem.fabrics', 'portia.fabrics', 'qumash.by.hs.group'];
  if (v.c === 'Clothing') return fabric.includes(s) ? 2 : women.includes(s) ? 1 : s === 'expandable.store' ? 5 : 0;
  return { Footwear: 3, 'Beauty & Personal Care': 4, 'Baby & Kids': 5, 'Bags & Luggage': 6, Electronics: 7, Jewelry: 8,
    'Food & Beverages': ['zero.degree.gulberg', 'happy.tea'].includes(s) ? 9 : 10, 'Health & Wellness': 11,
    'Home & Living': 12, 'Books & Media': 13 }[v.c];
};

const vals = [], pvals = [];
vendors.forEach((v) => {
  const s = slug(v.n);
  vals.push(`(${q(s)},${q(v.n)},${q(v.a)},${v.lat},${v.lng},${v.p ? q(v.p) : 'null'},${q(v.m)},${q(v.c)},${photos[s] ? q(photos[s]) : 'null'})`);
  v.pr.forEach(([name, price, disc]) => pvals.push(`(${q(s)},${q(name)},${price},${disc},${poolOf(v)})`));
});

const sql = `insert into "Vendors" ("BusinessName","CompanyAddress","City","StateProvince","Country","Latitude","Longitude","Contact","Market","Email","ShopCategory","Image")
select t.n,t.a,'Lahore','Punjab','Pakistan',t.la::float8,t.lo::float8,t.ph,t.m,t.s||'@shopradar-demo.pk',t.c,coalesce(t.im,${q(DEFAULT)}) from (values
${vals.join(',\n')}
) as t(s,n,a,la,lo,ph,m,c,im)
on conflict ("Email") do nothing;
with p as (select s,n,pr,d,pool,row_number() over (partition by pool order by ord) as rn from (select *, row_number() over () as ord from (values
${pvals.join(',\n')}
) as x(s,n,pr,d,pool)) y),
pi as (select pool, row_number() over (partition by pool order by id) as rn, url from seed_pool)
insert into "Products" ("VendorID","ProductName","ProductCategory","Price","Image","Discount","ProductDescription")
select v."VendorID", p.n, v."ShopCategory", p.pr, pi.url, p.d, p.n||' from '||v."BusinessName"||', '||v."Market"||' Lahore. Quality item at a fair price.'
from p join "Vendors" v on v."Email"=p.s||'@shopradar-demo.pk' join pi on pi.pool=p.pool and pi.rn=p.rn
where not exists (select 1 from "Products" x where x."VendorID"=v."VendorID" and x."ProductName"=p.n);
drop table seed_pool;
`;
fs.writeFileSync('seed2.sql', sql);
console.log(vendors.length, pvals.length, sql.length);
const need = {}; vendors.forEach((v) => (need[poolOf(v)] = (need[poolOf(v)] || 0) + v.pr.length)); console.log(JSON.stringify(need));
