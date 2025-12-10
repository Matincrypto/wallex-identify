import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { SubmissionService, Submission } from './submission.service';
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

  submissions = this.submissionService.submissions;
  selectedSubmissionId = signal<number | null>(null);

  selectedSubmission = computed(() => {
    const id = this.selectedSubmissionId();
    if (id === null) return null;
    return this.submissions().find(s => s.id === id) ?? null;
  });

  // --- بخش مهم: این قسمت باید برای خواندن لینک‌ها تنظیم شده باشد ---
  selectedSubmissionFiles = computed(() => {
    const sub = this.selectedSubmission();
    if (!sub || !sub.files) return [];

    // تبدیل آبجکت فایل‌ها به آرایه برای نمایش
    return Object.keys(sub.files).map((docId) => {
      const url = sub.files[docId]; // الان url یک متن است ("/uploads/...")

      // اگر url یک آبجکت بود (کد قدیمی)، تبدیل به متن کن
      const fileUrl = typeof url === 'string' ? url : '';

      // استخراج نام فایل
      const fileName = fileUrl.split('/').pop() || docId;
      const isImage = fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);

      return {
        docId,
        name: fileName,
        isImage: !!isImage,
        url: fileUrl,
      };
    });
  });
  // -------------------------------------------------------------

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
}