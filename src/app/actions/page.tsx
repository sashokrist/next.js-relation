// app/actions/page.tsx
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
  const [totalCompleted, setTotalCompleted] = useState<number>(0);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('outstanding');
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const fetchData = (
    field: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
    searchText: string = '',
    status: string = ''
  ) => {
    const params = new URLSearchParams({
      sortField: field,
      sortDirection: direction,
    });

    if (searchText.trim()) params.append('search', searchText.trim());
    if (status) params.append('status', status);

    fetch(`/api/actions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setActions(data.actions);
        setTotalCompleted(data.totalCompleted);
      });
  };

  useEffect(() => {
    fetchData(sortField, sortDirection, search, statusFilter);
  }, [sortField, sortDirection, statusFilter]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = () => {
    fetchData(sortField, sortDirection, search, statusFilter);
  };

  const totalOutstanding = actions.filter((a) => a.status_slug === 'outstanding').length;

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
              <h6 className="text-muted">Total outstanding actions</h6>
              <h2 className="text-warning fw-bold">{totalOutstanding}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-start border-4 border-success">
            <div className="card-body text-center">
              <h6 className="text-muted">Total completed actions</h6>
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
            placeholder="Enter search text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchData(sortField, sortDirection, search, statusFilter);
            }}
          />
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={handleRefresh}>
            <i className="bi bi-arrow-repeat" /> Refresh
          </button>
          <button className="btn btn-outline-secondary" onClick={() => handleSort('id')}>
            <i className="bi bi-sort-down" /> Sort by ID ({sortDirection})
          </button>
          <button className="btn btn-outline-secondary" onClick={() => setShowFilter(true)}>
            <i className="bi bi-funnel" /> Filter
          </button>
        </div>
      </div>

      {/* Slide-in Filter Panel */}
      <div className={`offcanvas offcanvas-end ${showFilter ? 'show' : ''}`} style={{ visibility: showFilter ? 'visible' : 'hidden' }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Filter</h5>
          <button type="button" className="btn-close" onClick={() => setShowFilter(false)}></button>
        </div>
        <div className="offcanvas-body">
          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value);
                setShowFilter(false); // ✅ closes the sidebar
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
              <th onClick={() => handleSort('business_name')} style={{ cursor: 'pointer' }}>Business name</th>
              <th onClick={() => handleSort('process')} style={{ cursor: 'pointer' }}>Process</th>
              <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>Description</th>
              <th onClick={() => handleSort('due_at')} style={{ cursor: 'pointer' }}>Due date/time</th>
              <th onClick={() => handleSort('completed_at')} style={{ cursor: 'pointer' }}>Completed date/time</th>
              <th>Status</th>
              <th>Assigned to</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => (
              <tr key={action.id}>
                <td><code className="text-danger">#{action.id}</code></td>
                <td>{action.business?.business_name ?? '-'}</td>
                <td>{action.process_description ?? action.process}</td>
                <td>{action.description}</td>
                <td>{new Date(action.due_at).toLocaleString()}</td>
                <td>{action.completed_at ? new Date(action.completed_at).toLocaleString() : 'N/A'}</td>
                <td>
                  <span className="badge rounded-pill bg-warning text-dark fw-semibold px-3">
                    {action.status_name ?? 'Outstanding'}
                  </span>
                </td>
                <td>
                  {action.assigned_user
                    ? `${action.assigned_user.first_name ?? ''} ${action.assigned_user.last_name ?? ''}`
                    : <span className="text-muted fst-italic">Unassigned</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
