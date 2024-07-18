"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

export const ChartProduct: React.FC<ChartProductProps> = ({ storeId }) => {
  const [categories, setCategories] = useState<any>([]);
  const [dataGraph, setDataGraph] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const categories = await axios.get(`/api/${storeId}/categories`);
      setCategories(categories.data);
    };

    fetchData();
  }, [storeId]);

  const handleChangeCategory = async (value: string) => {
    const graphProduct = await axios.get(
      `/api/${storeId}/graph/amount/${value}`
    );
    setDataGraph(graphProduct.data);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
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
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={dataGraph}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="amount"
            stackId="a"
            fill="#8884d8"
            name="Số lượng còn lại"
          />
          <Bar
            dataKey="sellAmount"
            stackId="a"
            fill="#82ca9d"
            name="Số lượng đã bán"
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};
