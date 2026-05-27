// Brand configurations for multi-tenant Internet Banking

export interface BrandConfig {
  id: string;
  name: string;
  shortName: string;
  logoOfficial: string;
  logoWhite: string;
  themeClass: string;
  supportPhone: string;
  supportEmail: string;
  bankCode: string;
  bankName: string;
}

export const BRANDS: Record<string, BrandConfig> = {
  g8: {
    id: "g8",
    name: "G8Pay",
    shortName: "G8",
    logoOfficial: "/logo_g8_official.png",
    logoWhite: "/logo_g8_white.png",
    themeClass: "theme-g8",
    supportPhone: "0800 888 8000",
    supportEmail: "suporte@g8pay.com.br",
    bankCode: "065",
    bankName: "G8 BANK",
  },
  galapagos: {
    id: "galapagos",
    name: "Galapagos Capital",
    shortName: "Galapagos",
    logoOfficial: "/logo_galapagos_official.svg",
    logoWhite: "/logo_galapagos_official.svg", // SVG is already white/transparent vector
    themeClass: "theme-galapagos",
    supportPhone: "0800 777 9000",
    supportEmail: "suporte@galapagoscapital.com",
    bankCode: "384",
    bankName: "GALAPAGOS BANK",
  }
};

// Active brand based on environment variable set during build time
const activeBrandKey = process.env.NEXT_PUBLIC_BRAND || "g8";
export const currentBrand = BRANDS[activeBrandKey] || BRANDS.g8;
