"use client";

import { basicSchema } from "@/schemas/product";
import { getCategories } from "@/actions/categoryActions";
import { getBrands } from "@/actions/brandActions";
import { postProduct, updateProductCategories } from "@/actions/productActions";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { occasionOptions } from "../../../../constant";
import Select from "react-select";
import { toast } from "react-toastify";
import { InsertProducts } from "@/types";

function AddProduct() {
  const [brandsOption, setBrandsOption] = useState([]);
  const [categoriesOption, setCategoriesOption] = useState([]);
  const [occasionOption, setOccasionOption] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const {
    values: product,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    resetForm,
  }: any = useFormik({
    initialValues: {
      name: "",
      description: "",
      old_price: "",
      discount: "",
      rating: 0,
      colors: "",
      brands: null,
      categories: null,
      gender: "men",
      occasion: null,
      image_url: "",
    },
    validationSchema: basicSchema,

    onSubmit: async (values: any, actions) => {
      try {
        const payload: any = {
          name: values.name,
          description: values.description,
          old_price: +values.old_price,
          price: values.old_price - (values.old_price * values.discount) / 100, 
          discount: +values.discount,
          rating: +values.rating,
          colors: values.colors,
          brands: JSON.stringify(values.brands.map((b) => b.value)),
          gender: values.gender,
          occasion: values.occasion.map((o) => o.value).join(","),
          image_url: values.image_url,
        };

        const result = await postProduct(payload);

        if ("error" in result) {
          toast.error(result.error);
          return;
        }

        const productId = Number(result.id);
        const categoryIds = values.categories.map((c) => c.value);
        console.log("productId : " , productId) ;
        console.log("cat id : " , categoryIds) ;
        const categoryResult = await updateProductCategories(productId, categoryIds);

        if ("error" in categoryResult) {
          toast.error(categoryResult.error);
          return;
        }

        toast.success("Product added successfully!");
        resetForm();
        router.push("/products");
      } catch (err) {
        toast.error("Something went wrong while adding the product.");
        console.error(err);
      } finally {
        actions.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    setLoading(true);
    (async function () {
      const brands = await getBrands();
      const brandsOption = brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
      }));

      const categories = await getCategories();
      const categoriesOption = categories.map((category) => ({
        value: category.id,
        label: category.name,
      }));
      const occasionOption = occasionOptions.map((item) => {
        return {
          value: item,
          label: item,
        };
      });

      setBrandsOption(brandsOption as any);
      setCategoriesOption(categoriesOption as any);
      setOccasionOption(occasionOption as any);
      setLoading(false);
    })();
  }, [setValues]);

  function handleChangeSelect(selectedOptions) {
    setValues({
      ...product,
      brands: selectedOptions.length > 0 ? selectedOptions : null,
    });
  }

  function handleOccasion(selectedOptions) {
    setValues({
      ...product,
      occasion: selectedOptions.length > 0 ? selectedOptions : null,
    });
  }

  function handleCategories(selectedOptions) {
    setValues({
      ...product,
      categories: selectedOptions.length > 0 ? selectedOptions : null,
    });
  }

  function handleFileInput(e) {
    const file = e.target.files[0];
    setValues({
      ...product,
      image_url: `/images/${file.name}`,
    });
  }

  function handleColorPicker(e) {
    setValues({
      ...product,
      colors: product.colors
        ? `${product.colors},${e.target.value}`
        : e.target.value,
    });
  }

  if (loading) return <h2 className="text-lg">Loading...</h2>;

  return (
    <div className="w-1/3 text-white">
      <h1 className="mb-8 text-xl">Add Product details</h1>
      {isSubmitting && <p className="text-lg text-yellow-200">Submitting...</p>}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name: </label>
          <input
            type="text"
            name="name"
            id="name"
            value={product.name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            placeholder="Enter name"
          />
          {errors.name && touched.name && <p className="error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description">Product description: </label>
          <textarea
            className="text-black"
            id="description"
            name="description"
            value={product.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={5}
            cols={30}
            disabled={isSubmitting}
            placeholder="Enter description"
          />
          {errors.description && touched.description && (
            <p className="error">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="old_price">Product old price: </label>
          <input
            type="number"
            name="old_price"
            placeholder="Enter old price"
            value={product.old_price}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            step={0.1}
          />
          {errors.old_price && touched.old_price && (
            <p className="error">{errors.old_price}</p>
          )}
        </div>

        <div>
          <label htmlFor="discount">Product Discount: </label>
          <input
            type="number"
            name="discount"
            id="discount"
            value={product.discount}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            step={0.1}
            placeholder="Enter product discount"
          />
          {errors.discount && touched.discount && (
            <p className="error">{errors.discount}</p>
          )}
        </div>

        <div>
          <div className="flex gap-4">
            <label htmlFor="colors">Product colors: </label>
            <input
              type="text"
              name="colors"
              id="colors"
              placeholder="Enter product colors"
              onChange={handleChange}
              disabled={isSubmitting}
              onBlur={handleBlur}
              value={product.colors}
            />
            <input type="color" id="colors" onBlur={handleColorPicker} />
          </div>
          {errors.colors && touched.colors && (
            <p className="error">{errors.colors}</p>
          )}
        </div>

        <div>
          <label htmlFor="rating">Product Rating: </label>
          <input
            type="number"
            className="text-black"
            name="rating"
            id="rating"
            min={0}
            max={5}
            value={product.rating}
            disabled={isSubmitting}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          {errors.rating && touched.rating && (
            <p className="error">{errors.rating}</p>
          )}
        </div>

        <div>
          <label htmlFor="gender">Product Gender: </label>
          <select
            className="text-black"
            name="gender"
            id="gender"
            value={product.gender}
            disabled={isSubmitting}
            onBlur={handleBlur}
            onChange={handleChange}
          >
            {["men", "boy", "women", "girl"].map((gender, i) => (
              <option key={i} value={gender}>
                {gender}
              </option>
            ))}
          </select>
          {errors.gender && touched.gender && (
            <p className="error">{errors.gender}</p>
          )}
        </div>

        <div>
          <label htmlFor="brands">Brands</label>
          <Select
            className="flex-1 text-black"
            options={brandsOption}
            isMulti
            name="brands"
            onChange={handleChangeSelect}
            onBlur={handleBlur}
            value={product.brands}
            isDisabled={isSubmitting}
          />
          {errors.brands && touched.brands && (
            <p className="error">{String(errors.brands)}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span>Occasion</span>
          <Select
            className="flex-1 text-black"
            options={occasionOption}
            isMulti
            name="occasion"
            onChange={handleOccasion}
            onBlur={handleBlur}
            isDisabled={isSubmitting}
            value={product.occasion}
          />
          {errors.occasion && touched.occasion && (
            <p className="error">{String(errors.occasion)}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span>Choose Categories</span>
          <Select
            className="flex-1 text-black"
            options={categoriesOption}
            isMulti
            name="categories"
            onChange={handleCategories}
            onBlur={handleBlur}
            isDisabled={isSubmitting}
            value={product.categories}
          />
          {errors.categories && touched.categories && (
            <p className="error">{String(errors.categories)}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="image_url">Upload an image</label>
          <input
            className="text-white"
            type="file"
            name="image_url"
            id="image_url"
            onChange={handleFileInput}
            onBlur={handleBlur}
            disabled={isSubmitting}
            accept="image/*"
          />
        </div>

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-1/2 p-4 bg-white text-black"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
