import { useState } from "react";
import Menus from "../../ui/Menus.jsx";
import Pagination from "../../ui/Pagination.jsx";
import Spinner from "../../ui/Spinner.jsx";
import Table from "../../ui/Table.jsx";
import BookingRow from "./BookingRow.jsx";
import BookingsOperations from "./BookingsOperations.jsx";
import useBookings from "./useBookings.js";

const columns = ["Cabin", "Guest", "Dates", "Status", "Amount", ""];
const pageSize = 10;

export default function BookingsTable() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("-startDate");
  const { data, isLoading, error } = useBookings({ filter, page, pageSize, sortBy });
  const bookings = data?.data ?? [];
  const totalResults = data?.totalResults ?? 0;
  const showPagination = totalResults > pageSize;

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter);
    setPage(1);
  }

  function handleSortChange(nextSortBy) {
    setSortBy(nextSortBy);
    setPage(1);
  }

  return (
    <>
      <BookingsOperations
        filter={filter}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        sortBy={sortBy}
      />

      {isLoading ? <Spinner label="Loading bookings" /> : null}
      {error ? <p role="alert">Could not load bookings: {error.message}</p> : null}

      {!isLoading && !error ? (
        <>
          <Menus>
            <Table>
              <Table.Header columns={columns} />

              <Table.Body>
                {bookings.map((booking) => (
                  <BookingRow booking={booking} key={booking._id ?? booking.id} />
                ))}
              </Table.Body>
            </Table>
            {showPagination ? (
              <Pagination
                currentPage={page}
                onPageChange={setPage}
                pageSize={pageSize}
                totalResults={totalResults}
              />
            ) : null}
          </Menus>
        </>
      ) : null}
    </>
  );
}
