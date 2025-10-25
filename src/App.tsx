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
    return JSON.parse(localStorage.getItem(LS_CUSTOMER));
  } catch (e) {
    return null;
  }
}
function writeCustomer(obj) {
  localStorage.setItem(LS_CUSTOMER, JSON.stringify(obj));
}
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(LS_CART)) || {};
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
    <div className="bg-white border-b-2 border-gray-300 sticky top-0 z-50 shadow-sm w-full">
      <div className="flex items-center justify-between w-full px-8 py-4">
        {isAdminPage ? (
          <>
            {/* Left: Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("is_admin");
                window.location.href = "/admin/login";
              }}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Logout
            </button>

            {/* Center: Shop name */}
            <div className="flex-1 flex justify-center">
              <Link
                to="/"
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
              >
                Sri Srinivasa Marketing
              </Link>
            </div>

            {/* Right: Add Item button */}
            <button
              onClick={() => window.dispatchEvent(new Event("openAddItem"))}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Add Item
            </button>
          </>
        ) : (
          <>
            {/* Left: Admin */}
            <Link
              to="/admin/login"
              className="text-sm text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Admin
            </Link>

            {/* Center: Shop name */}
            <div className="flex-1 flex justify-center">
              <Link
                to="/"
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
              >
                Sri Srinivasa Marketing
              </Link>
            </div>

            {/* Right: Cart */}
            <Link
              to="/cart"
              className="relative inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Cart
              <span className="ml-2 bg-white text-blue-600 font-semibold text-xs px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            </Link>
          </>
        )}
      </div>

      {/* Customer contact info - centered under shop name */}
      {!isAdminPage && (
        <div className="text-center text-sm text-gray-600 pb-3 border-t border-gray-200 pt-2">
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

  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

  return (
    <div className="w-full">
      <Topbar cartCount={cartCount} customerName={customer?.name} />
      <div className="w-full px-8 py-6">
        {!customer ? (
          <div className="max-w-4xl">
            <CustomerForm onSave={handleSetCustomer} />
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-lg">
              Welcome, <strong>{customer.name}</strong> ({customer.number})
            </p>
            <button
              className="mt-2 text-sm text-blue-600 hover:underline"
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

        <h2 className="text-2xl font-semibold mb-6">Catalog</h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
            {catalog.map((item) => (
              <ItemCardCustomer
                key={item.id}
                item={item}
                quantity={cart[item.id] || 0}
                onAdd={() => addToCart(item.id)}
                onRemove={() => removeFromCart(item.id)}
                onSetQuantity={(q) => setQuantity(item.id, q)}
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
    <div className="bg-white border p-6 rounded-lg shadow-sm mb-6">
      <h3 className="font-semibold text-lg mb-3">Enter your details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border p-3 rounded"
        />
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Phone or identifier"
          className="border p-3 rounded"
        />
      </div>
      <div className="mt-4">
        <button
          onClick={() => onSave(name.trim(), number.trim())}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={!name || !number}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ItemCardCustomer({ item, quantity, onAdd, onRemove }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition flex flex-col h-full">
      <div className="h-40 flex items-center justify-center overflow-hidden rounded-lg bg-gray-50">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="object-cover h-full w-full"
          />
        ) : (
          <div className="text-sm text-gray-400">No image</div>
        )}
      </div>
      <div className="mt-3 flex-1 flex flex-col">
        <div className="font-semibold text-lg text-gray-800">{item.name}</div>
        <div className="text-sm text-gray-600 line-clamp-2 mt-1">
          {item.description}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {item.sizes ? `Sizes: ${item.sizes}` : ""}
        </div>
        <div className="mt-auto pt-4 flex items-center justify-center gap-2">
          <button
            onClick={onRemove}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            -
          </button>
          <div className="text-gray-800 font-semibold min-w-[2rem] text-center">
            {quantity}
          </div>
          <button
            onClick={onAdd}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
    <div className="w-full">
      <Topbar cartCount={Object.values(cart).reduce((s, v) => s + v, 0)} />
      <div className="w-full px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
          {items.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              Cart is empty.
              <button
                onClick={() => navigate("/")}
                className="ml-2 text-blue-600 underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ id, q, item }) => (
                <div
                  key={id}
                  className="bg-white p-4 rounded-lg shadow-sm flex gap-4 items-center border border-gray-100"
                >
                  <div className="w-24 h-20 bg-gray-50 flex items-center justify-center overflow-hidden rounded-lg">
                    {item?.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-400">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {item?.name || id}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item?.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(id, q - 1)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <div className="font-semibold text-gray-800">{q}</div>
                    <button
                      onClick={() => updateQty(id, q + 1)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    <div className="min-h-screen flex items-center justify-center bg-white w-full">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white border p-8 rounded-lg shadow"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Admin Login
        </h3>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full border p-3 rounded mb-3"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-5"
        />
        <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
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

  useEffect(() => {
    const isAdmin = localStorage.getItem("is_admin");
    if (!isAdmin) navigate("/admin/login");
    fetchCatalog();

    const handleOpenAdd = () => setShowAdd(true);
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

  return (
    <div className="min-h-screen bg-white text-gray-900 w-full">
      <Topbar cartCount={0} isAdminPage={true} />
      <div className="w-full px-8 py-6">
        <h2 className="text-2xl font-semibold mb-6">Admin - Catalog</h2>

        {loading ? (
          <div>Loading...</div>
        ) : catalog.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded shadow text-center">
            No items in catalog
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
            {catalog.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition flex flex-col h-full"
              >
                <div className="h-40 overflow-hidden rounded-lg mb-3 flex items-center justify-center bg-gray-50">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <div className="text-sm text-gray-400">No image</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="font-semibold text-lg text-gray-800">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                  {item.sizes && (
                    <div className="text-xs text-gray-500 mt-2">
                      Sizes: {item.sizes}
                    </div>
                  )}
                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded w-full hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddItemModal onClose={() => setShowAdd(false)} onSave={addItem} />
      )}
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h3 className="font-semibold text-lg mb-4">Add Item</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full border p-3 rounded mb-3"
        />
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
          className="w-full border p-3 rounded mb-3"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border p-3 rounded mb-3"
        />
        <input
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="Sizes (comma separated, optional)"
          className="w-full border p-3 rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
