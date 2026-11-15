// Data layer: replaces the old Express/SQL Server backend (ShopRadarBackEnd) with Supabase.
// Function names map to the old REST endpoints; return values keep the same shapes the screens expect.
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { supabase } from './supabase';

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

// OrderDetails.ProductDetails is jsonb in Postgres; screens expect a JSON string they JSON.parse.
const detailToLegacy = (d) =>
  d ? { ...d, ProductDetails: typeof d.ProductDetails === 'string' ? d.ProductDetails : JSON.stringify(d.ProductDetails) } : d;
const toJson = (v) => (typeof v === 'string' ? JSON.parse(v) : v);
// Ratings has a unique OrderID, so PostgREST embeds it as an object; screens expect an array.
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// ---------------------------------------------------------------- Auth / session

async function loadOwnCustomer() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return unwrap(await supabase.from('Customers').select('*').eq('AuthUserID', user.id).maybeSingle());
}

// Re-reads the signed-in user's Customers row and caches it under AsyncStorage 'user' (used across screens).
export async function refreshStoredUser() {
  const customer = await loadOwnCustomer();
  if (customer) await AsyncStorage.setItem('user', JSON.stringify(customer));
  else await AsyncStorage.removeItem('user');
  return customer;
}

export async function signUp({ FullName, Email, Phone, Address, City, StateProvince, Country, Password }) {
  const { data, error } = await supabase.auth.signUp({
    email: Email.trim(),
    password: Password,
    options: { data: { FullName, Phone, Address, City, StateProvince, Country } },
  });
  if (error) throw error;
  // session is null when "Confirm email" is enabled in Supabase Auth settings
  return { needsConfirmation: !data.session };
}

export async function signIn(Email, Password) {
  const { error } = await supabase.auth.signInWithPassword({ email: Email.trim(), password: Password });
  if (error) throw error;
  const customer = await refreshStoredUser();
  if (!customer) throw new Error('Customer profile not found');
  return customer;
}

export async function signOut() {
  await supabase.auth.signOut();
  await AsyncStorage.multiRemove(['user', 'orderIDs']);
}

// ---------------------------------------------------------------- Customers

export const getCustomer = async (id) =>
  unwrap(await supabase.from('Customers').select('*').eq('CustomerID', id).single());

export const getAllCustomers = async () => unwrap(await supabase.from('Customers').select('*'));

export const getCustomersWithRoles = async () =>
  unwrap(
    await supabase
      .from('Customers')
      .select('*, vendor:Vendors(VendorID, BusinessName, Market), rider:Riders(RiderID, Name, BikeNumber)')
  );

export async function updateCustomer(id, fields) {
  const { FullName, Email, Phone, Address, City, StateProvince, Country } = fields;
  const row = unwrap(
    await supabase
      .from('Customers')
      .update({ FullName, Email, Phone, Address, City, StateProvince, Country })
      .eq('CustomerID', id)
      .select()
      .single()
  );
  if (fields.Password) {
    const { error } = await supabase.auth.updateUser({ password: fields.Password });
    if (error) throw error;
  }
  return row;
}

export const deleteCustomer = async (id) =>
  unwrap(await supabase.from('Customers').delete().eq('CustomerID', id));

// ---------------------------------------------------------------- Vendors

export const getVendors = async () => unwrap(await supabase.from('Vendors').select('*'));

export const getVendor = async (id) =>
  unwrap(await supabase.from('Vendors').select('*').eq('VendorID', id).single());

// Creates the vendor and links it to the signed-in customer (RPC enforces one vendor per user).
export async function registerVendor(fields) {
  const vendor = unwrap(await supabase.rpc('register_vendor', { p: fields }));
  await refreshStoredUser();
  return vendor;
}

export async function updateVendor(id, fields) {
  const { VendorID, ...rest } = fields;
  return unwrap(await supabase.from('Vendors').update(rest).eq('VendorID', id).select().single());
}

