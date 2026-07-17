"use client";

import React from "react";
import { Star, MapPin } from "lucide-react";
import Link from "next/link";

export interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  location: string;
  category: string;
}

export default function ProductCard({
  id,
  title,
  description,
  price,
  image,
  rating,
  location,
  category,
}: ProductCardProps) {
  return (
    <div className="w-full bg-background rounded-2xl shadow-sm border border-divider hover:shadow-md transition-shadow h-full flex flex-col overflow-hidden group">
      <div className="relative w-full h-[220px] overflow-hidden">
        <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-md px-2 py-1 rounded-full text-xs font-medium text-foreground">
          {category}
        </div>
        <img
          alt={title}
          className="w-full object-cover h-full transform group-hover:scale-105 transition-transform duration-500"
          src={image}
        />
      </div>
      <div className="flex-col items-start px-4 pt-4 pb-4 gap-2 flex-grow justify-between flex">
        <div className="w-full">
          <div className="flex justify-between items-start w-full mb-1">
            <h4 className="font-semibold text-lg line-clamp-1">{title}</h4>
            <div className="flex items-center gap-1 text-warning">
              <Star size={16} fill="currentColor" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <p className="text-default-500 text-sm line-clamp-2 mb-3">
            {description}
          </p>
          
          <div className="flex items-center gap-1 text-default-400 text-xs mb-4">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        </div>

        <div className="flex justify-between items-center w-full mt-auto">
          <p className="font-bold text-lg text-primary">${price.toFixed(2)}</p>
          <Link
            href={`/plants/${id}`}
            className="bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-lg text-sm hover:bg-primary/20 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
