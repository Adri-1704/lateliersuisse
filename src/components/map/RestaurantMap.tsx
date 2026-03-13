"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { Restaurant } from "@/data/mock-restaurants";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RestaurantMapProps {
  restaurants: Restaurant[];
  locale: string;
  center?: [number, number];
  zoom?: number;
}

export function RestaurantMap({
  restaurants,
  locale,
  center = [46.8182, 8.2275], // Center of Switzerland
  zoom = 8,
}: RestaurantMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-xl z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {restaurants.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={defaultIcon}>
          <Popup>
            <div className="min-w-[200px]">
              <Link href={`/${locale}/restaurants/${r.slug}`} className="block">
                <h3 className="font-semibold text-gray-900 hover:text-[var(--color-just-tag)]">
                  {r.nameFr}
                </h3>
              </Link>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                {r.city}, {r.canton}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{r.avgRating}</span>
                <span className="text-gray-400">({r.reviewCount})</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{r.cuisineType}</p>
              <Link
                href={`/${locale}/restaurants/${r.slug}`}
                className="mt-2 inline-block text-xs font-medium text-[var(--color-just-tag)] hover:underline"
              >
                Voir le restaurant →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
