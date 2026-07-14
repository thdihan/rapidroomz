"use client";

import React from "react";
import Link from "next/link";
import { Building2, Palmtree, Home, Building, ArrowLeft } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";

const propertyTypes = [
  {
    id: "hotel",
    name: "Hotel",
    description: "Standard accommodation with multiple rooms and services.",
    icon: Building2,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    hoverColor: "hover:border-blue-400 hover:shadow-blue-100",
  },
  {
    id: "resort",
    name: "Resort",
    description: "Luxury accommodation usually offering extensive facilities.",
    icon: Palmtree,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    hoverColor: "hover:border-emerald-400 hover:shadow-emerald-100",
  },
  {
    id: "villa",
    name: "Villa",
    description: "Private standalone house, often luxurious and secluded.",
    icon: Home,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    hoverColor: "hover:border-amber-400 hover:shadow-amber-100",
  },
  {
    id: "apartment",
    name: "Apartment",
    description: "Self-contained residential unit within a larger building.",
    icon: Building,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    hoverColor: "hover:border-purple-400 hover:shadow-purple-100",
  },
];

export default function CreatePropertySelectorPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <DashboardHeader
        title="Select Property Type"
        description="Choose the category that best describes your property to proceed with the specific listing form."
        action={
          <Link href="/dashboard/properties">
            <Button variant="outline" className="h-9 px-4 text-xs font-bold flex items-center gap-1.5">
              <ArrowLeft className="size-4" />
              Back to Properties
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {propertyTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Link key={type.id} href={`/dashboard/properties/create/${type.id}`}>
              <div
                className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group bg-white shadow-sm hover:shadow-md ${type.hoverColor} ${type.color.replace("bg-", "hover:bg-").split(" ")[0]}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl ${type.color} transition-transform group-hover:scale-105`}>
                    <Icon className="size-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground mb-1 group-hover:text-[#1b5cac] transition-colors">
                      {type.name}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
