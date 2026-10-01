import municipalitiesData from "../data/municipalities.json";

export type MunicipalityRecentCompany = {
  id: number;
  name: string;
  ico: string | null;
  establishment: string | null;
};

export type Municipality = {
  name: string;
  slug: string;
  totalCompanies: number;
  activeCompanies: number;
  recentCompanies: MunicipalityRecentCompany[];
};

const municipalities = municipalitiesData as Municipality[];

/** All precomputed municipalities, ordered by total registered companies (desc). */
export function listMunicipalities(): Municipality[] {
  return municipalities;
}

export function getMunicipality(slug: string): Municipality | undefined {
  return municipalities.find((item) => item.slug === slug);
}
