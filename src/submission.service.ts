// src/app/services/submission.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Relationship } from './document-requirements';

// اینترفیس متناسب با دیتابیس واقعی
export interface Submission {
  id: number;
  email: string;
  relationship: Relationship;
  hasOldShenasname: boolean;
  files: { [key: string]: string }; // فایل‌ها به صورت آدرس URL از سرور می‌آیند
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Injectable({
  providedIn: 'root',
})
export class SubmissionService {
  private http = inject(HttpClient);
  
  // آدرس API بک‌اند (لوکال)
  // نکته: وقتی پروژه روی سرور رفت، باید این آدرس را به دامنه واقعی تغییر دهیم
  private apiUrl = 'http://localhost:3001/api/submissions';

  private submissionsState = signal<Submission[]>([]);
  readonly submissions = this.submissionsState.asReadonly();

  constructor() {
    // هنگام لود شدن سرویس، لیست درخواست‌ها را بگیر
    this.fetchSubmissions();
  }

  /**
   * دریافت لیست تمام درخواست‌ها از سرور برای پنل ادمین
   */
  fetchSubmissions() {
    this.http.get<Submission[]>(this.apiUrl).subscribe({
      next: (data) => this.submissionsState.set(data),
      error: (err) => console.error('Error fetching submissions:', err)
    });
  }

  /**
   * ارسال درخواست جدید به همراه فایل‌ها
   */
  addSubmission(submissionData: {
    email: string;
    relationship: Relationship;
    hasOldShenasname: boolean;
    files: { [key: string]: File };
  }): Promise<void> {
    
    // استفاده از FormData برای ارسال همزمان متن و فایل
    const formData = new FormData();
    formData.append('email', submissionData.email);
    formData.append('relationship', submissionData.relationship);
    formData.append('hasOldShenasname', submissionData.hasOldShenasname ? '1' : '0');

    // حلقه روی فایل‌ها و اضافه کردن آن‌ها به درخواست
    Object.keys(submissionData.files).forEach(key => {
      const file = submissionData.files[key];
      if (file) {
        formData.append(key, file);
      }
    });

    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl, formData).subscribe({
        next: () => {
          // بعد از ثبت موفق، لیست را رفرش کن تا ادمین هم ببیند
          this.fetchSubmissions(); 
          resolve();
        },
        error: (err) => {
          console.error('Submission failed', err);
          reject(err);
        }
      });
    });
  }

  /**
   * تغییر وضعیت درخواست (تایید یا رد)
   */
  updateStatus(id: number, status: 'Approved' | 'Rejected'): void {
    this.http.put(`${this.apiUrl}/${id}/status`, { status }).subscribe({
      next: () => {
        // آپدیت سریع وضعیت در فرانت‌اند بدون نیاز به رفرش
        this.submissionsState.update(submissions =>
          submissions.map(sub => (sub.id === id ? { ...sub, status } : sub))
        );
      },
      error: (err) => console.error('Update status failed', err)
    });
  }
}