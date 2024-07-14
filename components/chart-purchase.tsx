"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChartProductHotProps {
  storeId: string;
}

const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "red"];

const monthsArr = [
  { id: 1, name: "Tháng 1" },
  { id: 2, name: "Tháng 2" },
  { id: 3, name: "Tháng 3" },
  { id: 4, name: "Tháng 4" },
  { id: 5, name: "Tháng 5" },
  { id: 6, name: "Tháng 6" },
  { id: 7, name: "Tháng 7" },
  { id: 8, name: "Tháng 8" },
  { id: 9, name: "Tháng 9" },
  { id: 10, name: "Tháng 10" },
  { id: 11, name: "Tháng 11" },
  { id: 12, name: "Tháng 12" },
];

const getPath = (x: any, y: any, width: any, height: any) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${
    y + height / 3
  }
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
    x + width
  }, ${y + height}
  Z`;
};

const TriangleBar = (props: any) => {
  const { fill, x, y, width, height } = props;

  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

export const ChartPurchase: React.FC<ChartProductHotProps> = ({ storeId }) => {
  const [dataGraph, setDataGraph] = useState<any>([]);

  useEffect(() => {}, []);

  const handleChangeMonth = async (value: string) => {
    const graphProduct = await axios.get(
      `/api/${storeId}/graph/purchase/${value}`
    );
    setDataGraph(graphProduct.data);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Select onValueChange={handleChangeMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-40 rounded-md border">
              {monthsArr.length > 0 &&
                monthsArr.map((item: any, index) => {
                  return (
                    <SelectItem key={index} value={item.id}>
                      {item.name}
                    </SelectItem>
                  );
                })}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={dataGraph}
          margin={{
            top: 0,
            right: 30,
            left: 0,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Bar
            dataKey="averageOrders"
            fill="#8884d8"
            shape={<TriangleBar />}
            label={{ position: "top" }}
          >
            {dataGraph.map((entry: any, index: any) => (
              <Cell key={`cell-${index}`} fill={colors[index % 20]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};
