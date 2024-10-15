import { useAppDispatch, useAppSelector } from "core/hook";
import { getCountryCodeList } from "pages/manage-members/manage-members.redux";
import { useEffect, useState } from "react";

export const useCountryCodeList = () => {
  const dispatch = useAppDispatch();
  const countryCodeList = useAppSelector((state) => state.auth.countryCodeList);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (countryCodeList.length === 0) {
      setLoading(true);
      dispatch(getCountryCodeList())
        .catch((err) => {
          setError(err instanceof Error ? err : new Error("An error occurred"));
          console.error(err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, countryCodeList.length]);

  return { countryCodeList, loading, error };
};
