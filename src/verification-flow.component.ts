
import { Component, ChangeDetectionStrategy, signal, computed, WritableSignal, inject } from '@angular/core';
import { SubmissionService } from './submission.service';
import {
  Relationship,
  RELATIONSHIP_OPTIONS,
  DOCUMENT_REQUIREMENTS,
  COMMON_DOCUMENTS,
  OLD_SHENASNAME_DOCUMENT,
  HANDWRITTEN_NOTE_TEXT
} from './document-requirements';

@Component({
  selector: 'app-verification-flow',
  templateUrl: './verification-flow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationFlowComponent {
  private submissionService = inject(SubmissionService);

  currentStep: WritableSignal<number> = signal(1);
  email = signal('');
  selectedRelationship: WritableSignal<Relationship | null> = signal(null);
  hasOldShenasname: WritableSignal<boolean> = signal(false);
  files: WritableSignal<{ [key: string]: File | null }> = signal({});
  isSubmitting = signal(false);
  copied = signal(false);

  readonly isEmailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email());
  });

  readonly handwrittenNote = HANDWRITTEN_NOTE_TEXT;
  readonly relationshipOptions = RELATIONSHIP_OPTIONS;
  readonly stepTitles = ['اطلاعات اولیه', 'انتخاب کاربر', 'بارگذاری مدارک', 'بازبینی و ارسال'];
  readonly totalSteps = this.stepTitles.length;

  requiredDocs = computed(() => {
    const rel = this.selectedRelationship();
    if (!rel) return [];

    const relationshipDocs = DOCUMENT_REQUIREMENTS[rel] || [];
    const allDocs = [...COMMON_DOCUMENTS, ...relationshipDocs];

    if (this.hasOldShenasname()) {
      allDocs.push(OLD_SHENASNAME_DOCUMENT);
    }
    return allDocs;
  });
  
  allRequiredFilesUploaded = computed(() => {
    const required = this.requiredDocs();
    const uploaded = this.files();
    if (required.length === 0) return false;
    return required.every(doc => !!uploaded[doc.id]);
  });

  getRelationshipName(id: Relationship | null): string {
    if (!id) return '';
    return this.relationshipOptions.find(opt => opt.id === id)?.name || '';
  }

  nextStep(): void {
    if (this.currentStep() === 1 && !this.isEmailValid()) return;
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(val => val + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(val => val - 1);
    }
  }
  
  goToStep(step: number): void {
      if(step < this.currentStep()) {
        this.currentStep.set(step);
      }
  }

  selectRelationship(relationship: Relationship): void {
    this.selectedRelationship.set(relationship);
    this.nextStep();
  }

  toggleOldShenasname(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.hasOldShenasname.set(isChecked);
  }

  onFileChange(event: Event, docId: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.files.update(currentFiles => ({
        ...currentFiles,
        [docId]: file,
      }));
    }
  }

  removeFile(docId: string): void {
    this.files.update(currentFiles => {
      const newFiles = { ...currentFiles };
      delete newFiles[docId];
      return newFiles;
    });
  }

  getFileName(docId: string): string {
    return this.files()[docId]?.name || '';
  }
  
  copyNote(): void {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(this.handwrittenNote).then(() => {
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 2000);
        });
    }
  }

  async submit(): Promise<void> {
      if (!this.allRequiredFilesUploaded()) return;

      this.isSubmitting.set(true);
      const relationship = this.selectedRelationship();
      if (!relationship) {
          this.isSubmitting.set(false);
          return;
      }
      
      const filesToSubmit: { [key: string]: File } = {};
      for (const key in this.files()) {
        const file = this.files()[key];
        if (file) {
          filesToSubmit[key] = file;
        }
      }

      try {
        await this.submissionService.addSubmission({
            email: this.email(),
            relationship: relationship,
            hasOldShenasname: this.hasOldShenasname(),
            files: filesToSubmit
        });
        this.currentStep.set(this.totalSteps + 1); // Go to success step
      } catch (error) {
        console.error("Submission failed:", error);
        // Here you could set an error message to display to the user
      } finally {
        this.isSubmitting.set(false);
      }
  }

  startOver(): void {
    this.currentStep.set(1);
    this.email.set('');
    this.selectedRelationship.set(null);
    this.hasOldShenasname.set(false);
    this.files.set({});
  }
}