// ---------------------------------------------------------------- Riders

export const getRider = async (id) =>
  unwrap(await supabase.from('Riders').select('*').eq('RiderID', id).single());

export async function registerRider(fields) {
  const rider = unwrap(await supabase.rpc('register_rider', { p: fields }));
  await refreshStoredUser();
  return rider;
}

export async function updateRider(id, fields) {
  const { RiderID, ...rest } = fields;
  return unwrap(await supabase.from('Riders').update(rest).eq('RiderID', id).select().single());
}

export const getRiderAssignedOrder = async (id) =>
  unwrap(await supabase.from('Riders').select('AssignedOrder').eq('RiderID', id).single());

// ---------------------------------------------------------------- Products

export async function searchProducts({ market, searchText, category } = {}) {
  let q = supabase.from('Products').select(market ? '*, Vendor:Vendors!inner(*)' : '*, Vendor:Vendors(*)');
  if (searchText) q = q.ilike('ProductName', `%${searchText}%`);
  if (category) q = q.eq('ProductCategory', category);
  if (market) q = q.eq('Vendor.Market', market);
  return unwrap(await q);
}

export const getAllProducts = async () => unwrap(await supabase.from('Products').select('*'));

export const getProductsByVendor = async (vendorId) =>
  unwrap(await supabase.from('Products').select('*').eq('VendorID', vendorId));

export const getProduct = async (id) =>
  unwrap(await supabase.from('Products').select('*').eq('ProductID', id).single());

export const addProduct = async ({ VendorID, ProductName, ProductCategory, Price, Image, Discount, ProductDescription }) =>
  unwrap(
    await supabase
      .from('Products')
      .insert({ VendorID, ProductName, ProductCategory, Price, Image, Discount: Discount || 0, ProductDescription })
      .select()
      .single()
  );

export const updateProduct = async (id, { ProductName, Price, Discount, ProductDescription }) =>
  unwrap(
    await supabase
      .from('Products')
      .update({ ProductName, Price, Discount, ProductDescription })
      .eq('ProductID', id)
      .select()
      .single()
  );

export const deleteProduct = async (id) =>
  unwrap(await supabase.from('Products').delete().eq('ProductID', id));

// ---------------------------------------------------------------- Orders

export const getOrder = async (id) =>
  unwrap(await supabase.from('Orders').select('*').eq('OrderID', id).single());

export const getAllOrders = async () => unwrap(await supabase.from('Orders').select('*').order('OrderID', { ascending: false }));

export const createOrder = async (fields) => unwrap(await supabase.from('Orders').insert(fields).select().single());

export async function updateOrder(id, fields) {
  const { OrderID, Vendor, OrderDetails, Ratings, ...rest } = fields;
  return unwrap(await supabase.from('Orders').update(rest).eq('OrderID', id).select().single());
}

// Vendor dashboard: everything not yet picked up
export const getUpcomingVendorOrders = async (vendorId) =>
  unwrap(await supabase.from('Orders').select('*').eq('VendorID', vendorId).neq('OrderStatus', 'PickedUP'));

// Customer's active orders, with vendor info
export const getCustomerActiveOrders = async (customerId) =>
  unwrap(
    await supabase
      .from('Orders')
      .select('*, Vendor:Vendors(BusinessName, Image, Latitude, Longitude, Contact, Market, CompanyAddress)')
      .eq('CustomerID', customerId)
      .in('OrderStatus', ['pending', 'accepted', 'PickedUp', 'AtVendor', 'PickUp'])
  );

// Customer's finished orders with vendor, details and rating
export async function getCustomerOrderHistory(customerId) {
  const rows = unwrap(
    await supabase
      .from('Orders')
      .select('*, Vendor:Vendors(BusinessName, Image), OrderDetails(OrderDetailID, ProductDetails), Ratings(Rating, RatingDate)')
      .eq('CustomerID', customerId)
      .in('OrderStatus', ['Delivered', 'Cancelled'])
      .order('OrderID', { ascending: false })
  );
  return rows.map((o) => ({ ...o, Ratings: asArray(o.Ratings), OrderDetails: o.OrderDetails.map(detailToLegacy) }));
}

