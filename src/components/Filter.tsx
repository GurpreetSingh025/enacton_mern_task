/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import "rc-slider/assets/index.css";
import { occasionOptions } from "../../constant";
import dynamic from "next/dynamic";
import { useQueryParams } from "@/hooks/useQueryParams";

const Select = dynamic(() => import("react-select"), { ssr: false });

const discountOptions = [
  { value: "", label: "None" },
  { value: "0-5", label: "From 0% to 5%" },
  { value: "6-10", label: "From 6% to 10%" },
  { value: "11-15", label: "From 11 to 15%" },
];

function Filter({ categories, brands }) {
  const searchParams = useQueryParams();
  const router = useRouter();

  const brandsOption = useMemo(
    () =>
      brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
      })),
    [brands]
  );

  const categoriesOption = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categories]
  );

  const occasionOption = useMemo(
    () =>
      occasionOptions.map((item) => ({
        value: item,
        label: item,
      })),
    []
  );

  const [categoriesSelected, setCategoriesSelected] = useState(() => {
    const ids = searchParams.get("categoryId")?.split(",") || [];
    return ids.map((id) => {
      const match = categoriesOption.find((opt) => opt.value === +id);
      return match ? { value: match.value, label: match.label } : null;
    }).filter(Boolean);
  });

  const [selectedGender, setSelectedGender] = useState(
    searchParams.get("gender") || ""
  );

  const [sliderValue, setSliderValue] = useState(
    searchParams.get("priceRangeTo") || 2000
  );

  const [sliderChanged, setSliderChanged] = useState(false);

  const initialDiscountOptions = useMemo(() => {
    const value = searchParams.get("discount");
    if (!value) return discountOptions[0];
    const [from, to] = value.split("-");
    return { value, label: `From ${from}% to ${to}%` };
  }, []);

  const initialBrandOptions = useMemo(() => {
    const ids = searchParams.get("brandId")?.split(",") || [];
    return ids.map((id) => {
      const match = brandsOption.find((opt) => opt.value === +id);
      return match ? { value: match.value, label: match.label } : null;
    }).filter(Boolean);
  }, [brandsOption]);

  const initialOccasionOptions = useMemo(() => {
    const items = searchParams.get("occasions")?.split(",") || [];
    return items.map((item) => ({ value: item, label: item }));
  }, []);

  useEffect(() => {
    if (sliderChanged) {
      const handler = setTimeout(() => {
        searchParams.set("priceRangeTo", `${sliderValue}`);
        searchParams.delete("page");
        searchParams.delete("pageSize");
        router.push(`/products?${searchParams.toString()}`, { scroll: false });
      }, 300);

      return () => clearTimeout(handler);
    }
  }, [sliderValue]);

  function handleBrandsSelect(e) {
    const ids = e.map((item) => item.value).join(",");
    if (ids) searchParams.set("brandId", ids);
    else searchParams.delete("brandId");
    router.push(`/products?${searchParams.toString()}`, { scroll: false });
  }

  function handleCategoriesSelected(e) {
    setCategoriesSelected(e);
    const ids = e.map((item) => item.value).join(",");
    if (ids) searchParams.set("categoryId", ids);
    else searchParams.delete("categoryId");
    router.push(`/products?${searchParams.toString()}`, { scroll: false });
  }

  function handleSlider(e) {
    setSliderChanged(true);
    setSliderValue(e.target.value);
  }

  function handleGenderChange(e) {
    setSelectedGender(e.target.value);
    if (e.target.value) searchParams.set("gender", e.target.value);
    else searchParams.delete("gender");
    router.push(`/products?${searchParams.toString()}`, { scroll: false });
  }

  function handleOccasions(e) {
    const values = e.map((item) => item.value).join(",");
    if (values) searchParams.set("occasions", values);
    else searchParams.delete("occasions");
    router.push(`/products?${searchParams.toString()}`, { scroll: false });
  }

  function handleDiscount(e) {
    if (e.value) searchParams.set("discount", e.value);
    else searchParams.delete("discount");
    router.push(`/products?${searchParams.toString()}`, { scroll: false });
  }

  return (
    <div className="w-full">
      <div className="w-1/4 flex items-center gap-4 mb-4">
        <span>Brands</span>
        <Select
          className="flex-1 text-black"
          options={brandsOption}
          isMulti
          name="brands"
          onChange={handleBrandsSelect}
          defaultValue={initialBrandOptions}
        />
      </div>

      <div className="w-1/3 flex items-center gap-4 mb-4">
        <span>Categories</span>
        <MultiSelect
          className="text-black flex-1"
          options={categoriesOption}
          value={categoriesSelected as []}
          labelledBy="categories select"
          hasSelectAll={false}
          onChange={handleCategoriesSelected}
        />
      </div>

      <div>
        <span>Select products from Range 100 to 2000</span>
        <br />
        <span>Current Value {sliderValue}</span> <br />
        <input
          type="range"
          step="50"
          min="100"
          max="2000"
          value={sliderValue}
          onChange={handleSlider}
        />
      </div>

      <div>
        Select Gender: <br />
        {["", "men", "women", "boy", "girl"].map((gender) => (
          <div key={gender}>
            <input
              type="radio"
              id={gender || "none"}
              name="gender"
              value={gender}
              checked={selectedGender === gender}
              onChange={handleGenderChange}
            />
            <label htmlFor={gender || "none"}>{gender || "None"}</label>
          </div>
        ))}
      </div>

      <div className="w-1/4 flex items-center gap-4 mb-4">
        <span>Occasion</span>
        <Select
          className="flex-1 text-black"
          options={occasionOption}
          isMulti
          name="occasion"
          onChange={handleOccasions}
          defaultValue={initialOccasionOptions}
        />
      </div>

      <div className="w-1/4 flex items-center gap-4 mb-4">
        <span>Filter By discount</span>
        <Select
          className="flex-1 text-black"
          options={discountOptions}
          name="discount"
          defaultValue={initialDiscountOptions}
          onChange={handleDiscount}
        />
      </div>
    </div>
  );
}

export default Filter;
