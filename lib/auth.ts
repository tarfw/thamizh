import { db } from "./db";

export type ConstituencyRow = {
  id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameTa: string;
  district: string;
  number: number;
  reservation?: string;
};

export type ProfileRow = {
  id: string;
  displayName: string;
  createdAt: number;
  bio?: string;
  handle?: string;
  constituency?: ConstituencyRow;
};

export function useSession() {
  const auth = db.useAuth();
  const userId = auth.user?.id;

  const profileQuery = db.useQuery(
    userId
      ? {
          profiles: {
            $: { where: { "user.id": userId } },
            constituency: {},
          },
        }
      : null,
  );

  const profile = (profileQuery.data?.profiles?.[0] ?? null) as ProfileRow | null;
  const constituency = (profile?.constituency ?? null) as ConstituencyRow | null;

  return {
    isLoading: auth.isLoading || (!!userId && profileQuery.isLoading),
    error: auth.error || profileQuery.error,
    user: auth.user ?? null,
    profile,
    constituency,
  };
}
