'use client';
import {useEffect, useState} from 'react';

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

    useEffect(() => {
        fetch('/api/actions')
            .then(res => res.json())
            .then(data => {
                console.log("Fetched data:", data);
                setActions(data.actions);
                setTotalCompleted(data.totalCompleted);
            });
    }, []);

    const totalOutstanding = actions.filter(a => a.status_slug === 'outstanding').length;

    return (
        <div className="container my-5">
            <h1 className="mb-4">📋 List of Actions</h1>
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card border-warning shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="card-title text-warning">Outstanding Actions</h5>
                            <p className="display-6 fw-bold">{totalOutstanding}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-success shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="card-title text-success">Completed Actions</h5>
                            <p className="display-6 fw-bold">{totalCompleted}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead className="table-light">
                    <tr>
                        <th>Id</th>
                        <th>Business name</th>
                        <th>Process</th>
                        <th>Description</th>
                        <th>Due date/time</th>
                        <th>Completed date/time</th>
                        <th>Status</th>
                        <th>Assigned to</th>
                    </tr>
                    </thead>
                    <tbody>
                    {actions.map(action => (
                        <tr key={action.id}>
                            <td><code>#{action.id}</code></td>
                            <td>{action.business?.business_name ?? '-'}</td>
                            <td>{action.process_description ?? action.process}</td>
                            <td>{action.description}</td>
                            <td>{new Date(action.due_at).toLocaleString()}</td>
                            <td>{action.completed_at ? new Date(action.completed_at).toLocaleString() : 'N/A'}</td>
                            <td>
                              <span className="badge bg-warning text-dark">
                                {action.status_name}
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