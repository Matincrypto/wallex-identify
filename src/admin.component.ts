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

  // --- تغییر مهم برای نمایش فایل‌های دریافتی از سرور ---
  selectedSubmissionFiles = computed(() => {
    const sub = this.selectedSubmission();
    if (!sub || !sub.files) return [];

    // تبدیل آبجکت فایل‌ها به لیستی قابل نمایش
    return Object.keys(sub.files).map((docId) => {
      const fileUrl = sub.files[docId]; // الان این یک لینک است (http://...)

      // استخراج نام فایل از انتهای لینک برای نمایش زیباتر
      const fileName = fileUrl.split('/').pop() || docId;

      // تشخیص اینکه آیا فایل عکس است یا خیر (برای نمایش دکمه پیش‌نمایش)
      const isImage = fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);

      return {
        docId,
        name: fileName,
        isImage: !!isImage,
        url: fileUrl, // لینک مستقیم برای باز کردن یا دانلود
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
}