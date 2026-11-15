// Demo seed catalog: real shops scraped from Google Maps (Liberty Market & Township Market, Lahore)
// + demo products. Product tuple: [name, priceRs, discountPct, imageSearchQuery]
const L = 'Liberty Market', T = 'Township Market';

const vendors = [
  // ---------------- Liberty Market (Gulberg III) ----------------
  { m: L, n: 'Rangoli Kurta Lahore', c: 'Clothing', a: 'Commercial Zone, Liberty Market, Gulberg III', lat: 31.5092619, lng: 74.345438, p: '+92 336 8555616', pr: [
    ['Men Cotton Kurta White', 3200, 10, 'men white cotton kurta pakistani'], ['Embroidered Kurta Navy', 4800, 15, 'men embroidered kurta navy blue'], ['Kurta Shalwar Suit Grey', 5500, 0, 'men shalwar kameez grey suit']] },
  { m: L, n: 'Tameem Designers', c: 'Clothing', a: 'Shop 3, Crystal Tower, Liberty Market, Gulberg III', lat: 31.5090969, lng: 74.3453238, p: '+92 345 6981736', pr: [
    ['Bridal Lehnga Maroon', 68000, 5, 'maroon bridal lehnga pakistani'], ['Chiffon Party Dress', 9500, 20, 'pakistani chiffon party dress women'], ['Formal Gharara Set', 14500, 10, 'gharara set pakistani wedding']] },
  { m: L, n: 'DHAGAY', c: 'Clothing', a: 'Shop 5/12, Commercial Zone, Liberty Market, Gulberg III', lat: 31.5105821, lng: 74.3460815, p: '+92 321 0000957', pr: [
    ['Lawn 3-Piece Unstitched', 4200, 25, 'lawn 3 piece unstitched suit pakistan'], ['Printed Kurti Floral', 2600, 0, 'printed floral kurti women'], ['Embroidered Dupatta', 1800, 10, 'embroidered dupatta pakistani']] },
  { m: L, n: 'Uniworth', c: 'Clothing', a: '93 Shoppe, Noor Jahan Rd, Gulberg III', lat: 31.5081612, lng: 74.3475395, p: '+92 42 111 789 456', pr: [
    ['Slim Fit Formal Shirt', 3900, 15, 'men formal dress shirt blue'], ['Chino Trousers Beige', 4500, 0, 'men chino trousers beige'], ['Wool Blazer Charcoal', 14900, 20, 'men charcoal blazer suit jacket']] },
  { m: L, n: 'Cambridge', c: 'Clothing', a: 'Plot 22A, 94 Noor Jahan Rd, Gulberg III', lat: 31.5080283, lng: 74.3480196, p: '+92 42 35771709', pr: [
    ['Polo T-Shirt Navy', 2800, 10, 'men navy polo t shirt'], ['Denim Jeans Dark Wash', 5200, 0, 'men dark denim jeans'], ['Casual Check Shirt', 3400, 25, 'men casual check shirt flannel']] },
  { m: L, n: 'Aleez Lahore', c: 'Clothing', a: '133-G, Liberty Plaza, Liberty Market, Gulberg III', lat: 31.5093485, lng: 74.3455, p: '+92 42 35759666', pr: [
    ['Silk Kameez Emerald', 8900, 15, 'emerald green silk kameez women'], ['Cotton Co-ord Set', 5600, 0, 'women cotton co-ord set'], ['Printed Abaya Black', 7200, 10, 'black abaya women modest fashion']] },
  { m: L, n: 'Saleem Fabrics', c: 'Clothing', a: '15-16 Commercial Zone, Liberty Market, Gulberg III', lat: 31.5110874, lng: 74.3457286, p: '+92 321 2122121', pr: [
    ['Wash & Wear Fabric (4m)', 3800, 0, 'men suit fabric roll cloth'], ['Cambric Fabric Printed', 2400, 20, 'cambric printed fabric cloth bolts'], ['Pure Cotton Fabric Plain', 1900, 5, 'plain cotton fabric rolls colorful']] },
  { m: L, n: 'Portia Fabrics', c: 'Clothing', a: '13 Commercial Zone, Liberty Market, Gulberg III', lat: 31.5107321, lng: 74.3457874, p: '+92 321 1112060', pr: [
    ['Khaddar Winter Fabric', 3200, 10, 'khaddar fabric winter suit unstitched'], ['Jacquard Fabric Gold', 5400, 0, 'jacquard brocade fabric gold'], ['Linen Fabric Sand', 2900, 15, 'linen fabric beige']] },
  { m: L, n: 'Anabiya Collection', c: 'Clothing', a: 'Shop 8, Chandni Tower, Liberty Market, Gulberg III', lat: 31.511051, lng: 74.3458312, p: '+92 321 4411174', pr: [
    ['Net Embroidered Saree', 11500, 10, 'embroidered net saree pakistani'], ['Velvet Shawl Plum', 4600, 20, 'velvet shawl women plum'], ['Organza Party Wear', 12800, 0, 'organza party wear dress pink']] },
  { m: L, n: 'VampWelt', c: 'Footwear', a: 'Shop 10-12, Commercial Zone, Liberty Market, Gulberg III', lat: 31.51061, lng: 74.3458793, p: '+92 328 3396933', pr: [
    ['Leather Loafers Brown', 6900, 10, 'men brown leather loafers'], ['Running Sneakers White', 7800, 25, 'white running sneakers'], ['Leather Peshawari Chappal', 4500, 0, 'peshawari chappal leather sandal']] },
  { m: L, n: 'Red Shoes', c: 'Footwear', a: 'Zarina Mall, Liberty Market, Gulberg III', lat: 31.5092466, lng: 74.34604, p: '+92 42 35757053', pr: [
    ['Ladies Block Heels Gold', 5900, 15, 'women gold block heels sandals'], ['Bridal Khussa Embroidered', 3800, 0, 'embroidered khussa shoes pakistani'], ['Flat Sandals Tan', 2700, 20, 'tan leather flat sandals women']] },
  { m: L, n: 'Bata', c: 'Footwear', a: 'Plot 17, Liberty Market, Gulberg III', lat: 31.5111245, lng: 74.345508, p: null, pr: [
    ['School Shoes Black', 3200, 0, 'black school shoes kids leather'], ['Sports Sandals', 2400, 10, 'sports sandals velcro men'], ['Formal Oxford Shoes', 8200, 15, 'men black oxford formal shoes']] },
  { m: L, n: 'Miss Rose Cosmetics', c: 'Beauty & Personal Care', a: 'Zarina Shopping Mall, Dopatta Gali, Liberty Market', lat: 31.5091295, lng: 74.3461822, p: '+92 42 35772218', pr: [
    ['Matte Lipstick Set', 2200, 15, 'matte lipstick set makeup'], ['Foundation Beige', 1800, 0, 'liquid foundation bottle makeup'], ['Eyeshadow Palette 18 Colors', 2900, 20, 'eyeshadow palette colorful makeup']] },
  { m: L, n: 'Glamour Point', c: 'Beauty & Personal Care', a: '137-G, Liberty Plaza, Liberty Market, Gulberg III', lat: 31.5098441, lng: 74.346372, p: '+92 323 8880616', pr: [
    ['Face Serum Vitamin C', 3400, 10, 'vitamin c face serum dropper bottle'], ['Hair Straightener Pro', 6500, 25, 'hair straightener flat iron'], ['Nail Polish Collection', 1500, 0, 'nail polish bottles collection']] },
  { m: L, n: 'Shahzad Perfumery', c: 'Beauty & Personal Care', a: 'Block 3C, near Flower Shop, Liberty Market, Gulberg III', lat: 31.5081769, lng: 74.3448687, p: '+92 322 4842048', pr: [
    ['Oud Attar 12ml', 3800, 0, 'oud attar perfume oil bottle'], ['Men Cologne 100ml', 5200, 15, 'men cologne perfume bottle'], ['Rose Body Mist', 1900, 10, 'rose body mist spray bottle']] },
  { m: L, n: 'Discount Store Liberty', c: 'Baby & Kids', a: 'Shop G3, Commercial Zone, Liberty Market, Gulberg III', lat: 31.5105829, lng: 74.3444508, p: '+92 321 8603000', pr: [
    ['Kids Frock Pink', 2400, 20, 'girls pink frock dress kids'], ['Baby Romper Pack of 3', 1900, 0, 'baby romper set cotton'], ['Boys Cargo Shorts', 1600, 10, 'boys cargo shorts kids']] },
  { m: L, n: 'Mother Shop', c: 'Baby & Kids', a: 'Shaheen Centre, Liberty Market Rd, Gulberg III', lat: 31.5107448, lng: 74.3459124, p: null, pr: [
    ['Baby Stroller Compact', 18500, 10, 'baby stroller pram compact'], ['Feeding Bottle Set', 1700, 0, 'baby feeding bottle set'], ['Baby Diaper Bag', 4200, 15, 'baby diaper bag mother bag']] },
  { m: L, n: 'Shoppe Gift Shop', c: 'Bags & Luggage', a: '1 Noor Jahan Rd, Block C2, Gulberg III', lat: 31.5081821, lng: 74.3474721, p: '+92 42 35753713', pr: [
    ['Leather Handbag Tan', 7500, 10, 'tan leather handbag women'], ['Travel Duffel Bag', 5800, 20, 'travel duffel bag'], ['Laptop Backpack Grey', 4600, 0, 'grey laptop backpack']] },
  { m: L, n: '7Star Traders Gifts', c: 'Electronics', a: '8 Commercial Zone, Meena Bazar, Gulberg Rd', lat: 31.5099778, lng: 74.3457978, p: '+92 321 8634143', pr: [
    ['Wireless Earbuds', 4200, 25, 'wireless earbuds white charging case'], ['Phone Case Silicone', 800, 0, 'silicone phone case colorful'], ['Power Bank 20000mAh', 5400, 15, 'power bank 20000mah']] },
  { m: L, n: 'Casio Watches', c: 'Jewelry', a: 'Noor Jahan Rd, Block C3, Gulberg III', lat: 31.5085115, lng: 74.3455484, p: null, pr: [
    ['Casio Digital Watch', 6900, 0, 'casio digital watch black'], ['Analog Steel Watch', 12500, 10, 'men analog steel wristwatch'], ['Ladies Gold Watch', 15800, 20, 'women gold wristwatch']] },
  { m: L, n: 'Zero Degree Gulberg', c: 'Food & Beverages', a: 'Shop G9, Noor Jahan Rd, near Liberty Market', lat: 31.5074044, lng: 74.3473746, p: '+92 337 0334733', pr: [
    ['Chocolate Lava Cake', 650, 0, 'chocolate lava cake dessert'], ['Strawberry Ice Cream Tub', 900, 10, 'strawberry ice cream tub'], ['Brownie Sundae', 780, 15, 'brownie sundae ice cream dessert']] },
  { m: L, n: 'Happy Tea', c: 'Food & Beverages', a: 'Shop 1, Ahad Arcade, Gulberg III', lat: 31.5074815, lng: 74.3478473, p: '+92 335 5786999', pr: [
    ['Doodh Patti Chai', 180, 0, 'pakistani doodh patti chai cup'], ['Karak Chai Flask', 450, 10, 'karak chai flask masala tea'], ['Kashmiri Chai', 260, 0, 'pink kashmiri chai noon chai']] },
  { m: L, n: 'Lahore Flower Shop', c: 'Home & Living', a: 'Shop 10, Liberty Flower Market, Gulberg III', lat: 31.5086042, lng: 74.3453577, p: '+92 300 4306256', pr: [
    ['Red Rose Bouquet', 2500, 10, 'red rose bouquet'], ['Indoor Plant Money Plant', 1200, 0, 'money plant indoor pot'], ['Mixed Flower Vase Arrangement', 3600, 15, 'mixed flower vase arrangement']] },

  // ---------------- Township Market ----------------
  { m: T, n: "Husnain's Clothing Apparel", c: 'Clothing', a: 'Block B1, Township, Lahore', lat: 31.44752, lng: 74.30812, p: '+92 302 5259927', pr: [
    ['Men Shalwar Kameez Black', 3600, 10, 'men black shalwar kameez'], ['Winter Hoodie Maroon', 3200, 20, 'maroon hoodie men'], ['Cotton Trousers', 2100, 0, 'men cotton trousers']] },
  { m: T, n: 'Expandable Store', c: 'Clothing', a: 'Sector C1, Block 3, Township, Lahore', lat: 31.44732, lng: 74.30779, p: '+92 320 4030961', pr: [
    ['Kids Track Suit', 2800, 15, 'kids track suit sports'], ['Ladies Pajama Set', 2300, 0, 'women pajama set sleepwear'], ['Graphic T-Shirt Pack of 2', 1900, 10, 'graphic t shirts folded']] },
  { m: T, n: 'AD Closet', c: 'Clothing', a: 'A1, Block 2, Sector D1, Township', lat: 31.44744, lng: 74.30798, p: '+92 321 7205747', pr: [
    ['Embroidered Lawn Suit', 4800, 20, 'embroidered lawn suit pakistani women'], ['Chiffon Dupatta Pink', 1500, 0, 'pink chiffon dupatta'], ['Straight Trouser Black', 1700, 10, 'women black straight trouser']] },
  { m: T, n: 'Maryam Collections', c: 'Clothing', a: 'Plot 646, Block 2, Sector D1, Township', lat: 31.4461015, lng: 74.3093197, p: '+92 334 2191951', pr: [
    ['Bridal Dupatta Gold', 6500, 5, 'gold bridal dupatta embroidered'], ['Casual Kurti Mustard', 2200, 0, 'mustard kurti women'], ['Palazzo Pants Set', 2600, 15, 'palazzo pants women']] },
  { m: T, n: 'Azmat Clothing', c: 'Clothing', a: 'Block 2, Sector D1, Township', lat: 31.44738, lng: 74.30821, p: null, pr: [
    ['Ladies Shawl Wool', 3400, 25, 'wool shawl women'], ['Cotton Frock Blue', 2900, 0, 'blue cotton frock women'], ['Stitched 2-Piece Suit', 4100, 10, 'stitched two piece suit women pakistani']] },
  { m: T, n: 'Qumash by HS Group', c: 'Clothing', a: 'Block 2, Sector D1, Township', lat: 31.44746, lng: 74.30794, p: null, pr: [
    ['Premium Cotton Unstitched', 3900, 10, 'cotton unstitched fabric suit colors'], ['Printed Linen Suit', 5200, 15, 'printed linen suit'], ['Embroidered Cambric', 4400, 0, 'embroidered cambric fabric']] },
  { m: T, n: 'Zayr Official', c: 'Jewelry', a: 'Block 2, Sector D1, Township', lat: 31.44735, lng: 74.30803, p: '+92 327 0318481', pr: [
    ['Kundan Necklace Set', 7800, 15, 'kundan necklace set jewelry'], ['Pearl Earrings', 2200, 0, 'pearl earrings'], ['Silver Plated Ring', 1500, 10, 'silver ring women']] },
  { m: T, n: 'Umar Jewellery and Bangles', c: 'Jewelry', a: 'Plot 182, Block 2, Sector 12 B1, Township', lat: 31.44751, lng: 74.30811, p: '+92 308 4004098', pr: [
    ['Glass Bangles Set (12)', 900, 0, 'colorful glass bangles pakistani'], ['Gold Plated Bracelet', 3400, 20, 'gold plated bracelet'], ['Bridal Jhumka Earrings', 4800, 10, 'jhumka earrings gold']] },
  { m: T, n: 'AS Mobiles', c: 'Electronics', a: 'Shop UGF 15, Ideal Centre, C1, near Akbar Chowk, Township', lat: 31.44705, lng: 74.3088983, p: '+92 321 7163337', pr: [
    ['Android Smartphone 128GB', 52000, 5, 'android smartphone black'], ['Tempered Glass Protector', 450, 0, 'tempered glass screen protector phone'], ['Fast Charger 33W', 1800, 15, 'phone fast charger usb c']] },
  { m: T, n: 'Hamza Brothers Electronics Centre', c: 'Electronics', a: 'House 693B, Block 2D, Township', lat: 31.4467412, lng: 74.3076149, p: '+92 301 7857698', pr: [
    ['Table Fan 24 inch', 9500, 10, 'table fan electric pedestal'], ['LED TV 32 inch', 38000, 12, 'led tv 32 inch'], ['Electric Iron Steam', 4200, 0, 'steam electric iron clothes']] },
  { m: T, n: 'Tawakkal Commercial Corporation', c: 'Electronics', a: 'Block 2, Sector D1, Township', lat: 31.44741, lng: 74.30806, p: null, pr: [
    ['Bluetooth Speaker', 3800, 20, 'bluetooth speaker portable'], ['LED Bulb Pack (6)', 1500, 0, 'led bulbs pack'], ['Extension Board 4 Socket', 1200, 5, 'power extension board socket']] },
  { m: T, n: 'Bismillah Mobile Shop', c: 'Electronics', a: 'Riaz Chowk, Township', lat: 31.4473471, lng: 74.3078062, p: null, pr: [
    ['Wired Earphones', 600, 0, 'wired earphones white'], ['USB Cable Type-C', 500, 10, 'usb c cable'], ['Smart Watch Fitness Band', 3500, 25, 'smart fitness band watch']] },
  { m: T, n: 'Zaiqa Masala House', c: 'Food & Beverages', a: 'Block 3, Sector C1, Township', lat: 31.4474189, lng: 74.3078406, p: '+92 305 4398484', pr: [
    ['Red Chilli Powder 500g', 650, 0, 'red chilli powder spice bowl'], ['Garam Masala Blend 200g', 480, 10, 'garam masala spice blend'], ['Biryani Masala Mix', 350, 0, 'biryani masala spices']] },
  { m: T, n: 'Mian Dairy and Milk Shop', c: 'Food & Beverages', a: 'C8W5+H3F, Block 2, Sector D1, Township', lat: 31.4464351, lng: 74.3076585, p: '+92 301 7296475', pr: [
    ['Fresh Milk 1L', 220, 0, 'fresh milk glass bottle'], ['Desi Ghee 1kg', 2600, 10, 'desi ghee jar'], ['Fresh Yogurt Dahi 1kg', 280, 0, 'yogurt dahi bowl']] },
  { m: T, n: 'Mian Bahadur Naan Shop', c: 'Food & Beverages', a: 'Plot 693, Block 2, Sector D1, Township', lat: 31.4465442, lng: 74.3077251, p: null, pr: [
    ['Tandoori Naan (4)', 120, 0, 'tandoori naan bread'], ['Sesame Kulcha', 60, 0, 'kulcha bread sesame'], ['Roghni Naan', 80, 0, 'roghni naan pakistani bread']] },
  { m: T, n: 'Mian General Store', c: 'Food & Beverages', a: '568 Block 2, Sector D1, Township', lat: 31.4454607, lng: 74.3100011, p: '+92 303 0949288', pr: [
    ['Basmati Rice 5kg', 2100, 5, 'basmati rice sack'], ['Cooking Oil 3L', 2400, 0, 'cooking oil bottle'], ['Sugar 5kg', 900, 0, 'sugar bag white']] },
  { m: T, n: 'Home Foods Faisal Garden', c: 'Health & Wellness', a: 'near Alkaream Chowk, Block 2, Sector D1, Township', lat: 31.44744, lng: 74.30801, p: '+92 333 4357192', pr: [
    ['Organic Honey 500g', 1800, 10, 'organic honey jar'], ['Mixed Dry Fruits 1kg', 3900, 15, 'mixed dry fruits nuts'], ['Black Seed Oil', 1400, 0, 'black seed oil bottle']] },
  { m: T, n: 'Haji Shafi Muhammad Medical Store', c: 'Health & Wellness', a: 'Plot 381, Umer Chowk, Block 1, Sector D1, Township', lat: 31.443616, lng: 74.3075206, p: '+92 321 4467264', pr: [
    ['Digital Thermometer', 700, 0, 'digital thermometer'], ['Multivitamin Tablets', 1200, 10, 'multivitamin tablets bottle'], ['First Aid Kit', 1600, 5, 'first aid kit box']] },
  { m: T, n: 'Subhan Stationary & Sports', c: 'Books & Media', a: 'C8W5+V3G, Block 3, Sector C1, Township', lat: 31.4471869, lng: 74.3077181, p: '+92 345 6286225', pr: [
    ['Notebook Pack (5)', 750, 0, 'notebooks stack colorful'], ['Gel Pen Box (24)', 600, 10, 'gel pens box colorful'], ['Cricket Bat Kashmir Willow', 4800, 15, 'cricket bat kashmir willow']] },
  { m: T, n: 'Makki Madni Bedsheets House', c: 'Home & Living', a: 'Block 2, Sector D1, Township', lat: 31.44739, lng: 74.30809, p: '+92 321 4789313', pr: [
    ['Double Bedsheet Floral', 2800, 20, 'floral double bedsheet bed'], ['Cotton Pillow Covers (2)', 900, 0, 'pillow covers cushion'], ['Comforter Quilt', 6900, 10, 'quilt comforter bed']] },
  { m: T, n: 'Trendora Marts', c: 'Home & Living', a: 'Township Commercial Area, Lahore', lat: 31.4464171, lng: 74.3110454, p: '+92 370 7851120', pr: [
    ['Dinner Set 24 Pcs', 7500, 15, 'dinner set plates ceramic'], ['Wall Clock Modern', 2200, 0, 'modern wall clock'], ['Storage Baskets (3)', 1900, 10, 'storage baskets woven']] },
  { m: T, n: 'NORV', c: 'Beauty & Personal Care', a: 'Block B2, Sector D1, Township', lat: 31.44748, lng: 74.30804, p: '+92 322 0017592', pr: [
    ['Face Wash Neem', 450, 0, 'neem face wash tube'], ['Hair Oil Almond', 650, 10, 'almond hair oil bottle'], ['Beard Trimmer', 3200, 20, 'electric beard trimmer']] },
];

module.exports = { vendors };
