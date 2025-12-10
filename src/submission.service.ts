
import { Injectable, signal } from '@angular/core';
import { Relationship } from './document-requirements';

export interface Submission {
  id: number;
  email: string;
  relationship: Relationship;
  hasOldShenasname: boolean;
  files: { [key: string]: File };
  submissionDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Injectable({
  providedIn: 'root',
})
export class SubmissionService {
  // In a real application, this would not exist.
  // Data would be fetched from the backend API.
  private submissionsState = signal<Submission[]>([]);
  readonly submissions = this.submissionsState.asReadonly();

  private nextId = 1;

  /**
   * Adds a new submission.
   * In a real application, this method would make an HTTP POST request
   * to a backend endpoint, which would then insert the data into a MySQL database.
   * @param submissionData The submission data from the user form.
   */
  addSubmission(submissionData: Omit<Submission, 'id' | 'submissionDate' | 'status'>): Promise<void> {
    return new Promise(resolve => {
      // Simulate network delay
      setTimeout(() => {
        const newSubmission: Submission = {
          ...submissionData,
          id: this.nextId++,
          submissionDate: new Date(),
          status: 'Pending',
        };
        this.submissionsState.update(submissions => [...submissions, newSubmission]);
        resolve();
      }, 1500);
    });
  }

  /**
   * Updates the status of a submission.
   * In a real application, this method would make an HTTP PUT/PATCH request
   * to a backend endpoint to update the record in the MySQL database.
   * @param id The ID of the submission to update.
   * @param status The new status.
   */
  updateStatus(id: number, status: 'Approved' | 'Rejected'): void {
    this.submissionsState.update(submissions =>
      submissions.map(sub => (sub.id === id ? { ...sub, status } : sub))
    );
  }
}
