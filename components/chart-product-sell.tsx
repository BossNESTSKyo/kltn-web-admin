"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartProductProps {
  storeId: string;
}

export const ChartProductSell: React.FC<ChartProductProps> = ({ storeId }) => {
  const [categories, setCategories] = useState<any>([]);
  const [products, setProducts] = useState<any>([]);
  const [dataGraphProduct, setDataGraphProduct] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const categories = await axios.get(`/api/${storeId}/categories`);
      setCategories(categories.data);
    };

    fetchData();
  }, [storeId]);

  const handleChangeCategory = async (value: string) => {
    const products = await axios.get(
      `/api/${storeId}/products?categoryId=${value}`
    );
    setProducts(products.data);
  };

  const handleChangeProduct = async (value: string) => {
    const graphProduct = await axios.get(`/api/${storeId}/graph/sell/${value}`);
    setDataGraphProduct(graphProduct.data);
  };

  return (
    <>
      <div className="mb-4 flex gap-2 justify-end">
        <Select onValueChange={handleChangeCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.length > 0 &&
              categories.map((category: any, index: any) => {
                return (
                  <div key={index}>
                    <SelectItem value={category.id}>{category.name}</SelectItem>
                  </div>
                );
              })}
          </SelectContent>
        </Select>
        <Select onValueChange={handleChangeProduct}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent>
            {products.length > 0 &&
              products.map((product: any, index: any) => {
                return (
                  <div key={index}>
                    <SelectItem value={product.id}>{product.name}</SelectItem>
                  </div>
                );
              })}
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          width={500}
          height={400}
          data={dataGraphProduct}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="sellAmount"
            stroke="#8884d8"
            fill="#8884d8"
            name="Số lượng mua"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};
