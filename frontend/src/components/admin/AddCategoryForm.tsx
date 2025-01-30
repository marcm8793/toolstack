import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addNewCategory } from "@/lib/firebase-functions/firebaseCategoryFunctions";
import { categorySchema } from "@/validation/categorySchema";
import { CategoryFormData } from "@/validation/categorySchema";

const AddCategoryForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await addNewCategory(data.id, data.name);
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register("id")} placeholder="Category ID" />
        {errors.id && <p className="text-red-500">{errors.id.message}</p>}
      </div>
      <div>
        <Input {...register("name")} placeholder="Category Name" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Category"}
      </Button>
    </form>
  );
};

export default AddCategoryForm;
