import React, { useEffect, useState } from "react";

import { createClient } from "@supabase/supabase-js";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

// === CONFIG ===
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "public-anon-key";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LS_CUSTOMER = "shop_customer";
const LS_CART = "shop_cart";

function readCustomer() {
  try {
    const item = localStorage.getItem(LS_CUSTOMER);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}
function writeCustomer(obj) {
  localStorage.setItem(LS_CUSTOMER, JSON.stringify(obj));
}
function readCart() {
  try {
    const item = localStorage.getItem(LS_CART);
    return item ? JSON.parse(item) : {};
  } catch (e) {
    return {};
  }
}
function writeCart(cart) {
  localStorage.setItem(LS_CART, JSON.stringify(cart));
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

function Topbar({ cartCount, isAdminPage, customerName }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-800 sticky top-0 z-50 shadow-lg w-full">
      <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8 py-4 max-w-none">
        {isAdminPage ? (
          <>
            {/* Left: Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("is_admin");
                window.location.href = "/admin/login";
              }}
              className="px-6 py-3 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200 font-medium text-lg"
            >
              Logout
            </button>

            {/* Center: Shop name */}
            <div className="flex-1 flex justify-center">
              <Link
                to="/"
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white hover:text-white transition-all duration-200 no-underline"
              >
                Sri Srinivasa Marketing
              </Link>
            </div>

            {/* Right: Add Item button */}
            <button
              onClick={() => window.dispatchEvent(new Event("openAddItem"))}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium text-lg shadow-md"
            >
              Add Item
            </button>
          </>
        ) : (
          <>
            {/* Left: Admin */}
            <Link
              to="/admin/login"
              className="text-lg text-white/90 hover:text-white font-medium transition-all duration-200 px-4 py-3 rounded-lg hover:bg-white/10"
            >
              Admin
            </Link>

            {/* Center: Shop name */}
            <div className="flex-1 flex justify-center">
              <Link
                to="/"
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white hover:text-white transition-all duration-200 no-underline"
              >
                Sri Srinivasa Marketing
              </Link>
            </div>

            {/* Right: Cart */}
            <Link
              to="/cart"
              className="relative inline-flex items-center px-6 py-3 bg-white text-gray-800 rounded-full hover:bg-gray-50 transition-all duration-200 font-medium text-lg shadow-md"
            >
              Cart
              <span className="ml-2 bg-blue-600 text-white font-semibold text-sm px-3 py-1 rounded-full">
                {cartCount}
              </span>
            </Link>
          </>
        )}
      </div>

      {/* Customer contact info - centered under shop name */}
      {!isAdminPage && (
        <div className="text-center text-sm text-white/90 pb-3 border-t border-white/20 pt-2 bg-blue-800/20">
          Contact us: 1234567890, 0987654321, 1122334455
        </div>
      )}
    </div>
  );
}

function Home() {
  const [customer, setCustomer] = useState(() => readCustomer());
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(() => readCart());

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    writeCart(cart);
  }, [cart]);

  async function fetchCatalog() {
    setLoading(true);
    const { data, error } = await supabase.from("items").select("*");
    setLoading(false);
    if (error) {
      console.error("Failed to fetch catalog", error);
      return;
    }
    setCatalog(data || []);
  }

  function handleSetCustomer(name, number) {
    const obj = { name, number };
    setCustomer(obj);
    writeCustomer(obj);
  }

  function addToCart(itemId) {
    setCart((prev) => {
      const next = { ...prev };
      next[itemId] = (next[itemId] || 0) + 1;
      return next;
    });
  }
  function removeFromCart(itemId) {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[itemId]) return prev;
      next[itemId] = Math.max(0, next[itemId] - 1);
      if (next[itemId] === 0) delete next[itemId];
      return next;
    });
  }
  function setQuantity(itemId, q) {
    setCart((prev) => {
      const next = { ...prev };
      if (q <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = q;
      }
      return next;
    });
  }

  const cartCount = Object.values(cart).reduce((s: number, v: any) => s + (v as number), 0);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Topbar cartCount={cartCount} customerName={customer?.name} isAdminPage={false} />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {!customer ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Sri Srinivasa Marketing</h1>
              <p className="text-lg text-gray-600">Please enter your details to browse our catalog</p>
            </div>
            <CustomerForm onSave={handleSetCustomer} />
          </div>
        ) : (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-lg text-gray-700">
              Welcome, <strong className="text-blue-600">{customer.name}</strong> ({customer.number})
            </p>
            <button
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              onClick={() => {
                setCustomer(null);
                writeCustomer(null);
                localStorage.removeItem(LS_CUSTOMER);
              }}
            >
              Change
            </button>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Catalog</h2>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-8 lg:gap-12">
            {catalog.map((item) => (
              <ItemCardCustomer
                key={item.id}
                item={item}
                quantity={cart[item.id] || 0}
                onAdd={() => addToCart(item.id)}
                onRemove={() => removeFromCart(item.id)}
                onSetQuantity={(q: any) => setQuantity(item.id, q)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerForm({ onSave }) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  return (
    <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-lg mb-8">
      <h3 className="font-bold text-2xl mb-6 text-gray-800 text-center">Enter your details to continue</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg"
        />
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Phone or identifier"
          className="border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg"
        />
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={() => onSave(name.trim(), number.trim())}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!name || !number}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

function ItemCardCustomer({ item, quantity, onAdd, onRemove, onSetQuantity }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full min-h-[350px]">
      <div className="h-48 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 mb-4">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="object-cover h-full w-full rounded-xl"
          />
        ) : (
          <div className="text-sm text-gray-400 flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div>No image</div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">{item.name}</div>
        <div className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1">
          {item.description}
        </div>
        {item.sizes && (
          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mb-4">
            Sizes: {item.sizes}
          </div>
        )}
        <div className="mt-auto pt-4 flex items-center justify-center gap-3">
          <button
            onClick={onRemove}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium text-gray-700"
          >
            -
          </button>
          <div className="text-gray-800 font-bold min-w-[3rem] text-center text-lg bg-gray-50 px-3 py-2 rounded-lg">
            {quantity}
          </div>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(() => readCart());
  const [catalogMap, setCatalogMap] = useState({});

  useEffect(() => {
    (async () => {
      const ids = Object.keys(cart);
      if (ids.length === 0) return;
      const { data } = await supabase.from("items").select("*").in("id", ids);
      const map = {};
      (data || []).forEach((i) => (map[i.id] = i));
      setCatalogMap(map);
    })();
  }, []);

  function updateQty(itemId, qty) {
    const next = { ...cart };
    if (qty <= 0) delete next[itemId];
    else next[itemId] = qty;
    setCart(next);
    writeCart(next);
  }

  const items = Object.entries(cart).map(([id, q]) => ({
    id,
    q,
    item: catalogMap[id],
  }));

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Topbar cartCount={Object.values(cart).reduce((s: number, v: any) => s + (v as number), 0)} customerName={undefined} isAdminPage={false} />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Shopping Cart</h2>
          {items.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-100">
              <div className="text-6xl mb-4">🛒</div>
              <div className="text-xl text-gray-600 mb-6">Your cart is empty</div>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(({ id, q, item }) => (
                <div
                  key={id}
                  className="bg-white p-6 rounded-2xl shadow-lg flex gap-6 items-center border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-32 h-24 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden rounded-xl">
                    {item?.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover h-full w-full rounded-xl"
                      />
                    ) : (
                      <div className="text-sm text-gray-400 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl mb-1">📦</div>
                          <div>No image</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-xl text-gray-800 mb-2">
                      {item?.name || id}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {item?.description}
                    </div>
                    {item?.sizes && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-2">
                        Sizes: {item.sizes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(id, (q as number) - 1)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium text-gray-700"
                    >
                      -
                    </button>
                    <div className="font-bold text-gray-800 min-w-[3rem] text-center text-lg bg-gray-50 px-3 py-2 rounded-lg">
                      {q}
                    </div>
                    <button
                      onClick={() => updateQty(id, (q as number) + 1)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase
      .from("admins")
      .select("password")
      .eq("username", username)
      .limit(1)
      .single();
    if (error) {
      setError("Login failed");
      return;
    }
    if (!data || data.password !== password) {
      setError("Invalid credentials");
      return;
    }
    localStorage.setItem("is_admin", "1");
    navigate("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 w-full">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-2xl font-bold text-gray-800">
            Admin Login
          </h3>
        </div>
        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg mb-4"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg mb-6"
        />
        <button className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-lg shadow-md">
          Login
        </button>
      </form>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem("is_admin");
    if (!isAdmin) navigate("/admin/login");
    fetchCatalog();

    const handleOpenAdd = () => {
      setShowAdd(true);
      // Scroll to top when modal opens
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener("openAddItem", handleOpenAdd);
    return () => window.removeEventListener("openAddItem", handleOpenAdd);
  }, []);

  async function fetchCatalog() {
    setLoading(true);
    const { data, error } = await supabase.from("items").select("*");
    setLoading(false);
    if (error) {
      console.error(error);
      return;
    }
    setCatalog(data || []);
  }

  async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      alert("Delete failed");
      return;
    }
    setCatalog(catalog.filter((c) => c.id !== id));
  }

  async function addItem(payload) {
    const { data, error } = await supabase
      .from("items")
      .insert([payload])
      .select()
      .single();
    if (error) {
      alert("Add failed");
      return;
    }
    setCatalog((prev) => [data, ...prev]);
    setShowAdd(false);
  }

  async function updateItem(id, payload) {
    const { data, error } = await supabase
      .from("items")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      alert("Update failed");
      return;
    }
    setCatalog((prev) => prev.map((item) => (item.id === id ? data : item)));
    setShowEdit(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 w-full">
      <Topbar cartCount={0} isAdminPage={true} customerName={undefined} />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Admin - Catalog Management</h2>
        {showAdd && (
          <div className="mb-8">
            <AddItemModal onClose={() => setShowAdd(false)} onSave={addItem} />
          </div>
        )}

        {showEdit && (
          <div className="mb-8">
            <EditItemModal 
              item={showEdit} 
              onClose={() => setShowEdit(null)} 
              onSave={(payload) => updateItem(showEdit.id, payload)} 
            />
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : catalog.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-100">
            <div className="text-6xl mb-4">📦</div>
            <div className="text-xl text-gray-600 mb-6">No items in catalog</div>
            <button
              onClick={() => {
                setShowAdd(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-8 lg:gap-12">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full min-h-[350px]"
              >
                <div className="h-48 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 mb-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover h-full w-full rounded-xl"
                    />
                  ) : (
                    <div className="text-sm text-gray-400 flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📦</div>
                        <div>No image</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="font-bold text-xl text-gray-800 mb-2 line-clamp-2">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-3 mb-3 flex-1">
                    {item.description}
                  </div>
                  {item.sizes && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mb-4">
                      Sizes: {item.sizes}
                    </div>
                  )}
                  <div className="mt-auto pt-4 space-y-3">
                    <button
                      onClick={() => setShowEdit(item)}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl w-full hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
                    >
                      Edit Item
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="px-4 py-3 bg-red-600 text-white rounded-xl w-full hover:bg-red-700 transition-all duration-200 font-medium shadow-md"
                    >
                      Delete Item
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      
    </div>
  );
}

function AddItemModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState("");

  function submit(e) {
    e.preventDefault();
    const payload = {
      name,
      image,
      description,
      sizes: sizes
        ? sizes
            .split(",")
            .map((s) => s.trim())
            .join(",")
        : null,
    };
    onSave(payload);
  }

  return (
    <div className="bg-black/50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="w-full max-w-lg mt-8">
        <form
          onSubmit={submit}
          className="bg-white p-8 rounded-2xl shadow-2xl w-full border border-gray-200"
        >
        <div className="text-center mb-8">
          <h3 className="font-bold text-2xl text-gray-800">Add New Item</h3>
        </div>

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item Name"
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg"
          />
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL"
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg resize-none"
          />
          <input
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            placeholder="Sizes (comma separated, optional)"
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
          >
            Add Item
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}

function EditItemModal({ item, onClose, onSave }) {
  const [name, setName] = useState(item.name || "");
  const [image, setImage] = useState(item.image || "");
  const [description, setDescription] = useState(item.description || "");
  const [sizes, setSizes] = useState(item.sizes || "");

  function submit(e) {
    e.preventDefault();
    const payload = {
      name,
      image,
      description,
      sizes: sizes
        ? sizes
            .split(",")
            .map((s) => s.trim())
            .join(",")
        : null,
    };
    onSave(payload);
  }

  return (
    <div className="bg-black/50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="w-full max-w-lg mt-8">
        <form
          onSubmit={submit}
          className="bg-white p-8 rounded-2xl shadow-2xl w-full border border-gray-200"
        >
        <div className="text-center mb-8">
          <h3 className="font-bold text-2xl text-gray-800">Edit Item</h3>
        </div>

        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item Name"
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg"
          />
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL"
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg resize-none"
          />
          <input
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            placeholder="Sizes (comma separated, optional)"
            className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 text-lg"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-md"
          >
            Update Item
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
