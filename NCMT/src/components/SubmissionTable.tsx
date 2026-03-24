import type { SubmissionType } from '@/types/transit';

export interface AdminSubmissionRow {
  docId: string;
  submittedBy: string;
  type: SubmissionType;
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, unknown>;
  createdAt?: string;
}

interface SubmissionTableProps {
  submissions: AdminSubmissionRow[];
  selectedDocId: string | null;
  onSelect: (docId: string) => void;
  onApprove: (docId: string) => void;
  onReject: (docId: string) => void;
  processingDocId: string | null;
}

export default function SubmissionTable({
  submissions,
  selectedDocId,
  onSelect,
  onApprove,
  onReject,
  processingDocId,
}: SubmissionTableProps) {
  if (!submissions.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
        No pending submissions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-600">
          <tr>
            <th className="px-4 py-3 font-semibold">Submitted By</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Created</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => {
            const isSelected = selectedDocId === submission.docId;
            const isProcessing = processingDocId === submission.docId;

            return (
              <tr key={submission.docId} className={isSelected ? 'bg-emerald-50/60' : 'bg-white'}>
                <td className="px-4 py-3">{submission.submittedBy || 'Unknown'}</td>
                <td className="px-4 py-3 capitalize">{submission.type}</td>
                <td className="px-4 py-3 capitalize">{submission.status}</td>
                <td className="px-4 py-3">{submission.createdAt || 'N/A'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(submission.docId)}
                      className="rounded-md border border-gray-300 px-2 py-1 hover:bg-emerald-50"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onApprove(submission.docId)}
                      className="rounded-md bg-emerald-700 px-2 py-1 text-white disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onReject(submission.docId)}
                      className="rounded-md bg-slate-700 px-2 py-1 text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
