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

interface ChartUserProps {
  storeId: string;
}

export const ChartUser: React.FC<ChartUserProps> = ({ storeId }) => {
  const [dataGraph, setDataGraph] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const graphProduct = await axios.get(`/api/${storeId}/graph/user`);
      setDataGraph(graphProduct.data);
    };

    fetchData();
  }, [storeId]);

  return (
    <>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={dataGraph}
          margin={{
            top: 57,
            right: 30,
            left: 20,
            bottom: -50,
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
            name="Số tiền đã chi tiêu"
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};
