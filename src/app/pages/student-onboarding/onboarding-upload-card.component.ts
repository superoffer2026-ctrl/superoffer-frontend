import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StudentDocument } from '../../core/student-profile-api.service';

@Component({
  selector: 'so-upload-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="upload" [class.ready]="file || document" (dragover)="$event.preventDefault()" (drop)="drop($event)">
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" (change)="choose($event)">
      <span class="icon">{{file || document ? '✓' : '↑'}}</span>
      <span><strong>{{title}}</strong><small>{{file?.name || document?.fileName || (required ? 'Required · PDF, JPG or PNG · Max 10 MB' : 'Optional · PDF, JPG or PNG · Max 10 MB')}}</small><em *ngIf="document">{{formatSize(document.size)}} · Uploaded</em></span>
      <b>{{file || document ? 'Replace' : 'Choose file'}}</b>
    </label>
    <div class="file-actions" *ngIf="document"><button type="button" (click)="preview.emit(document)">Preview</button><button type="button" class="remove" (click)="remove.emit(document)">Remove</button></div>
  `,
  styles: [`
    .upload{min-height:116px;padding:18px;display:flex;align-items:center;gap:14px;border:1.5px dashed #d7cec5;border-radius:17px;background:#fdfbf8;cursor:pointer;transition:.22s}.upload:hover{border-color:#b9a99b;background:#faf6f1;transform:translateY(-2px)}.upload.ready{border-style:solid;border-color:#c8ded2;background:#f6fbf8}.upload input{position:absolute;width:1px;height:1px;opacity:0}.icon{width:42px;height:42px;display:grid;place-items:center;flex:0 0 auto;border-radius:13px;color:#fff;background:#2b211b;font-size:18px}.ready .icon{background:#247552}.upload>span:nth-child(3){min-width:0;flex:1}.upload strong,.upload small,.upload em{display:block}.upload strong{font-size:12px}.upload small{overflow:hidden;margin-top:5px;color:#8a8077;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.upload em{margin-top:4px;color:#287653;font-size:8px;font-style:normal}.upload>b{color:#e96c28;font-size:9px}.file-actions{display:flex;justify-content:flex-end;gap:8px;margin:-8px 10px 0}.file-actions button{padding:6px 9px;border:0;color:#4a4039;background:transparent;font:800 8px Inter;cursor:pointer}.file-actions .remove{color:#b74735}
  `]
})
export class OnboardingUploadCardComponent {
  @Input({ required: true }) title = '';
  @Input() required = false;
  @Input() file?: File;
  @Input() document?: StudentDocument;
  @Output() fileChange = new EventEmitter<File>();
  @Output() preview = new EventEmitter<StudentDocument>();
  @Output() remove = new EventEmitter<StudentDocument>();
  choose(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; if (file) this.fileChange.emit(file); }
  drop(event: DragEvent) { event.preventDefault(); const file = event.dataTransfer?.files?.[0]; if (file) this.fileChange.emit(file); }
  formatSize(size:number){ return size<1024*1024?`${Math.ceil(size/1024)} KB`:`${(size/1024/1024).toFixed(1)} MB`; }
}
