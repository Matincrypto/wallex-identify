import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { SubmissionService, Submission } from './submission.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Relationship, RELATIONSHIP_OPTIONS } from './document-requirements';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  private submissionService = inject(SubmissionService);
  private sanitizer = inject(DomSanitizer);

  submissions = this.submissionService.submissions;
  selectedSubmissionId = signal<number | null>(null);

  selectedSubmission = computed(() => {
    const id = this.selectedSubmissionId();
    if (id === null) return null;
    return this.submissions().find(s => s.id === id) ?? null;
  });

  // FIX: Refactored to use Object.keys to ensure correct type inference for `file`.
  // `Object.entries` was incorrectly inferring the file object as `unknown`.
  selectedSubmissionFiles = computed(() => {
    const sub = this.selectedSubmission();
    if (!sub) return [];
    
    return Object.keys(sub.files).map((docId) => {
      const file = sub.files[docId];
      return {
        docId,
        file,
        isImage: file.type.startsWith('image/'),
        url: this.createSafeObjectUrl(file),
      };
    });
  });
  
  getRelationshipName(id: Relationship): string {
    return RELATIONSHIP_OPTIONS.find(opt => opt.id === id)?.name || 'ناشناخته';
  }
  
  viewDetails(submission: Submission): void {
    this.selectedSubmissionId.set(submission.id);
  }

  closeDetails(): void {
    this.selectedSubmissionId.set(null);
  }

  approve(id: number): void {
    this.submissionService.updateStatus(id, 'Approved');
    this.closeDetails();
  }

  reject(id: number): void {
    this.submissionService.updateStatus(id, 'Rejected');
    this.closeDetails();
  }
  
  private createSafeObjectUrl(file: File): SafeUrl {
    const url = URL.createObjectURL(file);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
