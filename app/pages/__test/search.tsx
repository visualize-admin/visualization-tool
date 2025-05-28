import { Suspense } from "react";

import { DebugSearch } from "@/components/debug-search";

const SearchPage = () => {
  return (
    <Suspense fallback={<div>Loading..</div>}>
      <DebugSearch />
    </Suspense>
  );
};

export default SearchPage;
