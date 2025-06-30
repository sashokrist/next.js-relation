'use client';

import { useEffect, useState } from 'react';

interface Action {
  id: string;
  business_id?: string;
  process: string | null;
  process_description?: string;
  description: string;
  due_at: string;
  completed_at: string | null;
  status_slug: string;
  status_name?: string;
  assigned_user_id?: string;
  business: { business_name: string | null };
  assigned_user: {
    first_name: string | null;
    last_name: string | null;
    profile_picture_filename: string | null;
  } | null;
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const businessId = '1153';
  const userId = '163';

  const fetchData = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: '10',
      sortField,
      sortDirection,
      businessId,
      userId,
    });
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (assignedFilter) params.append('assigned', assignedFilter);

    const res = await fetch(`/api/actions?${params.toString()}`);
    const data = await res.json();
    setActions(data.actions);
    setTotalCompleted(data.totalCompleted);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    fetchData();
  }, [page, sortField, sortDirection, statusFilter]);

  const totalOutstanding = actions.filter((a) => a.status_slug === 'outstanding').length;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-building text-secondary bg-light p-2 rounded" />
          <div>
            <strong>Q A &amp; Z Limited</strong> <span className="text-muted">#1153</span>
          </div>
        </div>
        <div className="text-end">
          <div><strong>Test Test</strong></div>
          <small className="text-muted">User Id: #163</small>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>📋 List of Actions</h5>
        <button className="btn btn-outline-success btn-sm">Help</button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-start border-4 border-warning">
            <div className="card-body text-center">
              <h6 className="text-muted">
                <i className="fas fa-exclamation-circle text-warning me-2"></i>
                Total outstanding actions
              </h6>
              <h2 className="text-warning fw-bold">{totalOutstanding}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-start border-4 border-success">
            <div className="card-body text-center">
              <h6 className="text-muted">
                <i className="fas fa-check-circle text-success me-2"></i>
                Total completed actions
              </h6>
              <h2 className="text-success fw-bold">{totalCompleted}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Top Controls */}
      <div className="d-md-flex justify-content-between align-items-center mb-3 gap-2">
        <div className="input-group w-50">
          <span className="input-group-text bg-white">
            <i className="bi bi-search" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchData();
            }}
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={fetchData}>
            <i className="bi bi-arrow-repeat" /> Refresh
          </button>
          <button className="btn btn-outline-secondary" onClick={() => handleSort('id')}>
            <i className="bi bi-sort-down" /> Sort ID ({sortDirection})
          </button>
          <button className="btn btn-outline-secondary" onClick={() => setShowFilter(true)}>
            <i className="bi bi-funnel" /> Filter
          </button>
        </div>
      </div>

      {/* Filter Sidebar */}
      <div className={`offcanvas offcanvas-end ${showFilter ? 'show' : ''}`} style={{ visibility: showFilter ? 'visible' : 'hidden' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Filter</h5>
          <button className="btn-close" onClick={() => setShowFilter(false)}></button>
        </div>
        <div className="offcanvas-body">
          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="outstanding">Outstanding</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Assigned To</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. John, Smith"
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  setShowFilter(false);
                  fetchData();
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
          <tr>
            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Id</th>
            <th onClick={() => handleSort('business_name')} style={{ cursor: 'pointer' }}>Business</th>
            <th onClick={() => handleSort('process_description')} style={{ cursor: 'pointer' }}>Process</th>
            <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>Description</th>
            <th onClick={() => handleSort('due_at')} style={{ cursor: 'pointer' }}>Due</th>
            <th onClick={() => handleSort('completed_at')} style={{ cursor: 'pointer' }}>Completed</th>
            <th onClick={() => handleSort('status_slug')} style={{ cursor: 'pointer' }}>Status</th>
            <th onClick={() => handleSort('assigned_user_id')} style={{ cursor: 'pointer' }}>Assigned</th>
          </tr>
        </thead>
          <tbody>
            {actions.map((action) => (
              <tr key={action.id}>
                <td>#{action.id}</td>
                <td>{action.business?.business_name ?? '-'}</td>
                <td>{action.process_description ?? action.process}</td>
                <td>{action.description}</td>
                <td>{new Date(action.due_at).toLocaleString()}</td>
                <td>{action.completed_at ? new Date(action.completed_at).toLocaleString() : 'N/A'}</td>
                <td>{action.status_name}</td>
                <td>
                  {action.assigned_user
                    ? `${action.assigned_user.first_name ?? ''} ${action.assigned_user.last_name ?? ''}`
                    : 'Unassigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* Pagination */}
<nav className="d-flex justify-content-center mt-4">
  <ul className="pagination flex-wrap justify-content-center">
    {/* Previous */}
    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
      <button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
        &laquo;
      </button>
    </li>

    {/* First Page */}
    {page > 3 && (
      <>
        <li className="page-item">
          <button className="page-link" onClick={() => setPage(1)}>1</button>
        </li>
        {page > 4 && <li className="page-item disabled"><span className="page-link">...</span></li>}
      </>
    )}

    {/* Dynamic range around current page */}
    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => p >= page - 2 && p <= page + 2)
      .map((p) => (
        <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
          <button className="page-link" onClick={() => setPage(p)}>{p}</button>
        </li>
      ))}

    {/* Last Page */}
    {page < totalPages - 2 && (
      <>
        {page < totalPages - 3 && <li className="page-item disabled"><span className="page-link">...</span></li>}
        <li className="page-item">
          <button className="page-link" onClick={() => setPage(totalPages)}>{totalPages}</button>
        </li>
      </>
    )}

    {/* Next */}
    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
      <button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
        &raquo;
      </button>
    </li>
  </ul>
</nav>

    </div>
  );
}