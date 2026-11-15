const fs = require('fs');
const { vendors } = require('./catalog');
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const img = (prompt, seed) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=480&height=480&nologo=true&seed=${seed}`;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
const storeLook = {
  Clothing: 'clothing boutique shop front', Footwear: 'shoe store front', Jewelry: 'jewellery shop front',
  Electronics: 'electronics mobile shop front', 'Beauty & Personal Care': 'cosmetics beauty store front',
  'Baby & Kids': 'baby kids store front', 'Bags & Luggage': 'bags gift shop front',
  'Food & Beverages': 'food shop front', 'Health & Wellness': 'health store front',
  'Home & Living': 'home decor shop front', 'Books & Media': 'stationery shop front',
};

let seed = 1000;
const vals = [], pvals = [], urls = [];
vendors.forEach((v) => {
  const email = `${slug(v.n)}@shopradar-demo.pk`;
  const vp = `${storeLook[v.c]}, busy Lahore bazaar, photo`;
  const vs = ++seed;
  urls.push(img(vp, vs));
  vals.push(`(${q(v.n)},${q(v.a)},${v.lat}::float8,${v.lng}::float8,${v.p ? q(v.p) : 'null::text'},${q(v.m)},${q(email)},${q(v.c)},${q(vp)},${vs})`);
  v.pr.forEach(([name, price, disc, query]) => {
    const pp = `${query}, product photo, white background`;
    const ps = ++seed;
    urls.push(img(pp, ps));
    pvals.push(`(${q(email)},${q(name)},${q(v.c)},${price},${q(query)},${ps},${disc})`);
  });
});

const U = (p, sd) =>
  `'https://image.pollinations.ai/prompt/'||replace(replace(${p},' ','%20'),',','%2C')||'?width=480&height=480&nologo=true&seed='||${sd}`;

const sql = `insert into "Vendors" ("BusinessName","CompanyAddress","City","StateProvince","Country","Latitude","Longitude","Contact","Market","Email","ShopCategory","Image")
select a,b,'Lahore','Punjab','Pakistan',la,lo,ph,m,e,c,${U('ip', 'sd')} from (values
${vals.join(',\n')}
) as t(a,b,la,lo,ph,m,e,c,ip,sd)
on conflict ("Email") do nothing;
insert into "Products" ("VendorID","ProductName","ProductCategory","Price","Image","Discount","ProductDescription")
select v."VendorID", p.n, p.c, p.pr, ${U("p.ip||', product photo, white background'", 'p.sd')}, p.d, p.n||' from '||v."BusinessName"||', '||v."Market"||' Lahore. Quality item at a fair price.' from (values
${pvals.join(',\n')}
) as p(e,n,c,pr,ip,sd,d) join "Vendors" v on v."Email"=p.e
where not exists (select 1 from "Products" x where x."VendorID"=v."VendorID" and x."ProductName"=p.n);
`;
fs.writeFileSync('seed.sql', sql);
fs.writeFileSync('image-urls.txt', urls.join('\n'));
console.log(vendors.length, pvals.length, urls.length, sql.length);
