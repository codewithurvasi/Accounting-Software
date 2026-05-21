import { createSlice } from "@reduxjs/toolkit";

const getSavedProducts = () => {
  try {
    return JSON.parse(localStorage.getItem("products") || "[]");
  } catch {
    return [];
  }
};

const saveProducts = (products) => {
  localStorage.setItem("products", JSON.stringify(products));
};

const initialState = {
  products: getSavedProducts(),
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const product = {
        ...action.payload,
        stockByWarehouse:
          action.payload.stockByWarehouse?.length > 0
            ? action.payload.stockByWarehouse
            : [
                {
                  warehouseId:
                    action.payload.warehouseId ||
                    action.payload.warehouse ||
                    "Main Warehouse",
                  warehouseName:
                    action.payload.warehouseName ||
                    action.payload.warehouse ||
                    "Main Warehouse",
                  stock: Number(
                    action.payload.currentStock ||
                      action.payload.openingStock ||
                      0
                  ),
                },
              ],
      };

      product.currentStock = product.stockByWarehouse.reduce(
        (sum, w) => sum + Number(w.stock || 0),
        0
      );

      state.products.unshift(product);
      saveProducts(state.products);
    },

    updateProduct: (state, action) => {
      const index = state.products.findIndex(
        (p) => String(p.id) === String(action.payload.id)
      );

      if (index !== -1) {
        state.products[index] = {
          ...state.products[index],
          ...action.payload,
        };

        saveProducts(state.products);
      }
    },

    deleteProduct: (state, action) => {
      state.products = state.products.filter(
        (p) => String(p.id) !== String(action.payload)
      );

      saveProducts(state.products);
    },

    reduceProductStock: (state, action) => {
      action.payload.forEach((item) => {
        const product = state.products.find(
          (p) =>
            String(p.id) === String(item.productId) ||
            String(p.name || "").toLowerCase() ===
              String(item.product || "").toLowerCase()
        );

        if (!product) return;

        if (!product.stockByWarehouse) {
          product.stockByWarehouse = [
            {
              warehouseId: product.warehouse || "Main Warehouse",
              warehouseName: product.warehouse || "Main Warehouse",
              stock: Number(product.currentStock || 0),
            },
          ];
        }

        const selectedWarehouse = product.stockByWarehouse.find(
          (w) =>
            String(w.warehouseId) === String(item.warehouseId) ||
            String(w.warehouseName) === String(item.warehouseName)
        );

        if (selectedWarehouse) {
          selectedWarehouse.stock =
            Number(selectedWarehouse.stock || 0) - Number(item.qty || 0);
        }

        product.stockByWarehouse = product.stockByWarehouse.filter(
          (w) => Number(w.stock || 0) > 0
        );

        product.currentStock = product.stockByWarehouse.reduce(
          (sum, w) => sum + Number(w.stock || 0),
          0
        );
      });

      saveProducts(state.products);
    },

    increaseProductStock: (state, action) => {
  action.payload.forEach((item) => {
    const product = state.products.find(
      (p) =>
        String(p.id) === String(item.productId) ||
        String(p.name || "").toLowerCase() ===
          String(item.product || "").toLowerCase()
    );

    if (!product) return;

    if (!product.stockByWarehouse) {
      product.stockByWarehouse = [
        {
          warehouseId: item.warehouseId || product.warehouse || "Main Warehouse",
          warehouseName:
            item.warehouseName || product.warehouse || "Main Warehouse",
          stock: Number(product.currentStock || 0),
        },
      ];
    }

    const warehouseId =
      item.warehouseId || item.warehouseName || product.warehouse || "Main Warehouse";

    const warehouseName =
      item.warehouseName || item.warehouseId || product.warehouse || "Main Warehouse";

    const selectedWarehouse = product.stockByWarehouse.find(
      (w) =>
        String(w.warehouseId) === String(warehouseId) ||
        String(w.warehouseName) === String(warehouseName)
    );

    if (selectedWarehouse) {
      selectedWarehouse.stock =
        Number(selectedWarehouse.stock || 0) + Number(item.qty || 0);
    } else {
      product.stockByWarehouse.push({
        warehouseId,
        warehouseName,
        stock: Number(item.qty || 0),
      });
    }

    product.currentStock = product.stockByWarehouse.reduce(
      (sum, w) => sum + Number(w.stock || 0),
      0
    );
  });

  saveProducts(state.products);
},

    transferProductStock: (state, action) => {
  const {
    productId,
    fromWarehouseId,
    fromWarehouseName,
    toWarehouseId,
    toWarehouseName,
    qty,
  } = action.payload;

  const product = state.products.find(
    (p) => String(p.id) === String(productId)
  );

  if (!product) return;

  const transferQty = Number(qty || 0);

  const oldStocks =
    product.stockByWarehouse?.length > 0
      ? product.stockByWarehouse
      : product.warehouseStocks?.length > 0
      ? product.warehouseStocks.map((w) => ({
          warehouseId: w.warehouseId || w.warehouse || w.warehouseName,
          warehouseName: w.warehouseName || w.warehouse || "Main Warehouse",
          stock: Number(w.stock || w.qty || 0),
        }))
      : [
          {
            warehouseId: product.warehouse || "Main Warehouse",
            warehouseName: product.warehouse || "Main Warehouse",
            stock: Number(product.currentStock || 0),
          },
        ];

  product.stockByWarehouse = oldStocks;

  const fromWarehouse = product.stockByWarehouse.find(
    (w) =>
      String(w.warehouseId) === String(fromWarehouseId) ||
      String(w.warehouseName) === String(fromWarehouseName)
  );

  if (!fromWarehouse || Number(fromWarehouse.stock || 0) < transferQty) {
    alert("Selected warehouse me enough stock nahi hai.");
    return;
  }

  fromWarehouse.stock = Number(fromWarehouse.stock || 0) - transferQty;

  const toWarehouse = product.stockByWarehouse.find(
    (w) =>
      String(w.warehouseId) === String(toWarehouseId) ||
      String(w.warehouseName) === String(toWarehouseName)
  );

  if (toWarehouse) {
    toWarehouse.stock = Number(toWarehouse.stock || 0) + transferQty;
  } else {
    product.stockByWarehouse.push({
      warehouseId: toWarehouseId || toWarehouseName,
      warehouseName: toWarehouseName || toWarehouseId || "Warehouse",
      stock: transferQty,
    });
  }

  product.stockByWarehouse = product.stockByWarehouse.filter(
    (w) => Number(w.stock || 0) > 0
  );

  product.warehouseStocks = product.stockByWarehouse.map((w) => ({
    warehouse: w.warehouseName,
    warehouseId: w.warehouseId,
    warehouseName: w.warehouseName,
    stock: Number(w.stock || 0),
    qty: Number(w.stock || 0),
  }));

  product.currentStock = product.stockByWarehouse.reduce(
    (sum, w) => sum + Number(w.stock || 0),
    0
  );

  product.warehouse = product.stockByWarehouse
    .map((w) => w.warehouseName)
    .join(", ");

  saveProducts(state.products);
},
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  reduceProductStock,
  increaseProductStock,
  transferProductStock,
} = productSlice.actions;

export default productSlice.reducer;