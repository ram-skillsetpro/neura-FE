import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { redirectTo } from "src/app.redux";
import { ROUTE_404, ROUTE_500 } from "src/const";
import { GetState, ThunkApi } from "src/core/models/common.model";
import { AppDispatch } from "src/redux/create-store";
import { HomeData, Product } from "./home.model";

export interface HomeState {
  pageData: HomeData;
  productById?: Product;
  topProducts: Product[];
}
const initialState: HomeState = {
  pageData: { products: [] },
  // product will always be available for component otherwise fetchProductById will redirect to 404
  productById: undefined,
  topProducts: [],
};

export const fetchProducts = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<HomeData>("/api/product", {
      extra: "home/productsPageDataLoaded",
    });
    dispatch(
      productsPageDataLoaded(
        apiResponse.isSuccess && apiResponse.data ? apiResponse.data : { products: [] },
      ),
    );
    if (!apiResponse.isSuccess) {
      if (apiResponse.status === 500) {
        dispatch(redirectTo({ path: ROUTE_500 }));
      } else if (apiResponse.status === 404) {
        dispatch(redirectTo({ path: ROUTE_404 }));
      }
    }
    return apiResponse;
  };
};

export const fetchProductById = (id: number) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<Product>(`/api/product/${id}`, {
      isAuth: true,
    });
    dispatch(productByIdLoaded(apiResponse.data || undefined));
    return apiResponse;
  };
};

export function fetchTopProducts() {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<Product[]>("/api/product/top-products");
    dispatch(topProductsLoaded(apiResponse.data || []));
    return apiResponse;
  };
}

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    productsPageDataLoaded: (state, action: PayloadAction<HomeData>) => {
      state.pageData = action.payload;
    },
    productByIdLoaded: (state, action: PayloadAction<Product | undefined>) => {
      state.productById = action.payload;
    },
    topProductsLoaded: (state, action: PayloadAction<Product[]>) => {
      state.topProducts = action.payload;
    },
  },
});

export const { productsPageDataLoaded, productByIdLoaded, topProductsLoaded } = homeSlice.actions;
export default homeSlice.reducer;
