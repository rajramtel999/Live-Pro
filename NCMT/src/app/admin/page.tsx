'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import SubmissionTable, { type AdminSubmissionRow } from '@/components/SubmissionTable';

type RouteStopPayload = {
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  avgTimeToNextStop: number;
};

function formatCreatedAt(value: unknown): string {
  if (!value || typeof value !== 'object' || !('toDate' in value)) {
    return 'N/A';
  }

  try {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toLocaleString();
  } catch {
    return 'N/A';
  }
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<AdminSubmissionRow[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [payloadEditor, setPayloadEditor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('');

  const selectedSubmission = useMemo(
    () => submissions.find((submission) => submission.docId === selectedDocId) ?? null,
    [submissions, selectedDocId]
  );

  const loadPendingSubmissions = useCallback(async () => {
    setIsLoading(true);

    try {
      const q = query(collection(db, 'submissions'), where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const rows: AdminSubmissionRow[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;

        return {
          docId: docSnap.id,
          submittedBy: String(data.submittedBy ?? 'unknown'),
          type: (data.type as AdminSubmissionRow['type']) ?? 'stop',
          status: (data.status as AdminSubmissionRow['status']) ?? 'pending',
          payload: (data.payload as Record<string, unknown>) ?? {},
          createdAt: formatCreatedAt(data.createdAt),
        };
      });

      setSubmissions(rows);
      if (rows.length && !selectedDocId) {
        setSelectedDocId(rows[0].docId);
      }
    } catch {
      setStatusText('Could not load pending submissions.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDocId]);

  useEffect(() => {
    loadPendingSubmissions();
  }, [loadPendingSubmissions]);

  useEffect(() => {
    if (selectedSubmission) {
      setPayloadEditor(JSON.stringify(selectedSubmission.payload, null, 2));
    }
  }, [selectedSubmission]);

  const savePayloadEdit = async () => {
    if (!selectedSubmission) {
      return;
    }

    try {
      const parsed = JSON.parse(payloadEditor) as Record<string, unknown>;
      await updateDoc(doc(db, 'submissions', selectedSubmission.docId), {
        payload: parsed,
        editedAt: serverTimestamp(),
      });

      setStatusText('Payload updated.');
      await loadPendingSubmissions();
    } catch {
      setStatusText('Payload is invalid JSON or update failed.');
    }
  };

  const approveSubmission = async (docId: string) => {
    const submission = submissions.find((item) => item.docId === docId);
    if (!submission) {
      return;
    }

    setProcessingDocId(docId);
    setStatusText('Approving submission...');

    try {
      const batch = writeBatch(db);
      const submissionRef = doc(db, 'submissions', docId);
      batch.update(submissionRef, {
        status: 'approved',
        reviewedAt: serverTimestamp(),
      });

      if (submission.type === 'route') {
        const payload = submission.payload;
        const stops = Array.isArray(payload.stops) ? (payload.stops as RouteStopPayload[]) : [];
        const routeId = `route-${docId}`;

        batch.set(doc(db, 'routes', routeId), {
          id: routeId,
          name: String(payload.name ?? `Submitted Route ${docId}`),
          type: payload.type === 'tempo' ? 'tempo' : 'micro',
          startPoint: String(payload.startPoint ?? ''),
          endPoint: String(payload.endPoint ?? ''),
          isApproved: true,
          createdBy: submission.submittedBy,
        });

        stops.forEach((stop, index) => {
          const stopId = `stop-${docId}-${index + 1}`;
          const routeStopId = `rs-${docId}-${index + 1}`;

          batch.set(doc(db, 'stops', stopId), {
            id: stopId,
            name: stop.name,
            latitude: Number(stop.latitude) || 0,
            longitude: Number(stop.longitude) || 0,
          });

          batch.set(doc(db, 'routeStops', routeStopId), {
            id: routeStopId,
            routeId,
            stopId,
            order: Number(stop.order) || index + 1,
            avgTimeToNextStop: Number(stop.avgTimeToNextStop) || 0,
          });
        });
      }

      if (submission.type === 'fare') {
        const payload = submission.payload;
        const routeId = String(payload.routeId ?? '');
        const fromStopId = String(payload.fromStopId ?? '');
        const toStopId = String(payload.toStopId ?? '');
        const fareAmount = Number(payload.fareAmount ?? 0);

        if (routeId && fromStopId && toStopId && fareAmount > 0) {
          const fareId = `fare-${docId}`;
          batch.set(doc(db, 'fares', fareId), {
            id: fareId,
            routeId,
            fromStopId,
            toStopId,
            fareAmount,
          });
        }
      }

      if (submission.type === 'stop') {
        const payload = submission.payload;
        const routeId = String(payload.routeId ?? '');
        const updateNote = String(payload.updateNote ?? '');

        if (routeId && updateNote) {
          batch.set(
            doc(db, 'routes', routeId),
            {
              lastCorrectionNote: updateNote,
              lastCorrectionBy: submission.submittedBy,
              lastCorrectionAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }

      await batch.commit();
      setStatusText('Submission approved.');
      await loadPendingSubmissions();
    } catch {
      setStatusText('Approval failed.');
    } finally {
      setProcessingDocId(null);
    }
  };

  const rejectSubmission = async (docId: string) => {
    setProcessingDocId(docId);
    setStatusText('Rejecting submission...');

    try {
      await updateDoc(doc(db, 'submissions', docId), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
      });

      setStatusText('Submission rejected.');
      await loadPendingSubmissions();
    } catch {
      setStatusText('Reject action failed.');
    } finally {
      setProcessingDocId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f4] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="space-y-6">
          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-gray-600 mb-4">
              Review pending submissions and approve or reject after validating payload details.
            </p>

            {isLoading ? (
              <div className="text-sm text-gray-500">Loading submissions...</div>
            ) : (
              <SubmissionTable
                submissions={submissions}
                selectedDocId={selectedDocId}
                onSelect={setSelectedDocId}
                onApprove={approveSubmission}
                onReject={rejectSubmission}
                processingDocId={processingDocId}
              />
            )}
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Submission Detail and Edit</h2>

            {!selectedSubmission ? (
              <p className="text-sm text-gray-500">Select a submission from the table to inspect details.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Editing payload for <strong>{selectedSubmission.submittedBy}</strong> ({selectedSubmission.type})
                </p>
                <textarea
                  value={payloadEditor}
                  onChange={(event) => setPayloadEditor(event.target.value)}
                  className="min-h-56 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={savePayloadEdit}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-emerald-50"
                >
                  Save Edited Payload
                </button>
              </div>
            )}

            <p className="mt-4 text-sm text-gray-600">{statusText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
