import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Little Explorer | Staff Portal",
};

export default function StaffLayout({ children }: LayoutProps<"/staff">) {
  return children;
}
