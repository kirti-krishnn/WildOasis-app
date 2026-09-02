import { useMemo, useState } from "react";
import CabinRow from "./CabinRow.jsx";
import Table from "../../ui/Table.jsx";
import Menus from "../../ui/Menus.jsx";
import Pagination from "../../ui/Pagination.jsx";
import { filterList } from "../../utils/filter.jsx";
import { sortByOption } from "../../utils/sortBy.jsx";
import { cabinFilterOptions, cabinSortOptions } from "./cabinOptions.js";

const columns = ["", "Name", "Capacity", "Price", "Discount", ""];
const pageSize = 10;

export default function CabinTable({ cabins = [], filter = "all", sortBy = "name-asc" }) {
  const [page, setPage] = useState(1);

  const displayedCabins = useMemo(() => {
    const filteredCabins = filterList(cabins, filter, cabinFilterOptions);

    return sortByOption(filteredCabins, sortBy, cabinSortOptions);
  }, [cabins, filter, sortBy]);
  const pageStartIndex = (page - 1) * pageSize;
  const paginatedCabins = useMemo(
    () => displayedCabins.slice(pageStartIndex, pageStartIndex + pageSize),
    [displayedCabins, pageStartIndex],
  );
  const showPagination = displayedCabins.length > pageSize;

  return (
    <Menus>
      <Table>
          <Table.Header columns={columns} />

          <Table.Body>
             {paginatedCabins.map((cabin) => (
              <CabinRow
                cabin={cabin}
                key={cabin._id ?? cabin.name}
              />
            ))}
          </Table.Body>
      </Table>
      {showPagination ? (
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          pageSize={pageSize}
          totalResults={displayedCabins.length}
        />
      ) : null}
    </Menus>
  );
}
