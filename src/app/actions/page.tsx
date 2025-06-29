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
  const [showFilter, setShowFilter] = useState(false);

  const fetchData = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: '10',
      sortField,
      sortDirection,
    });
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);

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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>📋 List of Actions</h5>
        <button className="btn btn-outline-success btn-sm">Help</button>
      </div>

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
                setShowFilter(false);
              }}
            >
              <option value="">All</option>
              <option value="outstanding">Outstanding</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Id</th>
              <th>Business</th>
              <th>Process</th>
              <th>Description</th>
              <th>Due</th>
              <th>Completed</th>
              <th>Status</th>
              <th>Assigned</th>
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

      <nav className="d-flex justify-content-center mt-4">
        <ul className="pagination">
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
