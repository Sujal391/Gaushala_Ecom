"use client";

import Lottie from "lottie-react";

import placed from "../animations/placed.json";
import packed from "../animations/packed.json";
import dispatched from "../animations/dispatched.json";
import delivered from "../animations/delivered.json";
import canceled from "../animations/canceled.json";

const animationMap: Record<string, any> = {
  PLACED: placed,
  PACKED: packed,
  DISPATCHED: dispatched,
  DELIVERED: delivered,
  CANCELED: canceled,
  CANCELLED: canceled,
};

// STEP 1 — scale config (TOP LEVEL)
const animationScaleMap: Record<string, number> = {
  PLACED: 1.9,
  PACKED: 1.9,
  DISPATCHED: 1.8,
  DELIVERED: 1.9,
  CANCELED: 1.1,
  CANCELLED: 1.1,
};

export default function OrderStatusAnimation({ status }: { status: string }) {
  const normalizedStatus = status?.toUpperCase();
  const animation = animationMap[normalizedStatus];
  const scale = animationScaleMap[normalizedStatus] ?? 1;

  // STEP 2 — base container size
  const BASE_SIZE = 32;

  if (!animation) return null;

  return (
    <div className="flex items-center gap-3 mt-2">
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: BASE_SIZE, height: BASE_SIZE }}
      >
        <Lottie
          animationData={animation}
          loop
          autoplay
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${scale})`,
          }}
        />
      </div>

      <p className="text-sm text-muted-foreground leading-tight">
        Your order is {status.toLowerCase()}
      </p>
    </div>
  );
}
