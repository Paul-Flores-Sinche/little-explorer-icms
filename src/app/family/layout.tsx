import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Little Explorer | Family Portal",
};

export default function FamilyLayout({ children }: LayoutProps<"/family">) {
  return children;
}
