"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Billboard, Category } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2),
  billboardId: z.string().min(1),
  totalPrice: z.coerce.number().min(1),
  rows: z.array(
    z.object({
      id: z.string(),
      categoryId: z.string().min(1, "Category Id is required"),
      productId: z.string().min(1, "Product Id is required"),
      quantity: z.coerce.number().min(1),
    })
  ),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface ImportFormProps {
  billboards: Billboard[];
  categories: Category[];
}

export const ImportForm: React.FC<ImportFormProps> = ({
  billboards,
  categories,
}) => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [productsByRow, setProductsByRow] = useState<any>({});

  const title = "Create import";
  const description = "Add a new import";
  const toastMessage = "Import created.";
  const action = "Create";

  const defaultValues = {
    name: "",
    billboardId: "",
    totalPrice: 1,
    rows: [],
  };

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rows",
  });

  const handleChangeCategory = async (value: string, rowIndex: number) => {
    try {
      const response = await axios.get(
        `/api/${params.storeId}/products?categoryId=${value}`
      );
      setProductsByRow((prevProductsByRow: any) => ({
        ...prevProductsByRow,
        [rowIndex]: response.data,
      }));
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/${params.storeId}/import`, data);

      router.refresh();
      router.push(`/${params.storeId}/imports`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Import name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a billboard"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>
                          {billboard.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`totalPrice`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Enter total price"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <Separator />
            <div className="flex justify-between items-center mt-2">
              <div className="text-md font-medium">Import Data</div>
              <Button
                type="button"
                onClick={() =>
                  append({
                    id: String(fields.length + 1),
                    categoryId: "",
                    productId: "",
                    quantity: 1,
                  })
                }
              >
                Add Row
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="md:grid md:grid-cols-4 gap-8 mt-4">
                <FormField
                  control={form.control}
                  name={`rows.${index}.categoryId`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Category</FormLabel>}
                      <Select
                        disabled={loading}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleChangeCategory(value, index);
                        }}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              defaultValue={field.value}
                              placeholder="Select a category"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`rows.${index}.productId`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Product</FormLabel>}
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              defaultValue={field.value}
                              placeholder="Select a product"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(productsByRow[index] || []).map((product: any) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`rows.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Quantity</FormLabel>}
                      <FormControl>
                        <Input
                          type="number"
                          disabled={loading}
                          placeholder="Enter quantity"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  {index === 0 && <div className="mb-2">Action</div>}
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