// Orders waiting for a rider
export const getAvailableRiderOrders = async () =>
  unwrap(
    await supabase.from('Orders').select('*').eq('OrderStatus', 'pending').eq('VanAccept', true).is('RiderID', null)
  );

function groupIncome(orders, amountKey, countOrder) {
  const today = moment().startOf('day');
  const tomorrow = moment().add(1, 'days').startOf('day');
  const grouped = { today: [], tomorrow: [], others: {}, incomes: {} };
  orders.forEach((order) => {
    const d = moment(order.OrderDate).startOf('day');
    const key = d.format('DD/MM/YYYY');
    if (countOrder(order)) grouped.incomes[key] = (grouped.incomes[key] || 0) + (order[amountKey] || 0);
    if (d.isSame(today, 'day')) grouped.today.push(order);
    else if (d.isSame(tomorrow, 'day')) grouped.tomorrow.push(order);
    else (grouped.others[key] = grouped.others[key] || []).push(order);
  });
  return grouped;
}

export async function getVendorIncome(vendorId) {
  const orders = unwrap(
    await supabase
      .from('Orders')
      .select('OrderID, DeliveryAddress, OrderStatus, OrderPrice, OrderDate')
      .eq('VendorID', vendorId)
      .in('OrderStatus', ['Delivered', 'Cancelled'])
      .order('OrderDate', { ascending: false })
  );
  return groupIncome(orders, 'OrderPrice', (o) => o.OrderStatus === 'Delivered');
}

export async function getRiderIncome(riderId) {
  const orders = unwrap(
    await supabase
      .from('Orders')
      .select('OrderID, DeliveryAddress, OrderStatus, DeliveryFee, OrderDate')
      .eq('RiderID', riderId)
      .eq('OrderStatus', 'Delivered')
      .order('OrderDate', { ascending: false })
  );
  return groupIncome(orders, 'DeliveryFee', () => true);
}

// ---------------------------------------------------------------- Order details

export async function getOrderDetails(orderId) {
  const rows = unwrap(await supabase.from('OrderDetails').select('*').eq('OrderID', orderId));
  return rows.map(detailToLegacy);
}

export async function createOrderDetails({ OrderID, ProductDetails }) {
  const details = toJson(ProductDetails);
  if (!details || !Array.isArray(details.products)) throw new Error('Invalid ProductDetails format');
  return detailToLegacy(
    unwrap(await supabase.from('OrderDetails').insert({ OrderID, ProductDetails: details }).select().single())
  );
}

export async function updateOrderDetail(id, { ProductDetails }) {
  return detailToLegacy(
    unwrap(
      await supabase
        .from('OrderDetails')
        .update({ ProductDetails: toJson(ProductDetails) })
        .eq('OrderDetailID', id)
        .select()
        .single()
    )
  );
}

// ---------------------------------------------------------------- Ratings

export const getAllRatings = async () => unwrap(await supabase.from('Ratings').select('*'));

export const addRating = async ({ CustomerID, VendorID, Rating, OrderID }) =>
  unwrap(await supabase.from('Ratings').insert({ CustomerID, VendorID, Rating, OrderID }).select().single());

// Rider claims an unassigned order; fails if another rider got it first.
export async function acceptOrder(orderId, riderId) {
  const { data, error } = await supabase
    .from('Orders')
    .update({ OrderStatus: 'accepted', RiderID: riderId })
    .eq('OrderID', orderId)
    .is('RiderID', null)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('This order was already taken by another rider');
  await updateRider(riderId, { AssignedOrder: orderId, IsAvailable: false });
  return data;
}
